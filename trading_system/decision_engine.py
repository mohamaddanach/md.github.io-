"""
decision_engine.py
==================
The "brain" of AUTOMATIC mode, plus position sizing used by both modes.

- choose_trade()     : compares the Classic and Advanced model outputs and picks the best
                       option (or skips). Models that are losing money live get switched off.
- lots_for_risk()    : converts "risk $X if the stop-loss is hit" into a lot size.
- parse_amount()     : understands "0.05" (lots) or "$50" (risk in dollars) from Telegram.
- in_session()       : trading-hours filter.
- AutoSettings       : automatic-mode settings, saved to auto_settings.json so they
                       survive restarts.

Pure logic, no MetaTrader5 import: every function can be tested without MT5.
"""

from __future__ import annotations

import json
import math
import re
from dataclasses import asdict, dataclass, field, fields
from pathlib import Path
from typing import Optional

CLASSIC_THRESHOLD = 60.0          # Classic model fires at >= 60% (see path_matching_engine.py)
MIN_TRADES_TO_JUDGE_MODEL = 20    # live closed trades before a model can be switched off


# ======================================================================================
# Model comparison
# ======================================================================================
@dataclass
class Decision:
    action: str          # "BUY", "SELL" or "SKIP"
    model: str           # "CLASSIC", "ADVANCED", "COMBINED" or "" when skipping
    probability: float   # % probability reported for the chosen trade
    confidence: float    # 0..1, drives the position size
    sl_pips: float
    tp_pips: float
    reason: str

    def to_dict(self) -> dict:
        return asdict(self)


def model_is_disabled(stats: Optional[dict]) -> bool:
    """A model is benched once it has enough live trades AND is losing money."""
    if not stats or stats.get("total_closed", 0) < MIN_TRADES_TO_JUDGE_MODEL:
        return False
    pf = stats.get("profit_factor")
    return stats.get("pnl_usd", 0) < 0 and pf is not None and pf < 0.9


def choose_trade(
    classic_signal: str,
    classic_prob: float,
    classic_sl_pips: float,
    classic_tp_pips: float,
    adv,                                  # AdvancedSignal
    model_stats: Optional[dict] = None,   # PerformanceTracker.get_model_breakdown()
) -> Decision:
    """
    Rules:
      1. A model that is losing money live (20+ trades, PnL < 0) is ignored.
      2. Both models agree on a direction  -> COMBINED trade, highest confidence,
         Advanced SL/TP (they adapt to current volatility).
      3. Models point in opposite directions -> SKIP (conflict = no clear edge).
      4. Only one model has a signal -> trade it, confidence = how far it is above its threshold.
      5. Nothing -> SKIP.
    """
    stats = model_stats or {}
    classic_off = model_is_disabled(stats.get("CLASSIC"))
    adv_off = model_is_disabled(stats.get("ADVANCED"))

    classic_ok = classic_signal in ("BUY", "SELL") and not classic_off
    adv_ok = adv.signal in ("BUY", "SELL") and not adv_off

    classic_edge = max(0.0, min(1.0, (classic_prob - CLASSIC_THRESHOLD) / (100 - CLASSIC_THRESHOLD)))
    req = adv.required_probability
    adv_edge = max(0.0, min(1.0, (adv.probability - req) / max(1.0, 100 - req)))

    notes = []
    if classic_off:
        notes.append("Classic benched (losing live)")
    if adv_off:
        notes.append("Advanced benched (losing live)")
    summary = (f"Classic {classic_signal} {classic_prob:.0f}% | Advanced {adv.signal} {adv.probability:.0f}% "
               f"(need {req:.0f}%)")
    if notes:
        summary += " | " + ", ".join(notes)

    if classic_ok and adv_ok:
        if classic_signal != adv.signal:
            return Decision("SKIP", "", 0.0, 0.0, 0, 0, f"models disagree — {summary}")
        conf = min(1.0, 0.5 + (classic_edge + adv_edge) / 2)
        return Decision(adv.signal, "COMBINED", adv.probability, conf, adv.sl_pips, adv.tp_pips,
                        f"both models agree — {summary}")
    if adv_ok:
        return Decision(adv.signal, "ADVANCED", adv.probability, adv_edge, adv.sl_pips, adv.tp_pips,
                        f"Advanced only — {summary}")
    if classic_ok:
        return Decision(classic_signal, "CLASSIC", classic_prob, classic_edge, classic_sl_pips, classic_tp_pips,
                        f"Classic only — {summary}")
    return Decision("SKIP", "", 0.0, 0.0, 0, 0, f"no signal — {summary}")


# ======================================================================================
# Position sizing
# ======================================================================================
def pip_value_per_lot(pip: float, tick_size: float, tick_value: float) -> float:
    """Account-currency value of 1 pip for 1.00 lot (≈ $10 on EURUSD)."""
    if tick_size <= 0:
        return 0.0
    return pip / tick_size * tick_value


def normalize_lots(lots: float, vol_min: float, vol_max: float, vol_step: float) -> float:
    step = vol_step or 0.01
    lots = math.floor(lots / step + 1e-9) * step
    lots = max(vol_min, min(vol_max, lots))
    return round(lots, 8)


def lots_for_risk(risk_usd: float, sl_pips: float, pip_value: float, vol_min: float, vol_max: float,
                  vol_step: float, max_lot: float) -> tuple[float, str]:
    """
    Lot size so that hitting the stop-loss loses about `risk_usd`.
    Returns (lots, note). lots == 0 means "don't trade".
    """
    if sl_pips <= 0 or pip_value <= 0 or risk_usd <= 0:
        return 0.0, "invalid risk / stop-loss"
    raw = risk_usd / (sl_pips * pip_value)
    if raw < vol_min:
        # Minimum lot would risk more than asked; only allow if the overshoot is small (<50%)
        actual = vol_min * sl_pips * pip_value
        if actual > risk_usd * 1.5:
            return 0.0, f"${risk_usd:.2f} is too small: minimum lot {vol_min} risks ${actual:.2f}"
        return vol_min, f"rounded up to minimum lot {vol_min}"
    capped = min(raw, max_lot)
    note = f"capped at max lot {max_lot}" if raw > max_lot else ""
    return normalize_lots(capped, vol_min, vol_max, vol_step), note


def confidence_scale(confidence: float, low: float = 0.5, high: float = 1.5) -> float:
    """Confidence 0 -> half the normal risk, 1 -> 1.5x the normal risk."""
    return low + (high - low) * max(0.0, min(1.0, confidence))


_USD_RE = re.compile(r"^\$?\s*(\d+(?:\.\d+)?)\s*(\$|usd)?$", re.IGNORECASE)
_LOT_RE = re.compile(r"^(\d+(?:\.\d+)?)\s*(lots?|l)?$", re.IGNORECASE)


def parse_amount(text: str) -> Optional[tuple[str, float]]:
    """
    "0.05" / "0.05lot"      -> ("lots", 0.05)
    "$50" / "50$" / "50usd" -> ("usd", 50.0)   (= risk $50 if the stop-loss is hit)
    """
    t = text.strip().replace(",", ".")
    if t.startswith("$") or t.lower().endswith(("$", "usd")):
        m = _USD_RE.match(t)
        return ("usd", float(m.group(1))) if m else None
    m = _LOT_RE.match(t)
    return ("lots", float(m.group(1))) if m else None


def in_session(hour_utc: int, start_hour: int, end_hour: int) -> bool:
    """True if hour_utc is inside [start, end). Handles windows that cross midnight."""
    if start_hour == end_hour:
        return True
    if start_hour < end_hour:
        return start_hour <= hour_utc < end_hour
    return hour_utc >= start_hour or hour_utc < end_hour


# ======================================================================================
# Automatic-mode settings (persisted)
# ======================================================================================
@dataclass
class AutoSettings:
    enabled: bool = False
    symbols: list = field(default_factory=lambda: ["EURUSD"])
    timeframe: str = "15m"
    risk_percent: float = 0.5          # % of equity risked per trade (before confidence scaling)
    max_lot: float = 1.0
    max_spread_pips: float = 2.5
    daily_loss_limit_pct: float = 3.0  # auto switches itself OFF after losing this % in a day
    max_trades_per_day: int = 10
    session_start_utc: int = 7         # 07:00 UTC ≈ London open
    session_end_utc: int = 20          # 20:00 UTC ≈ New York afternoon
    verbose: bool = False              # also send "skip" messages to Telegram

    @classmethod
    def load(cls, path: Path) -> "AutoSettings":
        try:
            data = json.loads(Path(path).read_text(encoding="utf-8"))
            known = {f.name for f in fields(cls)}
            return cls(**{k: v for k, v in data.items() if k in known})
        except (OSError, ValueError, TypeError):
            return cls()

    def save(self, path: Path) -> None:
        Path(path).write_text(json.dumps(asdict(self), indent=2), encoding="utf-8")

    def update(self, key: str, value: str) -> str:
        """Applies one `/auto_set key value` command. Returns a confirmation or raises ValueError."""
        key = key.lower()
        v = value.strip()
        if key in ("symbols", "symbol"):
            self.symbols = [s.strip().upper() for s in v.split(",") if s.strip()]
            if not self.symbols:
                raise ValueError("give at least one symbol, e.g. EURUSD,GBPUSD")
        elif key in ("tf", "timeframe"):
            if v.lower() not in ("1m", "5m", "15m", "30m", "1h", "4h"):
                raise ValueError("timeframe must be one of 1m 5m 15m 30m 1h 4h")
            self.timeframe = v.lower()
        elif key == "risk":
            r = float(v.rstrip("%"))
            if not 0.01 <= r <= 5:
                raise ValueError("risk must be between 0.01 and 5 (% of equity)")
            self.risk_percent = r
        elif key == "maxlot":
            self.max_lot = float(v)
        elif key == "spread":
            self.max_spread_pips = float(v)
        elif key == "dailyloss":
            self.daily_loss_limit_pct = float(v.rstrip("%"))
        elif key == "maxtrades":
            self.max_trades_per_day = int(v)
        elif key == "hours":
            start, end = v.split("-")
            self.session_start_utc, self.session_end_utc = int(start) % 24, int(end) % 24
        elif key == "verbose":
            self.verbose = v.lower() in ("on", "true", "1", "yes")
        else:
            raise ValueError("unknown setting. Use: symbols, tf, risk, maxlot, spread, dailyloss, "
                             "maxtrades, hours, verbose")
        return f"{key} = {v}"

    def describe(self) -> str:
        return (f"Symbols: {', '.join(self.symbols)}\n"
                f"Timeframe: {self.timeframe}\n"
                f"Risk per trade: {self.risk_percent}% of equity (×0.5–1.5 by confidence), max {self.max_lot} lot\n"
                f"Max spread: {self.max_spread_pips} pips\n"
                f"Daily loss limit: {self.daily_loss_limit_pct}% → auto turns itself off\n"
                f"Max auto trades/day: {self.max_trades_per_day}\n"
                f"Trading hours (UTC): {self.session_start_utc:02d}:00–{self.session_end_utc:02d}:00\n"
                f"Verbose skip messages: {'on' if self.verbose else 'off'}")


if __name__ == "__main__":
    # Quick self-test (no MT5 needed)
    from types import SimpleNamespace as NS

    adv_buy = NS(signal="BUY", probability=55.0, required_probability=43.3, sl_pips=8.0, tp_pips=16.0)
    adv_sell = NS(signal="SELL", probability=50.0, required_probability=43.3, sl_pips=8.0, tp_pips=16.0)
    adv_none = NS(signal="NEUTRAL", probability=30.0, required_probability=43.3, sl_pips=8.0, tp_pips=16.0)
    print(choose_trade("BUY", 66, 15, 30, adv_buy))
    print(choose_trade("BUY", 66, 15, 30, adv_sell))
    print(choose_trade("NEUTRAL", 55, 15, 30, adv_buy))
    print(choose_trade("SELL", 70, 15, 30, adv_none))
    losing = {"CLASSIC": {"total_closed": 25, "pnl_usd": -40.0, "profit_factor": 0.6}}
    print(choose_trade("SELL", 70, 15, 30, adv_none, losing))
    print("lots for $50 risk, 20 pip SL:", lots_for_risk(50, 20, 10.0, 0.01, 100, 0.01, 1.0))
    print("lots for $1 risk, 20 pip SL:", lots_for_risk(1, 20, 10.0, 0.01, 100, 0.01, 1.0))
    for a in ("0.05", "0.1lot", "$50", "50$", "25usd", "abc"):
        print(f"parse_amount({a!r}) ->", parse_amount(a))
    print("in_session(22, 20, 6):", in_session(22, 20, 6), " in_session(12, 7, 20):", in_session(12, 7, 20))
