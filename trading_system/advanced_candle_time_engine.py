"""
advanced_candle_time_engine.py
==============================
MODEL 2 - "Advanced Model"
Multi-Feature OHLC Structural & Time-Dynamics Engine.

What it does
------------
1. Structural OHLC analysis (per candle)
   - Upper Wick Ratio   = (High - max(Open, Close)) / (High - Low)
   - Lower Wick Ratio   = (min(Open, Close) - Low) / (High - Low)
   - Real Body Ratio    = |Close - Open| / (High - Low)
   - Directional Sentiment = +1 bullish, -1 bearish, 0 doji
   - Range expansion    = (High - Low) / ATR

2. Time regulation & momentum velocity
   - Velocity           = dPrice / dTime   (close-to-close, real seconds between bars)
   - Acceleration       = change in velocity (is expansion speeding up or slowing down?)
   - Time-to-Level      = how many bars / seconds price needed to travel an N-distance
                          (N = level_distance_atr * ATR)
   - Support/Resistance = distance (in ATR) to rolling high/low and the time (bars)
                          since each level was printed

3. Predictive decision engine
   - Builds one feature vector per historical window (OHLC anatomy + time/velocity context)
   - Finds the K nearest historical windows (standardised Euclidean distance)
   - For every match, replays what happened next with the SAME SL/TP barrier logic
     (TP-before-SL = win, SL first / same-bar / timeout = loss), spread included
   - Distance-weighted BUY and SELL win probabilities -> BUY / SELL / NEUTRAL

It does not need MetaTrader 5 to run: give it a pandas DataFrame with the columns
time, open, high, low, close (exactly what mt5.copy_rates_from_pos returns).
Run this file directly to self-test it on synthetic data.
"""

from __future__ import annotations

from dataclasses import asdict, dataclass, field
from typing import Optional

import numpy as np
import pandas as pd
from numpy.lib.stride_tricks import sliding_window_view

MODEL_NAME = "ADVANCED"

# Per-candle feature columns (window part of the vector)
CANDLE_FEATURES = [
    "upper_wick_ratio",
    "lower_wick_ratio",
    "body_ratio",
    "direction",
    "range_atr",
    "velocity_norm",
    "acceleration_norm",
]

# Context feature columns (time regulation / level part of the vector, taken at the last bar)
CONTEXT_FEATURES = [
    "time_to_level_norm",
    "dist_resistance_atr",
    "dist_support_atr",
    "bars_since_high_norm",
    "bars_since_low_norm",
    "velocity_ratio",
]


@dataclass
class AdvancedConfig:
    window: int = 20                 # candles per pattern
    top_matches: int = 60            # K nearest neighbours
    horizon: int = 60                # bars allowed for the trade to hit TP or SL
    atr_period: int = 14
    level_lookback: int = 50         # bars used for rolling support / resistance
    level_distance_atr: float = 1.0  # N-distance (in ATR) for Time-to-Level
    max_level_bars: int = 120        # cap for Time-to-Level search
    doji_body_threshold: float = 0.10
    fast_velocity_span: int = 5
    slow_velocity_span: int = 20
    sl_atr_mult: float = 1.5
    reward_risk: float = 2.0         # TP = SL * reward_risk
    min_sl_pips: float = 2.0         # absolute SL floor in pips
    min_sl_spread_mult: float = 4.0  # SL is never smaller than 4x the spread (spread would eat the trade)
    min_edge: float = 0.10           # probability required above break-even
    min_matches: int = 20
    min_resolved: int = 15           # matches that must actually hit TP or SL (not time out)
    structure_weight: float = 1.0
    time_weight: float = 1.5         # extra weight on the time-regulation context
    recency_weight_min: float = 0.5  # oldest candle in the window weighted 0.5, newest 1.0


@dataclass
class AdvancedSignal:
    signal: str                          # "BUY", "SELL" or "NEUTRAL"
    probability: float                   # % win probability of the chosen side (max side if NEUTRAL)
    buy_probability: float               # %
    sell_probability: float              # %
    breakeven_probability: float         # % needed to break even at this reward:risk
    required_probability: float          # % threshold actually used (break-even + edge)
    sl_pips: float
    tp_pips: float
    matches_used: int
    avg_match_distance: float
    resolved_matches: int                # matches that hit TP or SL inside the horizon
    timeout_rate: float                  # % of matches that hit neither (ignored in the probability)
    expected_bars_to_outcome: float
    expected_seconds_to_outcome: float
    velocity_state: str                  # "ACCELERATING", "DECELERATING", "STEADY"
    velocity_pips_per_sec: float
    acceleration_pips_per_sec2: float
    time_to_level_bars: float
    time_to_level_seconds: float
    dist_to_resistance_pips: float
    dist_to_support_pips: float
    last_candle: dict = field(default_factory=dict)
    model: str = MODEL_NAME

    def to_dict(self) -> dict:
        return asdict(self)


# --------------------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------------------
def pip_size_for(point: float, digits: int) -> float:
    """1 pip = 10 points on 3/5-digit quotes (EURUSD 1.23456, USDJPY 123.456), else 1 point."""
    return point * 10 if digits in (3, 5) else point


def infer_bar_seconds(times: pd.Series) -> float:
    """Median spacing of the bars in seconds (60 for M1, 300 for M5 ...)."""
    t = pd.to_datetime(times)
    diffs = t.diff().dt.total_seconds().dropna()
    diffs = diffs[diffs > 0]
    return float(diffs.median()) if len(diffs) else 60.0


def _time_seconds(times: pd.Series) -> np.ndarray:
    t = pd.to_datetime(times)
    return (t - pd.Timestamp("1970-01-01")).dt.total_seconds().to_numpy(dtype=float)


def _true_range_atr(high: np.ndarray, low: np.ndarray, close: np.ndarray, period: int) -> np.ndarray:
    prev_close = np.roll(close, 1)
    prev_close[0] = close[0]
    tr = np.maximum.reduce([high - low, np.abs(high - prev_close), np.abs(low - prev_close)])
    atr = pd.Series(tr).ewm(alpha=1.0 / period, adjust=False, min_periods=period).mean().to_numpy()
    return atr


# --------------------------------------------------------------------------------------
# A. Structural OHLC analysis
# --------------------------------------------------------------------------------------
def compute_candle_anatomy(df: pd.DataFrame, doji_body_threshold: float = 0.10) -> pd.DataFrame:
    """Returns upper/lower wick ratios, body ratio and directional sentiment for every candle."""
    o = df["open"].to_numpy(dtype=float)
    h = df["high"].to_numpy(dtype=float)
    l = df["low"].to_numpy(dtype=float)
    c = df["close"].to_numpy(dtype=float)

    rng = h - l
    safe_rng = np.where(rng > 0, rng, np.nan)

    upper = (h - np.maximum(o, c)) / safe_rng
    lower = (np.minimum(o, c) - l) / safe_rng
    body = np.abs(c - o) / safe_rng

    # Flat candles (High == Low) have no shape: treat as a pure doji
    upper = np.nan_to_num(upper, nan=0.0)
    lower = np.nan_to_num(lower, nan=0.0)
    body = np.nan_to_num(body, nan=0.0)

    direction = np.sign(c - o)
    direction[body < doji_body_threshold] = 0.0

    return pd.DataFrame(
        {
            "upper_wick_ratio": upper,
            "lower_wick_ratio": lower,
            "body_ratio": body,
            "direction": direction,
            "range": rng,
        },
        index=df.index,
    )


# --------------------------------------------------------------------------------------
# B. Time regulation & momentum velocity
# --------------------------------------------------------------------------------------
def compute_velocity(close: np.ndarray, t_sec: np.ndarray, bar_seconds: float) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """
    Velocity = dPrice / dTime (price units per second, real elapsed time between bars so
    weekend / session gaps slow velocity down instead of looking like a crash).
    Returns (velocity, acceleration, dt_seconds).
    """
    d_price = np.diff(close, prepend=close[0])
    dt = np.diff(t_sec, prepend=t_sec[0] - bar_seconds)
    dt = np.where(dt > 0, dt, bar_seconds)
    velocity = d_price / dt
    acceleration = np.diff(velocity, prepend=velocity[0]) / dt
    return velocity, acceleration, dt


def compute_time_to_level(close: np.ndarray, distance: np.ndarray, max_bars: int) -> np.ndarray:
    """
    For every bar t: the smallest k such that |close[t] - close[t-k]| >= distance[t].
    i.e. how many bars price needed to travel the N-distance into the current bar.
    Bars that never reached it inside max_bars get max_bars + 1.
    """
    n = len(close)
    ttl = np.full(n, max_bars + 1, dtype=float)
    for k in range(1, min(max_bars, n - 1) + 1):
        moved = np.zeros(n, dtype=bool)
        moved[k:] = np.abs(close[k:] - close[:-k]) >= distance[k:]
        newly = moved & (ttl > max_bars)
        ttl[newly] = k
    return ttl


def compute_levels(high: np.ndarray, low: np.ndarray, lookback: int) -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """
    Rolling resistance (highest high) / support (lowest low) over `lookback` bars,
    plus how many bars ago each level was printed (time regulation around levels).
    """
    n = len(high)
    resistance = np.full(n, np.nan)
    support = np.full(n, np.nan)
    bars_since_high = np.full(n, np.nan)
    bars_since_low = np.full(n, np.nan)
    if n < lookback:
        return resistance, support, bars_since_high, bars_since_low

    hw = sliding_window_view(high, lookback)
    lw = sliding_window_view(low, lookback)
    resistance[lookback - 1:] = hw.max(axis=1)
    support[lookback - 1:] = lw.min(axis=1)
    # argmax returns the first occurrence; flip so the MOST RECENT touch counts
    bars_since_high[lookback - 1:] = np.argmax(hw[:, ::-1], axis=1)
    bars_since_low[lookback - 1:] = np.argmin(lw[:, ::-1], axis=1)
    return resistance, support, bars_since_high, bars_since_low


# --------------------------------------------------------------------------------------
# Feature matrix
# --------------------------------------------------------------------------------------
def build_feature_frame(df: pd.DataFrame, cfg: AdvancedConfig, pip_size: float) -> pd.DataFrame:
    """All raw + normalised features for every candle."""
    h = df["high"].to_numpy(dtype=float)
    l = df["low"].to_numpy(dtype=float)
    c = df["close"].to_numpy(dtype=float)
    t_sec = _time_seconds(df["time"])
    bar_seconds = infer_bar_seconds(df["time"])

    anatomy = compute_candle_anatomy(df, cfg.doji_body_threshold)
    atr = _true_range_atr(h, l, c, cfg.atr_period)
    safe_atr = np.where(atr > 0, atr, np.nan)

    velocity, acceleration, _ = compute_velocity(c, t_sec, bar_seconds)
    # Normalise: "how many ATRs per bar-length of time"
    velocity_norm = velocity * bar_seconds / safe_atr
    acceleration_norm = acceleration * bar_seconds * bar_seconds / safe_atr

    fast = pd.Series(np.abs(velocity_norm)).ewm(span=cfg.fast_velocity_span, adjust=False).mean().to_numpy()
    slow = pd.Series(np.abs(velocity_norm)).ewm(span=cfg.slow_velocity_span, adjust=False).mean().to_numpy()
    velocity_ratio = fast / np.where(slow > 0, slow, np.nan)

    ttl = compute_time_to_level(c, cfg.level_distance_atr * np.nan_to_num(atr, nan=np.inf), cfg.max_level_bars)
    resistance, support, bars_since_high, bars_since_low = compute_levels(h, l, cfg.level_lookback)

    feats = pd.DataFrame(index=df.index)
    feats["upper_wick_ratio"] = anatomy["upper_wick_ratio"]
    feats["lower_wick_ratio"] = anatomy["lower_wick_ratio"]
    feats["body_ratio"] = anatomy["body_ratio"]
    feats["direction"] = anatomy["direction"]
    feats["range_atr"] = np.clip(anatomy["range"].to_numpy() / safe_atr, 0, 5)
    feats["velocity_norm"] = np.clip(velocity_norm, -5, 5)
    feats["acceleration_norm"] = np.clip(acceleration_norm, -5, 5)

    feats["time_to_level_norm"] = np.log1p(ttl) / np.log1p(cfg.max_level_bars + 1)
    feats["dist_resistance_atr"] = np.clip((resistance - c) / safe_atr, 0, 10)
    feats["dist_support_atr"] = np.clip((c - support) / safe_atr, 0, 10)
    feats["bars_since_high_norm"] = bars_since_high / cfg.level_lookback
    feats["bars_since_low_norm"] = bars_since_low / cfg.level_lookback
    feats["velocity_ratio"] = np.clip(velocity_ratio, 0, 5)

    # Raw values kept for reporting
    feats["atr"] = atr
    feats["velocity_raw"] = velocity
    feats["acceleration_raw"] = acceleration
    feats["time_to_level_bars"] = ttl
    feats["resistance"] = resistance
    feats["support"] = support
    feats.attrs["bar_seconds"] = bar_seconds
    feats.attrs["pip_size"] = pip_size
    return feats


def _standardise(matrix: np.ndarray, valid_rows: np.ndarray) -> np.ndarray:
    ref = matrix[valid_rows]
    mean = ref.mean(axis=0)
    std = ref.std(axis=0)
    std[std == 0] = 1.0
    return (matrix - mean) / std


def build_pattern_vectors(feats: pd.DataFrame, cfg: AdvancedConfig) -> tuple[np.ndarray, np.ndarray]:
    """
    One vector per bar t (t = last candle of the window):
        [ window x CANDLE_FEATURES (recency weighted) | CONTEXT_FEATURES at t (time weighted) ]
    Returns (vectors, end_indices). Rows containing NaN are dropped.
    """
    candle = feats[CANDLE_FEATURES].to_numpy(dtype=float)
    context = feats[CONTEXT_FEATURES].to_numpy(dtype=float)
    valid = ~np.isnan(candle).any(axis=1) & ~np.isnan(context).any(axis=1)

    candle_z = _standardise(np.nan_to_num(candle), valid)
    context_z = _standardise(np.nan_to_num(context), valid)

    w = cfg.window
    windows = sliding_window_view(candle_z, (w, candle_z.shape[1]))[:, 0]  # (n-w+1, w, d)
    recency = np.linspace(cfg.recency_weight_min, 1.0, w)[None, :, None]
    windows = windows * recency * cfg.structure_weight
    flat = windows.reshape(windows.shape[0], -1)

    end_idx = np.arange(w - 1, len(feats))
    ctx = context_z[end_idx] * cfg.time_weight * np.sqrt(w)  # keep context comparable to w candles
    vectors = np.hstack([flat, ctx])

    # A window is valid only if every candle in it and its context is valid
    valid_windows = sliding_window_view(valid, w).all(axis=1)
    return vectors[valid_windows], end_idx[valid_windows]


# --------------------------------------------------------------------------------------
# C. Predictive decision engine
# --------------------------------------------------------------------------------------
def simulate_barrier_outcome(
    high: np.ndarray,
    low: np.ndarray,
    entry_bid: float,
    t: int,
    horizon: int,
    sl_dist: float,
    tp_dist: float,
    spread: float,
) -> tuple[bool, int, bool, int]:
    """
    Replays bars t+1 .. t+horizon (bid prices) for a BUY and a SELL opened at close[t].
    Conservative: if TP and SL fall inside the same bar, the trade is a loss.
    Returns (buy_win, buy_resolved, buy_bars, sell_win, sell_resolved, sell_bars).
    *_resolved is False when neither TP nor SL was reached inside the horizon (timeout).
    """
    fh = high[t + 1: t + 1 + horizon]
    fl = low[t + 1: t + 1 + horizon]
    n = len(fh)

    def first(mask: np.ndarray) -> int:
        idx = np.flatnonzero(mask)
        return int(idx[0]) if idx.size else n + 1

    # BUY fills at ask = bid + spread, closes on bid
    ask_entry = entry_bid + spread
    b_tp = first(fh >= ask_entry + tp_dist)
    b_sl = first(fl <= ask_entry - sl_dist)
    buy_win = b_tp < b_sl and b_tp <= n
    buy_resolved = min(b_tp, b_sl) < n
    buy_bars = min(b_tp, b_sl, n) + 1

    # SELL fills at bid, closes on ask = bid + spread
    s_tp = first(fl + spread <= entry_bid - tp_dist)
    s_sl = first(fh + spread >= entry_bid + sl_dist)
    sell_win = s_tp < s_sl and s_tp <= n
    sell_resolved = min(s_tp, s_sl) < n
    sell_bars = min(s_tp, s_sl, n) + 1

    return buy_win, buy_resolved, buy_bars, sell_win, sell_resolved, sell_bars


def predict_advanced(
    df: pd.DataFrame,
    config: Optional[AdvancedConfig] = None,
    pip_size: Optional[float] = None,
    spread_price: float = 0.0,
) -> AdvancedSignal:
    """
    Main entry point.
    df          : CLOSED candles only (drop the still-forming last bar before calling)
    pip_size    : price value of 1 pip (0.0001 for EURUSD). Guessed from price if None.
    spread_price: current spread in price units (symbol_info.spread * point)
    """
    cfg = config or AdvancedConfig()
    df = df.reset_index(drop=True)
    min_bars = cfg.window + cfg.level_lookback + cfg.horizon + cfg.top_matches + cfg.atr_period
    if len(df) < min_bars:
        raise ValueError(f"Advanced model needs at least {min_bars} candles, got {len(df)}")

    if pip_size is None:
        pip_size = 0.01 if float(df["close"].iloc[-1]) > 20 else 0.0001

    feats = build_feature_frame(df, cfg, pip_size)
    vectors, end_idx = build_pattern_vectors(feats, cfg)

    h = df["high"].to_numpy(dtype=float)
    l = df["low"].to_numpy(dtype=float)
    c = df["close"].to_numpy(dtype=float)
    atr = feats["atr"].to_numpy()
    bar_seconds = feats.attrs["bar_seconds"]
    last = len(df) - 1

    if end_idx.size == 0 or end_idx[-1] != last:
        raise ValueError("Latest window has invalid features (not enough clean history).")

    current = vectors[-1]
    # Candidates must have a full horizon of known future BEFORE the current bar -> no look-ahead
    cand_mask = end_idx <= last - cfg.horizon - 1
    cand_vectors = vectors[cand_mask]
    cand_idx = end_idx[cand_mask]
    if cand_idx.size < cfg.min_matches:
        raise ValueError("Not enough historical windows to compare against.")

    distances = np.linalg.norm(cand_vectors - current, axis=1)
    k = min(cfg.top_matches, distances.size)
    top = np.argpartition(distances, k - 1)[:k]
    top = top[np.argsort(distances[top])]

    min_sl_price = max(cfg.min_sl_pips * pip_size, cfg.min_sl_spread_mult * spread_price)
    weights, buy_wins, sell_wins, buy_res, sell_res, buy_bars, sell_bars = [], [], [], [], [], [], []
    for j in top:
        t = int(cand_idx[j])
        sl_d = max(cfg.sl_atr_mult * atr[t], min_sl_price)
        tp_d = sl_d * cfg.reward_risk
        bw, br, bb, sw, sr, sb = simulate_barrier_outcome(h, l, c[t], t, cfg.horizon, sl_d, tp_d, spread_price)
        weights.append(1.0 / (distances[j] + 1e-9))
        buy_wins.append(bw)
        sell_wins.append(sw)
        buy_res.append(br)
        sell_res.append(sr)
        buy_bars.append(bb)
        sell_bars.append(sb)

    w = np.asarray(weights)
    w = w / w.sum()

    # Probability = TP-first among the matches that were decided (TP or SL hit).
    # Matches that timed out say nothing about direction, so they are left out.
    def resolved_prob(wins: list, resolved: list) -> tuple[float, int]:
        mask = np.asarray(resolved, dtype=bool)
        if not mask.any():
            return 0.0, 0
        return float(np.dot(w[mask], np.asarray(wins)[mask]) / w[mask].sum()) * 100, int(mask.sum())

    buy_prob, buy_resolved = resolved_prob(buy_wins, buy_res)
    sell_prob, sell_resolved = resolved_prob(sell_wins, sell_res)

    breakeven = 100.0 / (1.0 + cfg.reward_risk)
    required = breakeven + cfg.min_edge * 100

    if k < cfg.min_matches:
        signal, prob = "NEUTRAL", max(buy_prob, sell_prob)
    elif buy_prob >= required and buy_prob > sell_prob and buy_resolved >= cfg.min_resolved:
        signal, prob = "BUY", buy_prob
    elif sell_prob >= required and sell_prob > buy_prob and sell_resolved >= cfg.min_resolved:
        signal, prob = "SELL", sell_prob
    else:
        signal, prob = "NEUTRAL", max(buy_prob, sell_prob)

    exp_bars = float(np.dot(w, sell_bars if signal == "SELL" else buy_bars))
    side_resolved = sell_res if signal == "SELL" else buy_res
    resolved_count = sell_resolved if signal == "SELL" else buy_resolved

    # Current trade sizing (same rule used in the historical replay)
    sl_now = max(cfg.sl_atr_mult * atr[last], min_sl_price)
    tp_now = sl_now * cfg.reward_risk

    # Velocity state from fast vs slow speed of the market
    ratio = float(feats["velocity_ratio"].iloc[-1])
    if ratio >= 1.15:
        v_state = "ACCELERATING"
    elif ratio <= 0.85:
        v_state = "DECELERATING"
    else:
        v_state = "STEADY"

    last_row = feats.iloc[-1]
    ttl_bars = float(last_row["time_to_level_bars"])
    return AdvancedSignal(
        signal=signal,
        probability=round(prob, 2),
        buy_probability=round(buy_prob, 2),
        sell_probability=round(sell_prob, 2),
        breakeven_probability=round(breakeven, 2),
        required_probability=round(required, 2),
        sl_pips=round(sl_now / pip_size, 1),
        tp_pips=round(tp_now / pip_size, 1),
        matches_used=int(k),
        avg_match_distance=round(float(distances[top].mean()), 4),
        resolved_matches=resolved_count,
        timeout_rate=round((1 - float(np.mean(side_resolved))) * 100, 1),
        expected_bars_to_outcome=round(exp_bars, 1),
        expected_seconds_to_outcome=round(exp_bars * bar_seconds, 0),
        velocity_state=v_state,
        velocity_pips_per_sec=round(float(last_row["velocity_raw"]) / pip_size, 5),
        acceleration_pips_per_sec2=round(float(last_row["acceleration_raw"]) / pip_size, 7),
        time_to_level_bars=ttl_bars,
        time_to_level_seconds=round(ttl_bars * bar_seconds, 0),
        dist_to_resistance_pips=round(float(last_row["resistance"] - c[last]) / pip_size, 1),
        dist_to_support_pips=round(float(c[last] - last_row["support"]) / pip_size, 1),
        last_candle={
            "upper_wick_ratio": round(float(last_row["upper_wick_ratio"]), 3),
            "lower_wick_ratio": round(float(last_row["lower_wick_ratio"]), 3),
            "body_ratio": round(float(last_row["body_ratio"]), 3),
            "direction": int(last_row["direction"]),
        },
    )


# --------------------------------------------------------------------------------------
# Optional MT5 helper (only used if you run this engine on its own)
# --------------------------------------------------------------------------------------
def fetch_closed_candles(symbol: str = "EURUSD", timeframe=None, count: int = 30000) -> Optional[pd.DataFrame]:
    """Downloads candles from MT5 and drops the still-forming last bar."""
    import MetaTrader5 as mt5

    if timeframe is None:
        timeframe = mt5.TIMEFRAME_M1
    if not mt5.initialize():
        print("❌ MT5 connection failed.")
        return None
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, count + 1)
    if rates is None or len(rates) < 2:
        print("❌ Failed to pull historical rates.")
        return None
    df = pd.DataFrame(rates)
    df["time"] = pd.to_datetime(df["time"], unit="s")
    return df.iloc[:-1].reset_index(drop=True)


def _synthetic_candles(n: int = 6000, seed: int = 7) -> pd.DataFrame:
    """Random-walk M1 EURUSD-like candles for testing without MT5."""
    rng = np.random.default_rng(seed)
    close = 1.10 + np.cumsum(rng.normal(0, 0.00012, n))
    open_ = np.concatenate([[close[0]], close[:-1]])
    wick = np.abs(rng.normal(0, 0.00008, (n, 2)))
    high = np.maximum(open_, close) + wick[:, 0]
    low = np.minimum(open_, close) - wick[:, 1]
    time = pd.date_range("2026-01-05", periods=n, freq="1min")
    return pd.DataFrame({"time": time, "open": open_, "high": high, "low": low, "close": close})


if __name__ == "__main__":
    import time as _time

    data = _synthetic_candles()
    start = _time.perf_counter()
    result = predict_advanced(data, pip_size=0.0001, spread_price=0.00008)
    elapsed = _time.perf_counter() - start
    print(f"Advanced Model self-test on {len(data)} synthetic candles ({elapsed:.2f}s)")
    for key, value in result.to_dict().items():
        print(f"  {key:30s}: {value}")
