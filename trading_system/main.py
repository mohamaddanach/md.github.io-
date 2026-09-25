"""
main.py  (v2 - multi-model)
===========================
Integrated controller for the 24/7 multi-model trading system.

- MetaTrader 5 execution (all MT5 calls run on ONE dedicated worker thread - the MT5
  Python API is not thread-safe)
- Classic Model  (path_matching_engine.py)          -> /trade_classic
- Advanced Model (advanced_candle_time_engine.py)   -> /trade_advanced
- PerformanceTracker (SQLite) records every deal and detects closes from MT5 history
- PyQt6 floating dashboard (trading_gui.py) - optional, disable with --no-gui on a VPS
- MT5 chart tagging: order comment "[CLASSIC] 64%" / "[ADVANCED] 71%" + a CSV feed that the
  ModelTagPlotter.mq5 indicator draws as arrows + "[CLASSIC MODEL]" text on the chart

Configuration comes from environment variables or a `.env` file next to this script
(see .env.example). NEVER hard-code the Telegram token in source code.

Run:
    python main.py            # GUI + Telegram bot
    python main.py --no-gui   # headless (VPS / server)
"""

from __future__ import annotations

import argparse
import asyncio
import csv
import functools
import html
import logging
import os
import sys
import threading
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime, timezone
from pathlib import Path
from typing import Awaitable, Callable, Optional

import MetaTrader5 as mt5
import pandas as pd
from telegram import Update
from telegram.constants import ParseMode
from telegram.ext import Application, ApplicationBuilder, CommandHandler, ContextTypes
from telegram.request import HTTPXRequest

from advanced_candle_time_engine import AdvancedConfig, pip_size_for, predict_advanced
from path_matching_engine import predict_market_direction
from performance_tracker import PerformanceTracker

BASE_DIR = Path(__file__).resolve().parent


# ======================================================================================
# CONFIGURATION
# ======================================================================================
def load_env_file(path: Path) -> None:
    """Minimal .env loader (KEY=VALUE per line). Real environment variables win."""
    if not path.exists():
        return
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        key, value = line.split("=", 1)
        os.environ.setdefault(key.strip(), value.strip().strip('"').strip("'"))


load_env_file(BASE_DIR / ".env")

TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "")
ALLOWED_CHAT_IDS = {int(x) for x in os.environ.get("TELEGRAM_ALLOWED_CHAT_IDS", "").split(",") if x.strip()}
DEFAULT_SYMBOL = os.environ.get("DEFAULT_SYMBOL", "EURUSD").upper()
MT5_PATH = os.environ.get("MT5_PATH", "")
LOT_SIZE = float(os.environ.get("LOT_SIZE", "0.01"))
MAX_OPEN_POSITIONS = int(os.environ.get("MAX_OPEN_POSITIONS", "3"))
HISTORY_BARS = int(os.environ.get("HISTORY_BARS", "30000"))
CLASSIC_SL_PIPS = float(os.environ.get("CLASSIC_SL_PIPS", "15"))
CLASSIC_TP_PIPS = float(os.environ.get("CLASSIC_TP_PIPS", "30"))
MONITOR_INTERVAL_SEC = float(os.environ.get("MONITOR_INTERVAL_SEC", "3"))
MAGIC_NUMBER = 100200
DB_PATH = BASE_DIR / "trading_performance.db"
CHART_TAG_FILE = "model_tags.csv"   # written to <MT5 common data>/Files/

if not MT5_PATH:
    for candidate in (r"C:\Program Files\MetaTrader 5\terminal64.exe",
                      r"C:\Program Files (x86)\MetaTrader 5\terminal64.exe"):
        if os.path.exists(candidate):
            MT5_PATH = candidate
            break

TIMEFRAMES = {
    "1m": (mt5.TIMEFRAME_M1, "1 Minute"),
    "5m": (mt5.TIMEFRAME_M5, "5 Minutes"),
    "15m": (mt5.TIMEFRAME_M15, "15 Minutes"),
    "30m": (mt5.TIMEFRAME_M30, "30 Minutes"),
    "1h": (mt5.TIMEFRAME_H1, "1 Hour"),
    "4h": (mt5.TIMEFRAME_H4, "4 Hours"),
}
TF_ALIASES = {"1": "1m", "5": "5m", "15": "15m", "30": "30m", "60": "1h", "h1": "1h", "h4": "4h", "240": "4h"}

MODEL_LABELS = {"CLASSIC": "[CLASSIC MODEL]", "ADVANCED": "[ADVANCED MODEL]"}

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-7s %(name)s: %(message)s",
    handlers=[logging.StreamHandler(sys.stdout),
              logging.FileHandler(BASE_DIR / "trading_bot.log", encoding="utf-8")],
)
logging.getLogger("httpx").setLevel(logging.WARNING)
log = logging.getLogger("trader")


def parse_timeframe(tf_str: str) -> tuple[str, int, str]:
    """Returns (key, mt5_timeframe, label). Unknown input falls back to 1m."""
    key = TF_ALIASES.get(tf_str.lower().strip(), tf_str.lower().strip())
    if key not in TIMEFRAMES:
        key = "1m"
    tf, label = TIMEFRAMES[key]
    return key, tf, label


# ======================================================================================
# MT5 LAYER  (plain blocking functions - always executed on the MT5 worker thread)
# ======================================================================================
def mt5_connect(path: str) -> tuple[bool, str]:
    ok = mt5.initialize(path=path) if path else mt5.initialize()
    if not ok:
        return False, f"MT5 initialize failed: {mt5.last_error()}"
    info = mt5.terminal_info()
    acc = mt5.account_info()
    if info is not None and not info.trade_allowed:
        return True, "MT5 connected — ⚠️ 'Algo Trading' button is OFF"
    return True, f"MT5 connected • {acc.server if acc else ''} #{acc.login if acc else ''}"


def mt5_is_connected() -> bool:
    return mt5.terminal_info() is not None


def ensure_symbol_active(symbol: str) -> bool:
    sym_info = mt5.symbol_info(symbol)
    if sym_info is None:
        return False
    if not sym_info.visible and not mt5.symbol_select(symbol, True):
        return False
    return True


def get_account() -> Optional[dict]:
    acc = mt5.account_info()
    if acc is None:
        return None
    return {"login": acc.login, "server": acc.server, "currency": acc.currency, "balance": acc.balance,
            "equity": acc.equity, "margin": acc.margin, "margin_free": acc.margin_free,
            "leverage": acc.leverage, "profit": acc.profit}


def get_tick(symbol: str) -> Optional[dict]:
    if not ensure_symbol_active(symbol):
        return None
    tick = mt5.symbol_info_tick(symbol)
    info = mt5.symbol_info(symbol)
    if tick is None or info is None:
        return None
    return {"bid": tick.bid, "ask": tick.ask, "digits": info.digits,
            "spread_pips": (tick.ask - tick.bid) / pip_size_for(info.point, info.digits)}


def get_symbol_meta(symbol: str) -> Optional[dict]:
    info = mt5.symbol_info(symbol)
    if info is None:
        return None
    return {"point": info.point, "digits": info.digits, "pip": pip_size_for(info.point, info.digits),
            "spread_price": info.spread * info.point}


def fetch_closed_rates(symbol: str, timeframe: int, count: int) -> Optional[pd.DataFrame]:
    """Downloads `count` CLOSED candles (the still-forming bar is dropped)."""
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, count + 1)
    if rates is None or len(rates) < 2:
        return None
    df = pd.DataFrame(rates)
    df["time"] = pd.to_datetime(df["time"], unit="s")
    return df.iloc[:-1].reset_index(drop=True)


def _normalize_volume(volume: float, info) -> float:
    step = info.volume_step or 0.01
    volume = max(info.volume_min, min(info.volume_max, volume))
    return round(round(volume / step) * step, 8)


def _filling_mode(info) -> int:
    # symbol_info.filling_mode bit flags: 1 = FOK allowed, 2 = IOC allowed
    if info.filling_mode & 1:
        return mt5.ORDER_FILLING_FOK
    if info.filling_mode & 2:
        return mt5.ORDER_FILLING_IOC
    return mt5.ORDER_FILLING_RETURN


def count_bot_positions() -> int:
    positions = mt5.positions_get()
    return sum(1 for p in positions or [] if p.magic == MAGIC_NUMBER)


def place_market_order(symbol: str, signal_type: str, lot_size: float, sl_pips: float, tp_pips: float,
                       comment: str) -> tuple[Optional[dict], str]:
    """Sends a market order with SL/TP. Returns (deal_info, message)."""
    tick = mt5.symbol_info_tick(symbol)
    info = mt5.symbol_info(symbol)
    if tick is None or info is None:
        return None, "No tick / symbol info"

    pip = pip_size_for(info.point, info.digits)
    min_stop = (info.trade_stops_level + info.spread) * info.point
    sl_dist = max(sl_pips * pip, min_stop)
    tp_dist = max(tp_pips * pip, min_stop)

    if signal_type == "BUY":
        order_type, price = mt5.ORDER_TYPE_BUY, tick.ask
        sl, tp = price - sl_dist, price + tp_dist
    elif signal_type == "SELL":
        order_type, price = mt5.ORDER_TYPE_SELL, tick.bid
        sl, tp = price + sl_dist, price - tp_dist
    else:
        return None, f"Invalid signal {signal_type}"

    volume = _normalize_volume(lot_size, info)
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": symbol,
        "volume": volume,
        "type": order_type,
        "price": price,
        "sl": round(sl, info.digits),
        "tp": round(tp, info.digits),
        "deviation": 20,
        "magic": MAGIC_NUMBER,
        "comment": comment[:31],   # MT5 comment limit
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": _filling_mode(info),
    }

    result = mt5.order_send(request)
    if result is None:
        return None, f"order_send returned None: {mt5.last_error()}"
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        return None, f"retcode {result.retcode}: {result.comment}"

    # Resolve the position id from the deal (on hedging accounts it equals the order ticket)
    position_id = result.order
    if result.deal:
        deals = mt5.history_deals_get(ticket=result.deal)
        if deals:
            position_id = deals[0].position_id or result.order

    fill_price = result.price or price
    return {
        "ticket": int(position_id),
        "order": int(result.order),
        "symbol": symbol,
        "signal": signal_type,
        "volume": volume,
        "entry": round(fill_price, info.digits),
        "sl": request["sl"],
        "tp": request["tp"],
        "sl_pips": round(sl_dist / pip, 1),
        "tp_pips": round(tp_dist / pip, 1),
        "pip": pip,
        "server_time": int(tick.time),
    }, "ok"


def get_open_positions() -> list[dict]:
    positions = mt5.positions_get()
    out = []
    for p in positions or []:
        if p.magic != MAGIC_NUMBER:
            continue
        out.append({"ticket": p.ticket, "symbol": p.symbol,
                    "type": "BUY" if p.type == mt5.POSITION_TYPE_BUY else "SELL",
                    "volume": p.volume, "price_open": p.price_open, "price_current": p.price_current,
                    "sl": p.sl, "tp": p.tp, "profit": round(p.profit + p.swap, 2), "comment": p.comment})
    return out


def write_chart_tag(deal: dict, model: str, probability: float) -> Optional[str]:
    """
    Appends a line to <MT5 common data folder>/Files/model_tags.csv.
    The ModelTagPlotter.mq5 indicator reads it and draws the arrow + model label on the chart.
    """
    info = mt5.terminal_info()
    if info is None:
        return None
    folder = Path(info.commondata_path) / "Files"
    folder.mkdir(parents=True, exist_ok=True)
    path = folder / CHART_TAG_FILE
    new_file = not path.exists()
    with open(path, "a", newline="", encoding="ascii", errors="ignore") as f:
        w = csv.writer(f)
        if new_file:
            w.writerow(["ticket", "symbol", "time", "price", "signal", "model", "probability", "sl", "tp"])
        w.writerow([deal["ticket"], deal["symbol"], deal["server_time"], deal["entry"], deal["signal"],
                    model, f"{probability:.1f}", deal["sl"], deal["tp"]])
    return str(path)


# ======================================================================================
# CONTROLLER (asyncio side)
# ======================================================================================
class MT5Worker:
    """Runs every MT5 call on a single dedicated thread."""

    def __init__(self):
        self._executor = ThreadPoolExecutor(max_workers=1, thread_name_prefix="mt5")

    async def call(self, fn: Callable, *args, **kwargs):
        loop = asyncio.get_running_loop()
        return await loop.run_in_executor(self._executor, functools.partial(fn, *args, **kwargs))

    def shutdown(self) -> None:
        self._executor.shutdown(wait=False, cancel_futures=True)


Notifier = Callable[[str], Awaitable[None]]


class TradingController:
    def __init__(self, tracker: PerformanceTracker, bridge=None):
        self.tracker = tracker
        self.bridge = bridge                       # trading_gui.GuiBridge or None (headless)
        self.mt5 = MT5Worker()
        self.loop: Optional[asyncio.AbstractEventLoop] = None
        self.stop_event: Optional[asyncio.Event] = None
        self.trade_lock: Optional[asyncio.Lock] = None
        self.app: Optional[Application] = None
        self.connected = False
        self._tasks: set[asyncio.Task] = set()

    # ---------------------------------------------------------------- GUI helpers
    def emit(self, signal_name: str, *args) -> None:
        if self.bridge is not None:
            getattr(self.bridge, signal_name).emit(*args)

    def log(self, text: str) -> None:
        log.info(text)
        self.emit("log_message", text)

    def spawn(self, coro) -> asyncio.Task:
        """create_task that keeps a reference (un-referenced tasks can be garbage collected)."""
        task = asyncio.create_task(coro)
        self._tasks.add(task)
        task.add_done_callback(self._tasks.discard)
        return task

    async def broadcast(self, text: str) -> None:
        """Sends a message to every authorised Telegram chat."""
        if self.app is None:
            return
        for chat_id in ALLOWED_CHAT_IDS:
            try:
                await self.app.bot.send_message(chat_id, text, parse_mode=ParseMode.HTML)
            except Exception as exc:  # noqa: BLE001
                log.warning("Telegram send to %s failed: %s", chat_id, exc)

    # ---------------------------------------------------------------- thread-safe entry points (GUI)
    def request_trade_threadsafe(self, model: str, symbol: str, timeframe: str) -> None:
        if self.loop is None:
            self.emit("log_message", "⚠️ Engine not started yet.")
            return
        asyncio.run_coroutine_threadsafe(self.run_model(model, symbol, timeframe, self.broadcast), self.loop)

    def stop_threadsafe(self) -> None:
        if self.loop is not None and self.stop_event is not None:
            self.loop.call_soon_threadsafe(self.stop_event.set)

    # ---------------------------------------------------------------- model execution
    async def run_model(self, model: str, symbol: str, tf_arg: str, notify: Notifier) -> None:
        model = model.upper()
        symbol = symbol.upper()
        tf_key, tf_const, tf_label = parse_timeframe(tf_arg)
        tag = MODEL_LABELS[model]
        try:
            async with self.trade_lock:
                await self._run_model_locked(model, symbol, tf_key, tf_const, tf_label, tag, notify)
        except Exception as exc:  # noqa: BLE001
            log.exception("Model run failed")
            self.log(f"❌ {tag} {symbol}: {exc}")
            await notify(f"❌ {html.escape(tag)} error: <code>{html.escape(str(exc))}</code>")

    async def _run_model_locked(self, model, symbol, tf_key, tf_const, tf_label, tag, notify: Notifier) -> None:
        if not self.connected:
            await notify("❌ MT5 is not connected.")
            return
        if not await self.mt5.call(ensure_symbol_active, symbol):
            await notify(f"❌ Symbol <code>{html.escape(symbol)}</code> not available.")
            return
        open_count = await self.mt5.call(count_bot_positions)
        if open_count >= MAX_OPEN_POSITIONS:
            await notify(f"⛔ Risk guard: {open_count} bot positions already open (max {MAX_OPEN_POSITIONS}).")
            return

        await notify(f"🔍 <b>{html.escape(tag)}</b> analysing <code>{symbol}</code> [{tf_label}]…")
        self.log(f"🔍 {tag} analysing {symbol} {tf_key}")

        df = await self.mt5.call(fetch_closed_rates, symbol, tf_const, HISTORY_BARS)
        meta = await self.mt5.call(get_symbol_meta, symbol)
        if df is None or meta is None:
            await notify("❌ History download failed.")
            return

        # ---- run the selected engine off the event loop (CPU work)
        details = ""
        if model == "CLASSIC":
            signal, probability = await asyncio.to_thread(
                predict_market_direction, df, 30, 50, 10
            )
            sl_pips, tp_pips = CLASSIC_SL_PIPS, CLASSIC_TP_PIPS
            evaluation = {"model": model, "symbol": symbol, "timeframe": tf_key,
                          "signal": signal, "probability": float(probability)}
        else:
            adv = await asyncio.to_thread(
                predict_advanced, df, AdvancedConfig(), meta["pip"], meta["spread_price"]
            )
            signal, probability = adv.signal, adv.probability
            sl_pips, tp_pips = adv.sl_pips, adv.tp_pips
            evaluation = {"model": model, "symbol": symbol, "timeframe": tf_key, **adv.to_dict()}
            details = (
                f"\n• BUY {adv.buy_probability:.1f}% | SELL {adv.sell_probability:.1f}% "
                f"(need ≥ {adv.required_probability:.1f}%)"
                f"\n• Velocity: {adv.velocity_state} ({adv.velocity_pips_per_sec:+.4f} pips/s)"
                f"\n• Time-to-level: {adv.time_to_level_bars:.0f} bars ({adv.time_to_level_seconds:.0f}s)"
                f"\n• Resistance +{adv.dist_to_resistance_pips} pips | Support -{adv.dist_to_support_pips} pips"
                f"\n• Expected outcome in ~{adv.expected_bars_to_outcome:.0f} bars"
            )

        self.emit("signal_evaluated", evaluation)

        if signal == "NEUTRAL":
            await notify(f"⚠️ <b>{html.escape(tag)} NEUTRAL</b> ({probability:.1f}%). Trade skipped for risk control."
                         + html.escape(details))
            return

        # ---- execute
        comment = f"[{model}] {probability:.0f}%"
        deal, msg = await self.mt5.call(place_market_order, symbol, signal, LOT_SIZE, sl_pips, tp_pips, comment)
        if deal is None:
            self.log(f"❌ Execution failed: {msg}")
            await notify(f"❌ Execution failed on MT5 server: <code>{html.escape(msg)}</code>")
            return

        self.tracker.record_open(
            position_id=deal["ticket"], order_ticket=deal["order"], model=model, symbol=symbol,
            signal=signal, probability=probability, volume=deal["volume"], entry_price=deal["entry"],
            sl=deal["sl"], tp=deal["tp"], pip_size=deal["pip"], timeframe=tf_key,
            extra={k: v for k, v in evaluation.items() if k not in ("model", "symbol", "timeframe")},
        )
        tag_path = await self.mt5.call(write_chart_tag, deal, model, probability)
        if tag_path is None:
            self.log("⚠️ Could not write chart tag file")

        gui_deal = {**deal, "model": model, "probability": float(probability), "timeframe": tf_key}
        self.emit("trade_opened", gui_deal)
        self.emit("stats_updated", self.tracker.get_dashboard_snapshot())

        icon = "🟢" if signal == "BUY" else "🔴"
        await notify(
            f"🚀 <b>LIVE ORDER EXECUTED {html.escape(tag)} [{tf_label}]</b>\n\n"
            f"• <b>Ticket:</b> <code>#{deal['ticket']}</code>\n"
            f"• <b>Signal:</b> <code>{signal}</code> {icon} ({probability:.1f}% probability)\n"
            f"• <b>Entry:</b> <code>{deal['entry']}</code>  <b>Lot:</b> <code>{deal['volume']}</code>\n"
            f"• <b>SL:</b> <code>{deal['sl']}</code> ({deal['sl_pips']} pips)\n"
            f"• <b>TP:</b> <code>{deal['tp']}</code> ({deal['tp_pips']} pips)"
            + html.escape(details)
        )

    # ---------------------------------------------------------------- monitoring
    async def monitor_loop(self) -> None:
        """Every few seconds: reconnect if needed, detect closed deals, push live data to the GUI."""
        while not self.stop_event.is_set():
            try:
                if not await self.mt5.call(mt5_is_connected):
                    ok, msg = await self.mt5.call(mt5_connect, MT5_PATH)
                    self.connected = ok
                    self.emit("connection_status", ok, msg)
                    if ok:
                        self.log("🔌 MT5 reconnected")

                if self.connected:
                    closed = await self.mt5.call(self.tracker.sync_with_mt5, mt5)
                    for tr in closed:
                        self.emit("trade_closed", tr)
                        net = tr.get("net_profit_usd") or 0
                        icon = "✅" if net > 0 else "❌" if net < 0 else "➖"
                        text = (f"{icon} <b>DEAL CLOSED {html.escape(MODEL_LABELS.get(tr['model'], tr['model']))}</b>\n"
                                f"• Ticket <code>#{tr['position_id']}</code> {tr['signal']} {tr['symbol']}\n"
                                f"• Result: <b>{tr['outcome']}</b> {tr['pips']:+.1f} pips  "
                                f"({'+' if net >= 0 else '-'}${abs(net):,.2f})")
                        self.log(text.replace("<b>", "").replace("</b>", "").replace("<code>", "").replace("</code>", ""))
                        await self.broadcast(text)

                    if self.bridge is not None:
                        positions = await self.mt5.call(get_open_positions)
                        for p in positions:
                            t = self.tracker.get_trade(p["ticket"])
                            if t:
                                p["model"], p["probability"] = t["model"], t["probability"]
                        self.emit("positions_updated", positions)
                        acc = await self.mt5.call(get_account)
                        if acc:
                            self.emit("account_updated", acc)
                        self.emit("stats_updated", self.tracker.get_dashboard_snapshot())
            except Exception:  # noqa: BLE001
                log.exception("Monitor loop error")

            try:
                await asyncio.wait_for(self.stop_event.wait(), timeout=MONITOR_INTERVAL_SEC)
            except asyncio.TimeoutError:
                pass

    # ---------------------------------------------------------------- lifecycle
    async def run(self) -> None:
        self.loop = asyncio.get_running_loop()
        self.stop_event = asyncio.Event()
        self.trade_lock = asyncio.Lock()

        ok, msg = await self.mt5.call(mt5_connect, MT5_PATH)
        self.connected = ok
        self.emit("connection_status", ok, msg)
        self.log(("✅ " if ok else "❌ ") + msg)

        if TELEGRAM_TOKEN:
            self.app = build_telegram_app(self)
            await self.app.initialize()
            await self.app.start()
            await self.app.updater.start_polling(drop_pending_updates=True)
            self.log("⚡ Telegram bot polling…")
            if not ALLOWED_CHAT_IDS:
                self.log("⚠️ TELEGRAM_ALLOWED_CHAT_IDS is empty: send /myid to the bot and add your chat id.")
            else:
                await self.broadcast("⚡ <b>Multi-Model Trading Bot online</b>. Send /help for commands.")
        else:
            self.log("⚠️ TELEGRAM_TOKEN not set - running without Telegram (GUI only).")

        monitor = self.spawn(self.monitor_loop())
        await self.stop_event.wait()

        self.log("Shutting down…")
        monitor.cancel()
        if self.app is not None:
            await self.app.updater.stop()
            await self.app.stop()
            await self.app.shutdown()
        await self.mt5.call(mt5.shutdown)
        self.mt5.shutdown()


# ======================================================================================
# TELEGRAM
# ======================================================================================
def authorised(handler):
    """Only chats listed in TELEGRAM_ALLOWED_CHAT_IDS may use trading/account commands."""

    @functools.wraps(handler)
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id if update.effective_chat else None
        if chat_id not in ALLOWED_CHAT_IDS:
            log.warning("Unauthorised command from chat %s", chat_id)
            await update.effective_message.reply_text(
                f"⛔ Not authorised. Your chat id is {chat_id}. Add it to TELEGRAM_ALLOWED_CHAT_IDS."
            )
            return
        return await handler(update, context)

    return wrapper


def build_telegram_app(ctrl: TradingController) -> Application:
    request = HTTPXRequest(connect_timeout=30.0, read_timeout=30.0)
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).request(request).concurrent_updates(True).build()

    def reply_to(update: Update) -> Notifier:
        async def _send(text: str) -> None:
            await update.effective_message.reply_text(text, parse_mode=ParseMode.HTML)
            ctrl.emit("log_message", "📨 " + html.unescape(text.split("\n")[0]).replace("<b>", "").replace("</b>", ""))
        return _send

    async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
        msg = (
            "⚡ <b>24/7 Multi-Model Algorithmic Trading Bot</b>\n\n"
            "<b>Trading</b>\n"
            "• /trade_classic <code>[tf] [symbol]</code> – Classic Model (path matching)\n"
            "• /trade_advanced <code>[tf] [symbol]</code> – Advanced Model (OHLC + time/velocity)\n"
            "• /trade – alias of /trade_classic\n"
            "   tf: 1m 5m 15m 30m 1h 4h  •  e.g. <code>/trade_advanced 5m GBPUSD</code>\n\n"
            "<b>Account & analytics</b>\n"
            "• /balance – equity & margin\n"
            "• /price <code>[symbol]</code> – live bid/ask\n"
            "• /positions – open bot positions\n"
            "• /stats – win rate & PnL by model\n"
            "• /export – send performance JSON\n"
            "• /gui – bring the desktop dashboard to the front\n"
            "• /myid – show your chat id"
        )
        await update.effective_message.reply_text(msg, parse_mode=ParseMode.HTML)

    async def myid(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.effective_message.reply_text(f"Your chat id: {update.effective_chat.id}")

    @authorised
    async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
        acc = await ctrl.mt5.call(get_account)
        if acc is None:
            await update.effective_message.reply_text("❌ Failed to fetch account info.")
            return
        await update.effective_message.reply_text(
            "💰 <b>Financial Summary</b>\n\n"
            f"• <b>Account:</b> <code>{acc['login']}</code> ({html.escape(acc['server'])})\n"
            f"• <b>Balance:</b> <code>${acc['balance']:,.2f}</code>\n"
            f"• <b>Equity:</b> <code>${acc['equity']:,.2f}</code>\n"
            f"• <b>Floating P/L:</b> <code>${acc['profit']:,.2f}</code>\n"
            f"• <b>Free Margin:</b> <code>${acc['margin_free']:,.2f}</code>\n"
            f"• <b>Leverage:</b> <code>1:{acc['leverage']}</code>",
            parse_mode=ParseMode.HTML,
        )

    @authorised
    async def price(update: Update, context: ContextTypes.DEFAULT_TYPE):
        symbol = context.args[0].upper() if context.args else DEFAULT_SYMBOL
        tick = await ctrl.mt5.call(get_tick, symbol)
        if tick is None:
            await update.effective_message.reply_text(f"❌ Symbol {symbol} not active.")
            return
        d = tick["digits"]
        await update.effective_message.reply_text(
            f"📊 <b>{html.escape(symbol)} Live</b>\nBid: <code>{tick['bid']:.{d}f}</code>\n"
            f"Ask: <code>{tick['ask']:.{d}f}</code>\nSpread: <code>{tick['spread_pips']:.1f} pips</code>",
            parse_mode=ParseMode.HTML,
        )

    def make_trade_handler(model: str):
        @authorised
        async def handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
            tf_arg = context.args[0] if context.args else "1m"
            symbol = context.args[1].upper() if len(context.args) > 1 else DEFAULT_SYMBOL
            ctrl.spawn(ctrl.run_model(model, symbol, tf_arg, reply_to(update)))
        return handler

    @authorised
    async def positions(update: Update, context: ContextTypes.DEFAULT_TYPE):
        pos = await ctrl.mt5.call(get_open_positions)
        if not pos:
            await update.effective_message.reply_text("📭 No open bot positions.")
            return
        lines = ["📂 <b>Open positions</b>\n"]
        for p in pos:
            t = ctrl.tracker.get_trade(p["ticket"])
            tag = MODEL_LABELS.get(t["model"], "?") if t else "[UNTRACKED]"
            prob = f" {t['probability']:.0f}%" if t else ""
            lines.append(f"• <code>#{p['ticket']}</code> {html.escape(tag)}{prob} {p['type']} {p['symbol']} "
                         f"{p['volume']} @ {p['price_open']} → <b>${p['profit']:,.2f}</b>")
        await update.effective_message.reply_text("\n".join(lines), parse_mode=ParseMode.HTML)

    @authorised
    async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
        snap = ctrl.tracker.get_dashboard_snapshot()
        o = snap["overall"]

        def block(name: str, s: dict) -> str:
            pf = "—" if s["profit_factor"] is None else f"{s['profit_factor']:.2f}"
            return (f"<b>{name}</b>\n"
                    f"• Deals {s['total_closed']} | ✅ {s['wins']} ❌ {s['losses']} | Win rate {s['win_rate']:.1f}%\n"
                    f"• PnL ${s['pnl_usd']:,.2f} | {s['pnl_pips']:+.1f} pips | PF {pf} | Open {s['open_trades']}\n")

        text = ("📈 <b>Performance</b>\n\n" + block("ALL MODELS", o) + "\n"
                + block("[CLASSIC MODEL]", snap["models"]["CLASSIC"]) + "\n"
                + block("[ADVANCED MODEL]", snap["models"]["ADVANCED"]))
        await update.effective_message.reply_text(text, parse_mode=ParseMode.HTML)

    @authorised
    async def export(update: Update, context: ContextTypes.DEFAULT_TYPE):
        path = ctrl.tracker.export_json(BASE_DIR / "trading_performance.json")
        with open(path, "rb") as f:
            await update.effective_message.reply_document(f, filename="trading_performance.json")

    @authorised
    async def gui(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if ctrl.bridge is None:
            await update.effective_message.reply_text("🖥 Running headless (--no-gui); no dashboard to show.")
            return
        ctrl.emit("show_window")
        await update.effective_message.reply_text("🖥 Dashboard brought to the front.")

    app.add_handler(CommandHandler(["start", "help"], start))
    app.add_handler(CommandHandler("myid", myid))
    app.add_handler(CommandHandler("balance", balance))
    app.add_handler(CommandHandler("price", price))
    app.add_handler(CommandHandler(["trade_classic", "trade"], make_trade_handler("CLASSIC")))
    app.add_handler(CommandHandler("trade_advanced", make_trade_handler("ADVANCED")))
    app.add_handler(CommandHandler("positions", positions))
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("export", export))
    app.add_handler(CommandHandler("gui", gui))
    return app


# ======================================================================================
# ENTRY POINT
# ======================================================================================
def run_headless(tracker: PerformanceTracker) -> None:
    ctrl = TradingController(tracker, bridge=None)
    try:
        asyncio.run(ctrl.run())
    except KeyboardInterrupt:
        log.info("Stopped by user.")


def run_with_gui(tracker: PerformanceTracker) -> int:
    from trading_gui import create_gui  # imported here so --no-gui works without PyQt6

    ctrl = TradingController(tracker)
    qt_app, bridge, window = create_gui(trade_requester=ctrl.request_trade_threadsafe, default_symbol=DEFAULT_SYMBOL)
    ctrl.bridge = bridge
    bridge.stats_updated.emit(tracker.get_dashboard_snapshot())
    window.show()

    def engine_thread():
        try:
            asyncio.run(ctrl.run())
        except Exception:  # noqa: BLE001
            log.exception("Engine thread crashed")
            bridge.connection_status.emit(False, "Engine crashed – see trading_bot.log")

    worker = threading.Thread(target=engine_thread, name="trading-engine", daemon=True)
    worker.start()
    qt_app.aboutToQuit.connect(ctrl.stop_threadsafe)
    code = qt_app.exec()
    worker.join(timeout=15)
    return code


def main() -> None:
    parser = argparse.ArgumentParser(description="Multi-model MT5 trading bot")
    parser.add_argument("--no-gui", action="store_true", help="run without the PyQt6 dashboard (VPS mode)")
    args = parser.parse_args()

    if not TELEGRAM_TOKEN and args.no_gui:
        sys.exit("TELEGRAM_TOKEN is not set. Put it in .env (see .env.example).")

    tracker = PerformanceTracker(DB_PATH)
    log.info("Performance DB: %s", DB_PATH)
    try:
        if args.no_gui:
            run_headless(tracker)
        else:
            sys.exit(run_with_gui(tracker))
    finally:
        tracker.close()


if __name__ == "__main__":
    main()
