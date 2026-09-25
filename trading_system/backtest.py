"""
backtest.py
===========
Measures the REAL historical accuracy of the Classic model, the Advanced model and the
automatic decision (both combined), using the same code the live bot uses.

How it works (walk-forward, no peeking into the future):
  - Go back in history to a test point.
  - Give each model ONLY the candles before that point.
  - If it signals, replay the next candles with its SL/TP (spread included):
        TP first = WIN, SL first = LOSS, neither in time = TIMEOUT (closed at market).
  - Move forward `step` candles and repeat.

Run (MT5 must be open):
    python backtest.py                      # EURUSD 15m, 150 test points
    python backtest.py EURUSD 1h 200
    python backtest.py --synthetic          # no MT5 needed, fake random data (demo only)

Results are printed and saved to backtest_results.csv.
"""

from __future__ import annotations

import csv
import sys
import time
from collections import defaultdict

import numpy as np
import pandas as pd

from advanced_candle_time_engine import AdvancedConfig, pip_size_for, predict_advanced, simulate_barrier_outcome
from decision_engine import choose_trade
from path_matching_engine import predict_market_direction

CLASSIC_SL_PIPS = 15.0
CLASSIC_TP_PIPS = 30.0
HORIZON = 200          # candles a trade may stay open before it is closed at market
STEP = 10              # candles between test points (avoids counting the same move twice)
HISTORY = 6000         # candles each model sees at every test point

TF_MINUTES = {"1m": 1, "5m": 5, "15m": 15, "30m": 30, "1h": 60, "4h": 240}


def load_mt5(symbol: str, tf_key: str, count: int):
    import MetaTrader5 as mt5

    tf_map = {"1m": mt5.TIMEFRAME_M1, "5m": mt5.TIMEFRAME_M5, "15m": mt5.TIMEFRAME_M15,
              "30m": mt5.TIMEFRAME_M30, "1h": mt5.TIMEFRAME_H1, "4h": mt5.TIMEFRAME_H4}
    if not mt5.initialize():
        sys.exit(f"MT5 initialize failed: {mt5.last_error()}  (is MetaTrader 5 open?)")
    if not mt5.symbol_select(symbol, True):
        sys.exit(f"Symbol {symbol} not found in MT5")
    info = mt5.symbol_info(symbol)
    rates = mt5.copy_rates_from_pos(symbol, tf_map[tf_key], 0, count + 1)
    if rates is None or len(rates) < 1000:
        sys.exit(f"Not enough history from MT5 ({0 if rates is None else len(rates)} candles)")
    df = pd.DataFrame(rates)
    df["time"] = pd.to_datetime(df["time"], unit="s")
    pip = pip_size_for(info.point, info.digits)
    spread = info.spread * info.point
    mt5.shutdown()
    return df.iloc[:-1].reset_index(drop=True), pip, spread


def synthetic(count: int, tf_key: str):
    rng = np.random.default_rng(42)
    close = 1.10 + np.cumsum(rng.normal(0, 0.0003, count))
    open_ = np.r_[close[0], close[:-1]]
    w = np.abs(rng.normal(0, 0.0002, (count, 2)))
    df = pd.DataFrame({"time": pd.date_range("2024-01-01", periods=count, freq=f"{TF_MINUTES[tf_key]}min"),
                       "open": open_, "high": np.maximum(open_, close) + w[:, 0],
                       "low": np.minimum(open_, close) - w[:, 1], "close": close})
    return df, 0.0001, 0.00008


def replay(df: pd.DataFrame, t: int, side: str, sl_pips: float, tp_pips: float, pip: float, spread: float):
    """Returns (outcome, pips) for a trade opened at the close of candle t."""
    h = df["high"].to_numpy()
    l = df["low"].to_numpy()
    c = df["close"].to_numpy()
    bw, br, _, sw, sr, _ = simulate_barrier_outcome(h, l, c[t], t, HORIZON, sl_pips * pip, tp_pips * pip, spread)
    win, resolved = (bw, br) if side == "BUY" else (sw, sr)
    if resolved:
        return ("WIN", tp_pips) if win else ("LOSS", -sl_pips)
    end = min(t + HORIZON, len(c) - 1)
    move = (c[end] - (c[t] + spread)) if side == "BUY" else ((c[t]) - (c[end] + spread))
    return "TIMEOUT", move / pip


def run(symbol: str, tf_key: str, tests: int, use_synthetic: bool) -> None:
    needed = HISTORY + tests * STEP + HORIZON + 1
    if use_synthetic:
        df, pip, spread = synthetic(needed, tf_key)
    else:
        df, pip, spread = load_mt5(symbol, tf_key, needed)
    n = len(df)
    history = HISTORY
    if n < needed:
        history = max(1500, n - tests * STEP - HORIZON - 1)
        tests = max(10, (n - history - HORIZON - 1) // STEP)
        print(f"⚠️ Only {n} candles available: using {history} history candles and {tests} test points")

    print(f"Backtest {symbol} {tf_key}: {tests} test points, {history} candles of history each, "
          f"spread {spread / pip:.1f} pips\n")
    first_t = n - HORIZON - 1 - (tests - 1) * STEP
    rows = []
    results = defaultdict(list)       # strategy -> list of (outcome, pips)
    started = time.time()

    for i in range(tests):
        t = first_t + i * STEP
        hist = df.iloc[t - history + 1: t + 1].reset_index(drop=True)
        c_sig, c_prob = predict_market_direction(hist, 30, 50, 10)
        adv = predict_advanced(hist, AdvancedConfig(), pip, spread)
        decision = choose_trade(c_sig, c_prob, CLASSIC_SL_PIPS, CLASSIC_TP_PIPS, adv)

        candidates = {
            "CLASSIC": (c_sig, CLASSIC_SL_PIPS, CLASSIC_TP_PIPS),
            "ADVANCED": (adv.signal, adv.sl_pips, adv.tp_pips),
            "AUTO (both)": (decision.action, decision.sl_pips, decision.tp_pips),
        }
        for name, (side, sl, tp) in candidates.items():
            if side not in ("BUY", "SELL"):
                continue
            outcome, pips = replay(df, t, side, sl, tp, pip, spread)
            results[name].append((outcome, pips, sl, tp))
            rows.append({"time": df["time"].iloc[t], "strategy": name, "side": side, "sl_pips": sl,
                         "tp_pips": tp, "outcome": outcome, "pips": round(pips, 1)})

        if (i + 1) % 10 == 0 or i + 1 == tests:
            eta = (time.time() - started) / (i + 1) * (tests - i - 1)
            print(f"\r  progress {i + 1}/{tests}  (≈{eta:.0f}s left)   ", end="", flush=True)
    print("\n")

    header = f"{'Strategy':<13}{'Trades':>7}{'Wins':>6}{'Losses':>7}{'Timeout':>8}{'Win%':>7}{'Need%':>7}" \
             f"{'Pips':>9}{'PF':>6}  Verdict"
    print(header)
    print("-" * len(header))
    for name in ("CLASSIC", "ADVANCED", "AUTO (both)"):
        res = results.get(name, [])
        wins = sum(1 for r in res if r[0] == "WIN")
        losses = sum(1 for r in res if r[0] == "LOSS")
        timeouts = sum(1 for r in res if r[0] == "TIMEOUT")
        pips = sum(r[1] for r in res)
        gross_win = sum(r[1] for r in res if r[1] > 0)
        gross_loss = -sum(r[1] for r in res if r[1] < 0)
        pf = gross_win / gross_loss if gross_loss else float("inf") if gross_win else 0.0
        win_rate = wins / (wins + losses) * 100 if wins + losses else 0.0
        need = np.mean([r[2] / (r[2] + r[3]) * 100 for r in res]) if res else 0.0
        if len(res) < 20:
            verdict = "too few trades to judge"
        elif pips > 0 and pf >= 1.2:
            verdict = "✅ shows an edge (confirm on demo)"
        elif pips > 0:
            verdict = "⚠️ slightly positive, not reliable"
        else:
            verdict = "❌ no edge - do not automate"
        pf_txt = "∞" if pf == float("inf") else f"{pf:.2f}"
        print(f"{name:<13}{len(res):>7}{wins:>6}{losses:>7}{timeouts:>8}{win_rate:>6.1f}%{need:>6.1f}%"
              f"{pips:>+9.1f}{pf_txt:>6}  {verdict}")

    print("\nWin% = wins / (wins + losses).  Need% = win rate required to break even at that SL:TP.")
    print("A strategy is only useful if Win% is clearly above Need% AND total pips are positive.")

    with open("backtest_results.csv", "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["time", "strategy", "side", "sl_pips", "tp_pips", "outcome", "pips"])
        writer.writeheader()
        writer.writerows(rows)
    print("Every simulated trade saved to backtest_results.csv")


if __name__ == "__main__":
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    symbol = args[0].upper() if len(args) > 0 else "EURUSD"
    tf = args[1].lower() if len(args) > 1 else "15m"
    n_tests = int(args[2]) if len(args) > 2 else 150
    if tf not in TF_MINUTES:
        sys.exit("timeframe must be one of 1m 5m 15m 30m 1h 4h")
    run(symbol, tf, n_tests, "--synthetic" in sys.argv)
