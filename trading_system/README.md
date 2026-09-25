# Multi-Model MT5 Trading System

MetaTrader 5 execution + Python quant engines + Telegram remote control + PyQt6 dashboard.

| File | Purpose |
|---|---|
| `path_matching_engine.py` | Model 1 – Classic: Euclidean path matching on closes |
| `advanced_candle_time_engine.py` | Model 2 – Advanced: OHLC anatomy + velocity/time-to-level + SL/TP barrier replay |
| `performance_tracker.py` | SQLite deal log, win/loss, PnL ($/pips), per-model stats, JSON export |
| `trading_gui.py` | PyQt6 floating dashboard (`python trading_gui.py` = preview with fake data) |
| `main.py` | MT5 execution, Telegram bot, GUI launcher, chart tagging |
| `mql5/ModelTagPlotter.mq5` | MT5 indicator that draws `[CLASSIC MODEL]` / `[ADVANCED MODEL]` arrows on the chart |

## Setup (Windows, PyCharm)
1. `pip install -r requirements.txt`
2. Copy `.env.example` to `.env` and fill in `TELEGRAM_TOKEN` and `TELEGRAM_ALLOWED_CHAT_IDS`.
3. MT5 open and logged in (demo), **Algo Trading** button green.
4. `python main.py` (GUI) or `python main.py --no-gui` (VPS).
5. Optional chart tags: copy `mql5/ModelTagPlotter.mq5` to `MQL5/Indicators`, compile (F7), attach to the chart.

Telegram: `/trade_classic 1m EURUSD`, `/trade_advanced 5m`, `/stats`, `/positions`, `/balance`, `/price`, `/export`, `/gui`, `/myid`.

**Demo accounts only until the models have been forward-tested.** Historical pattern win rates are not guaranteed live results.
