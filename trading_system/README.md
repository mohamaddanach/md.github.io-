# KairosFX — Multi-Model Algorithmic Trading System

> *Kairos* (Greek: "the right moment"). A research and execution platform that asks one question
> honestly: **is this the right moment to trade — and can we prove it?**

KairosFX connects **MetaTrader 5** (execution), **Python** (quant models, risk, backtesting),
**Telegram** (remote control) and a **PyQt6 dashboard** (live monitoring) into one closed-loop system
with a manual side and an automatic side.

**Result:** the engineering works end to end. The walk-forward backtester showed the two prediction
models have **no statistical edge** on EURUSD (win rate 30–34 % vs 33.3 % break-even across timeframes),
so automatic trading was deliberately **not** put into production. Proving a hypothesis wrong with data
before risking money was the outcome.

---

## Architecture

```
                 ┌──────────────── Telegram (phone) ─────────────────┐
                 │ /buy /sell /close  /auto_on /auto_off /panic /menu│
                 └───────────────────────┬───────────────────────────┘
                                         │ python-telegram-bot (asyncio)
┌───────────── PyQt6 dashboard ─────┐    ▼
│ probability card, positions,      │  ┌──────────────── TradingController (asyncio thread) ───────────┐
│ win/loss, PnL, model breakdown    │◄─┤  manual_order · run_model · auto_loop · monitor_loop           │
└───────────── (main thread) ───────┘  │         │                  │                   │               │
          Qt signals (thread-safe)     │         ▼                  ▼                   ▼               │
                                       │  Model engines      decision_engine      PerformanceTracker    │
                                       │  • Classic (path)   • compare models     • SQLite deal log     │
                                       │  • Advanced (OHLC   • risk-based lots    • win rate / PnL      │
                                       │    + time/velocity) • session/spread/    • per-model stats     │
                                       │                       daily-loss guards                        │
                                       └──────────────────────────┬─────────────────────────────────────┘
                                                                  │ single-thread MT5 worker
                                                                  ▼
                                                    MetaTrader 5 terminal ──► broker
                                                    (+ ModelTagPlotter.mq5 draws model tags on chart)

 Offline:  backtest.py  → walk-forward replay of the SAME model + decision code on historical data
```

## Components

| File | Role |
|---|---|
| `path_matching_engine.py` | **Classic model** – normalises the last 30 closes, finds the 50 most similar historical paths (Euclidean distance) and votes on direction. |
| `advanced_candle_time_engine.py` | **Advanced model** – candle anatomy (wick/body ratios, direction), ATR-normalised range, velocity and acceleration (ΔPrice/ΔTime), time-to-level, support/resistance context; k-nearest-neighbour search; each neighbour is replayed with a TP/SL **triple-barrier** including spread. |
| `decision_engine.py` | **Automatic brain** – agree → combined trade, disagree → skip, one signal → smaller trade; benches models that lose live; converts "$ risk" into lots; trading-hours filter; persisted settings. |
| `performance_tracker.py` | SQLite ledger: every deal with model, probability, SL/TP, exit, PnL ($, pips); detects closes from MT5 deal history; JSON export. |
| `main.py` | Orchestration: MT5 worker thread, Telegram commands and buttons, manual orders, automatic loop, monitoring, GUI launch, chart tagging. |
| `trading_gui.py` | PyQt6 always-on-top dashboard fed only through Qt signals. |
| `backtest.py` | Walk-forward backtester: no look-ahead, spread included, WIN / LOSS / TIMEOUT accounting, verdict per strategy. |
| `mql5/ModelTagPlotter.mq5` | MT5 indicator drawing `[CLASSIC MODEL]` / `[ADVANCED MODEL]` arrows and SL/TP marks. |

## Key engineering decisions

- **One dedicated thread for all MT5 calls** – the MetaTrader5 Python API is not thread-safe.
- **asyncio + Qt in separate threads** – the Telegram bot and trading loops never block the UI; the UI never touches MT5.
- **Risk first** – stop-loss on every order, lots computed from risk in dollars, max-lot cap, max open positions,
  spread and session filters, daily loss limit that switches automation off, one-tap `/panic`.
- **Security** – bot token in `.env` (git-ignored), chat-ID allowlist for every trading command.
- **Honest validation** – the backtester reuses the live model code, only sees past candles, charges the spread,
  and was sanity-checked against random entries (≈32 % vs the theoretical 33 % at 1:2 reward:risk).

## Results

| Timeframe (EURUSD) | Classic win % | Advanced win % | Break-even | Verdict |
|---|---|---|---|---|
| 5m (1 000 test points) | 31.6 % | 32.2 % | 33.3 % | no reliable edge |
| 15m | 31.6 % | 30.3 % | 33.3 % | no edge |
| 1h | 26.0 % | 30.2 % | 33.3 % | negative |

An early 150-point 5m test looked profitable (44–56 % win rate) but covered only about one trading week;
the larger test showed it was noise. Lesson: small samples lie, and validation must come before automation.

## Limitations and next steps

- Price-only pattern matching on a highly efficient market; next research should start from hypotheses with an
  economic rationale (trend following on higher timeframes, volatility breakouts, macro/news filters).
- Bar-level backtest (intrabar order unknown), fixed spread, no commission or slippage model yet.
- No automated test suite / CI yet; Windows-only because of the MT5 terminal.

## Running it

1. `pip install -r requirements.txt`, copy `.env.example` to `.env`, add the Telegram token and your chat ID.
2. Open MT5 (demo account) with **Algo Trading** enabled.
3. `python main.py` (dashboard + Telegram) or `python main.py --no-gui`.
4. `python backtest.py EURUSD 15m 150` to evaluate the models.

**Educational project. Demo accounts only.**
