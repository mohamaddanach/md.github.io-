"""
main.py  (v3 - MANUAL + AUTOMATIC modes)
========================================
Integrated controller for the 24/7 multi-model trading system.

Two sides, both controlled from Telegram:

  ✋ MANUAL side  - you decide: /buy /sell with your own lots or $ risk, /close, /closeall,
                   or ask a model first with /trade_classic /trade_advanced.
  🤖 AUTO side    - /auto_on: the bot watches the market in a loop, runs BOTH models on every
                   new candle, compares them (decision_engine.py), picks the best option,
                   sizes the position from your risk setting and trades on its own.
                   /auto_off stops it at any time. /panic = auto off + close everything.

Other parts:
- MetaTrader 5 execution (all MT5 calls run on ONE dedicated worker thread - the MT5
  Python API is not thread-safe)
- PerformanceTracker (SQLite) records every deal and detects closes from MT5 history
- PyQt6 floating dashboard (trading_gui.py) - optional, disable with --no-gui on a VPS
- MT5 chart tagging: order comment + a CSV feed for the ModelTagPlotter.mq5 indicator

Configuration comes from environment variables or a `.env` file next to this script.
Automatic-mode settings are changed from Telegram (/auto_set) and saved to auto_settings.json.

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
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, Update
from telegram.constants import ParseMode
from telegram.ext import Application, ApplicationBuilder, CallbackQueryHandler, CommandHandler, ContextTypes
from telegram.request import HTTPXRequest

from advanced_candle_time_engine import AdvancedConfig, pip_size_for, predict_advanced
from decision_engine import (
    AutoSettings,
    choose_trade,
    confidence_scale,
    in_session,
    lots_for_risk,
    normalize_lots,
    parse_amount,
    pip_value_per_lot,
)
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


def _parse_chat_ids(raw: str) -> set[int]:
    """Comma-separated chat ids. Anything that isn't a number (e.g. a leftover placeholder) is ignored."""
    ids = set()
    for part in raw.split(","):
        part = part.strip()
        if part.lstrip("-").isdigit():
            ids.add(int(part))
        elif part:
            print(f"⚠️ Ignoring invalid TELEGRAM_ALLOWED_CHAT_IDS entry: {part!r} (must be a number)")
    return ids


TELEGRAM_TOKEN = os.environ.get("TELEGRAM_TOKEN", "").strip()
if TELEGRAM_TOKEN.startswith("<") or ":" not in TELEGRAM_TOKEN:
    if TELEGRAM_TOKEN:
        print("⚠️ TELEGRAM_TOKEN in .env is not a real BotFather token - Telegram disabled.")
    TELEGRAM_TOKEN = ""
ALLOWED_CHAT_IDS = _parse_chat_ids(os.environ.get("TELEGRAM_ALLOWED_CHAT_IDS", ""))
DEFAULT_SYMBOL = os.environ.get("DEFAULT_SYMBOL", "EURUSD").upper()
MT5_PATH = os.environ.get("MT5_PATH", "")
LOT_SIZE = float(os.environ.get("LOT_SIZE", "0.01"))                 # default lot for model trades
MAX_OPEN_POSITIONS = int(os.environ.get("MAX_OPEN_POSITIONS", "3"))  # applies to model/auto trades
HISTORY_BARS = int(os.environ.get("HISTORY_BARS", "30000"))          # upper limit for any timeframe
CLASSIC_SL_PIPS = float(os.environ.get("CLASSIC_SL_PIPS", "15"))
CLASSIC_TP_PIPS = float(os.environ.get("CLASSIC_TP_PIPS", "30"))
MANUAL_SL_PIPS = float(os.environ.get("MANUAL_SL_PIPS", "20"))       # /buy /sell default stop-loss
MANUAL_TP_PIPS = float(os.environ.get("MANUAL_TP_PIPS", "40"))       # /buy /sell default take-profit
MANUAL_MAX_LOT = float(os.environ.get("MANUAL_MAX_LOT", "1.0"))      # protects against typos (50 lots...)
MONITOR_INTERVAL_SEC = float(os.environ.get("MONITOR_INTERVAL_SEC", "3"))
AUTO_CHECK_INTERVAL_SEC = float(os.environ.get("AUTO_CHECK_INTERVAL_SEC", "20"))
MAGIC_NUMBER = 100200
DB_PATH = BASE_DIR / "trading_performance.db"
SETTINGS_PATH = BASE_DIR / "auto_settings.json"
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
# Candles downloaded per timeframe. Big timeframes need far fewer candles; asking MT5 for
# 30000 H4 candles (~20 years) makes it download years of history and freezes the program.
BARS_PER_TIMEFRAME = {"1m": 30000, "5m": 20000, "15m": 12000, "30m": 8000, "1h": 6000, "4h": 3000}

TF_ALIASES = {"1": "1m", "5": "5m", "15": "15m", "30": "30m", "60": "1h", "h1": "1h", "h4": "4h", "240": "4h"}

MODEL_LABELS = {
    "CLASSIC": "[CLASSIC MODEL]",
    "ADVANCED": "[ADVANCED MODEL]",
    "COMBINED": "[BOTH MODELS AGREE]",
    "MANUAL": "[MANUAL]",
}

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


def _plain(text: str) -> str:
    """HTML message -> plain text for the log."""
    for tag in ("<b>", "</b>", "<code>", "</code>", "<i>", "</i>"):
        text = text.replace(tag, "")
    return html.unescape(text)


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
    """Everything needed for analysis and position sizing."""
    info = mt5.symbol_info(symbol)
    if info is None:
        return None
    tick = mt5.symbol_info_tick(symbol)
    pip = pip_size_for(info.point, info.digits)
    if tick is not None and tick.ask > 0 and tick.bid > 0:
        spread_price = tick.ask - tick.bid
    else:
        spread_price = info.spread * info.point
    return {"point": info.point, "digits": info.digits, "pip": pip,
            "spread_price": spread_price, "spread_pips": spread_price / pip,
            "pip_value": pip_value_per_lot(pip, info.trade_tick_size, info.trade_tick_value),
            "volume_min": info.volume_min, "volume_max": info.volume_max, "volume_step": info.volume_step}


def fetch_closed_rates(symbol: str, timeframe: int, count: int) -> Optional[pd.DataFrame]:
    """Downloads `count` CLOSED candles (the still-forming bar is dropped)."""
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 0, count + 1)
    if rates is None or len(rates) < 2:
        return None
    df = pd.DataFrame(rates)
    df["time"] = pd.to_datetime(df["time"], unit="s")
    return df.iloc[:-1].reset_index(drop=True)


def latest_closed_bar_time(symbol: str, timeframe: int) -> Optional[int]:
    """Open time of the most recent CLOSED candle (position 1 = last finished bar)."""
    rates = mt5.copy_rates_from_pos(symbol, timeframe, 1, 1)
    if rates is None or len(rates) == 0:
        return None
    return int(rates[0]["time"])


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

    volume = normalize_lots(lot_size, info.volume_min, info.volume_max, info.volume_step)
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


def close_position(ticket: int) -> tuple[bool, str]:
    """Closes one open position at market."""
    positions = mt5.positions_get(ticket=ticket)
    if not positions:
        return False, f"position #{ticket} not found (already closed?)"
    p = positions[0]
    info = mt5.symbol_info(p.symbol)
    tick = mt5.symbol_info_tick(p.symbol)
    if info is None or tick is None:
        return False, f"no price for {p.symbol}"
    if p.type == mt5.POSITION_TYPE_BUY:
        order_type, price = mt5.ORDER_TYPE_SELL, tick.bid
    else:
        order_type, price = mt5.ORDER_TYPE_BUY, tick.ask
    request = {
        "action": mt5.TRADE_ACTION_DEAL,
        "symbol": p.symbol,
        "volume": p.volume,
        "type": order_type,
        "position": p.ticket,
        "price": price,
        "deviation": 20,
        "magic": p.magic,
        "comment": "closed from Telegram",
        "type_time": mt5.ORDER_TIME_GTC,
        "type_filling": _filling_mode(info),
    }
    result = mt5.order_send(request)
    if result is None:
        return False, f"order_send returned None: {mt5.last_error()}"
    if result.retcode != mt5.TRADE_RETCODE_DONE:
        return False, f"retcode {result.retcode}: {result.comment}"
    return True, f"closed #{p.ticket} {p.symbol} {p.volume} lot (P/L ≈ ${p.profit + p.swap:+,.2f})"


def close_all_bot_positions() -> list[str]:
    results = []
    for p in mt5.positions_get() or []:
        if p.magic == MAGIC_NUMBER:
            ok, msg = close_position(p.ticket)
            results.append(("✅ " if ok else "❌ ") + msg)
    return results


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
        self.auto = AutoSettings.load(SETTINGS_PATH)
        self._last_auto_bar: dict[str, int] = {}
        self._tasks: set[asyncio.Task] = set()

    # ---------------------------------------------------------------- helpers
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
        self.emit("log_message", _plain(text.split("\n")[0]))
        if self.app is None:
            return
        for chat_id in ALLOWED_CHAT_IDS:
            try:
                await self.app.bot.send_message(chat_id, text, parse_mode=ParseMode.HTML)
            except Exception as exc:  # noqa: BLE001
                log.warning("Telegram send to %s failed: %s", chat_id, exc)

    def save_auto(self) -> None:
        self.auto.save(SETTINGS_PATH)

    def today_stats(self) -> dict:
        """Today's (UTC) closed PnL and number of trades opened."""
        today = datetime.now(timezone.utc).date().isoformat()
        closed = self.tracker.get_recent_closed(1000)
        opened = self.tracker.get_open_trades() + closed
        opened_today = [t for t in opened if (t.get("open_time") or "").startswith(today)]
        return {
            "pnl_usd": round(sum(t.get("net_profit_usd") or 0 for t in closed
                                 if (t.get("close_time") or "").startswith(today)), 2),
            "trades": len(opened_today),
            "auto_trades": sum(1 for t in opened_today if t.get("extra", {}).get("source") == "AUTO"),
        }

    # ---------------------------------------------------------------- thread-safe entry points (GUI)
    def request_trade_threadsafe(self, model: str, symbol: str, timeframe: str) -> None:
        if self.loop is None:
            self.emit("log_message", "⚠️ Engine not started yet.")
            return
        asyncio.run_coroutine_threadsafe(self.run_model(model, symbol, timeframe, self.broadcast), self.loop)

    def stop_threadsafe(self) -> None:
        if self.loop is not None and self.stop_event is not None:
            self.loop.call_soon_threadsafe(self.stop_event.set)

    # ---------------------------------------------------------------- order execution (shared)
    async def _execute(self, *, symbol: str, side: str, model: str, probability: float, sl_pips: float,
                       tp_pips: float, lots: float, pip_value: float, tf_key: str, tf_label: str, source: str,
                       evaluation: dict, details: str, note: str, notify: Notifier) -> Optional[dict]:
        tag = MODEL_LABELS.get(model, model)
        prefix = "AUTO " if source == "AUTO" else ""
        comment = f"{prefix}[{model}] {probability:.0f}%" if probability else f"{prefix}[{model}]"
        deal, msg = await self.mt5.call(place_market_order, symbol, side, lots, sl_pips, tp_pips, comment)
        if deal is None:
            self.log(f"❌ Execution failed: {msg}")
            await notify(f"❌ Execution failed on MT5 server: <code>{html.escape(msg)}</code>")
            return None

        risk_usd = round(deal["volume"] * deal["sl_pips"] * pip_value, 2)
        extra = {k: v for k, v in evaluation.items() if k not in ("model", "symbol", "timeframe")}
        extra.update({"source": source, "risk_usd": risk_usd})
        self.tracker.record_open(
            position_id=deal["ticket"], order_ticket=deal["order"], model=model, symbol=symbol,
            signal=side, probability=probability, volume=deal["volume"], entry_price=deal["entry"],
            sl=deal["sl"], tp=deal["tp"], pip_size=deal["pip"], timeframe=tf_key, extra=extra,
        )
        if await self.mt5.call(write_chart_tag, deal, model, probability) is None:
            self.log("⚠️ Could not write chart tag file")

        self.emit("trade_opened", {**deal, "model": model, "probability": float(probability), "timeframe": tf_key})
        self.emit("stats_updated", self.tracker.get_dashboard_snapshot())

        title = {"AUTO": "🤖 AUTO TRADE EXECUTED", "MANUAL": "✋ MANUAL ORDER EXECUTED"}.get(
            source, "🚀 LIVE ORDER EXECUTED")
        icon = "🟢" if side == "BUY" else "🔴"
        prob_txt = f" ({probability:.1f}% probability)" if probability else ""
        await notify(
            f"{title} <b>{html.escape(tag)}</b> [{tf_label}]\n\n"
            f"• <b>Ticket:</b> <code>#{deal['ticket']}</code>\n"
            f"• <b>Signal:</b> <code>{side} {symbol}</code> {icon}{prob_txt}\n"
            f"• <b>Entry:</b> <code>{deal['entry']}</code>  <b>Lot:</b> <code>{deal['volume']}</code>\n"
            f"• <b>Risk if SL hits:</b> <code>≈ ${risk_usd:,.2f}</code>\n"
            f"• <b>SL:</b> <code>{deal['sl']}</code> ({deal['sl_pips']} pips)\n"
            f"• <b>TP:</b> <code>{deal['tp']}</code> ({deal['tp_pips']} pips)"
            + (f"\n• {html.escape(note)}" if note else "")
            + html.escape(details)
        )
        return deal

    def _lots_from_amount(self, amount: Optional[str], sl_pips: float, meta: dict,
                          max_lot: float) -> tuple[float, str]:
        """amount: None (default LOT_SIZE), '0.05' (lots) or '$50' (risk in dollars)."""
        if amount is None:
            return normalize_lots(LOT_SIZE, meta["volume_min"], meta["volume_max"], meta["volume_step"]), ""
        parsed = parse_amount(amount)
        if parsed is None:
            raise ValueError(f"can't read amount '{amount}'. Use lots like 0.05 or dollars like $50")
        kind, value = parsed
        if kind == "lots":
            if value > max_lot:
                raise ValueError(f"{value} lots is above the safety limit of {max_lot} (MANUAL_MAX_LOT in .env)")
            return normalize_lots(value, meta["volume_min"], meta["volume_max"], meta["volume_step"]), ""
        lots, note = lots_for_risk(value, sl_pips, meta["pip_value"], meta["volume_min"], meta["volume_max"],
                                   meta["volume_step"], max_lot)
        if lots <= 0:
            raise ValueError(note)
        return lots, (f"risk ${value:,.2f} → {lots} lot" + (f" ({note})" if note else ""))

    # ---------------------------------------------------------------- ✋ MANUAL: direct orders
    async def manual_order(self, side: str, symbol: str, amount: str, sl_pips: float, tp_pips: float,
                           notify: Notifier) -> None:
        try:
            async with self.trade_lock:
                if not self.connected:
                    await notify("❌ MT5 is not connected.")
                    return
                if not await self.mt5.call(ensure_symbol_active, symbol):
                    await notify(f"❌ Symbol <code>{html.escape(symbol)}</code> not available.")
                    return
                meta = await self.mt5.call(get_symbol_meta, symbol)
                lots, note = self._lots_from_amount(amount, sl_pips, meta, MANUAL_MAX_LOT)
                await self._execute(symbol=symbol, side=side, model="MANUAL", probability=0.0, sl_pips=sl_pips,
                                    tp_pips=tp_pips, lots=lots, pip_value=meta["pip_value"], tf_key="-",
                                    tf_label="manual", source="MANUAL", evaluation={}, details="", note=note,
                                    notify=notify)
        except ValueError as exc:
            await notify(f"⚠️ {html.escape(str(exc))}")
        except Exception as exc:  # noqa: BLE001
            log.exception("Manual order failed")
            await notify(f"❌ Manual order error: <code>{html.escape(str(exc))}</code>")

    # ---------------------------------------------------------------- ✋ MANUAL: ask one model
    async def run_model(self, model: str, symbol: str, tf_arg: str, notify: Notifier,
                        amount: Optional[str] = None) -> None:
        model = model.upper()
        symbol = symbol.upper()
        tf_key, tf_const, tf_label = parse_timeframe(tf_arg)
        tag = MODEL_LABELS[model]
        try:
            async with self.trade_lock:
                await self._run_model_locked(model, symbol, tf_key, tf_const, tf_label, tag, notify, amount)
        except ValueError as exc:
            await notify(f"⚠️ {html.escape(str(exc))}")
        except Exception as exc:  # noqa: BLE001
            log.exception("Model run failed")
            self.log(f"❌ {tag} {symbol}: {exc}")
            await notify(f"❌ {html.escape(tag)} error: <code>{html.escape(str(exc))}</code>")

    async def _run_model_locked(self, model, symbol, tf_key, tf_const, tf_label, tag, notify: Notifier,
                                amount: Optional[str]) -> None:
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

        bars = min(HISTORY_BARS, BARS_PER_TIMEFRAME.get(tf_key, HISTORY_BARS))
        df = await self.mt5.call(fetch_closed_rates, symbol, tf_const, bars)
        meta = await self.mt5.call(get_symbol_meta, symbol)
        if df is None or meta is None:
            await notify("❌ History download failed.")
            return

        # ---- run the selected engine off the event loop (CPU work)
        details = ""
        if model == "CLASSIC":
            signal, probability = await asyncio.to_thread(predict_market_direction, df, 30, 50, 10)
            sl_pips, tp_pips = CLASSIC_SL_PIPS, CLASSIC_TP_PIPS
            evaluation = {"model": model, "symbol": symbol, "timeframe": tf_key,
                          "signal": signal, "probability": float(probability)}
        else:
            adv = await asyncio.to_thread(predict_advanced, df, AdvancedConfig(), meta["pip"], meta["spread_price"])
            signal, probability = adv.signal, adv.probability
            sl_pips, tp_pips = adv.sl_pips, adv.tp_pips
            evaluation = {"model": model, "symbol": symbol, "timeframe": tf_key, **adv.to_dict()}
            details = (
                f"\n• BUY {adv.buy_probability:.1f}% | SELL {adv.sell_probability:.1f}% "
                f"(need ≥ {adv.required_probability:.1f}%)"
                f"\n• Decided matches: {adv.resolved_matches}/{adv.matches_used} "
                f"({adv.timeout_rate:.0f}% ran out of time)"
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

        lots, note = self._lots_from_amount(amount, sl_pips, meta, MANUAL_MAX_LOT)
        await self._execute(symbol=symbol, side=signal, model=model, probability=float(probability),
                            sl_pips=sl_pips, tp_pips=tp_pips, lots=lots, pip_value=meta["pip_value"],
                            tf_key=tf_key, tf_label=tf_label, source="SIGNAL", evaluation=evaluation,
                            details=details, note=note, notify=notify)

    # ---------------------------------------------------------------- 🤖 AUTOMATIC mode
    def set_auto(self, on: bool) -> str:
        self.auto.enabled = on
        self.save_auto()
        self._last_auto_bar.clear()   # scan immediately after switching on
        if on:
            self.log("🤖 AUTO mode ON")
            return ("🤖 <b>AUTOMATIC mode is ON</b>\nThe bot now scans on every new "
                    f"{self.auto.timeframe} candle and trades by itself.\n\n"
                    f"<code>{html.escape(self.auto.describe())}</code>\n\n"
                    "Stop any time with /auto_off (or /panic to also close all trades).")
        self.log("✋ AUTO mode OFF (manual)")
        return ("✋ <b>MANUAL mode</b> — automatic trading is OFF.\n"
                "Open trades stay open with their SL/TP. Use /buy /sell /close to trade yourself.")

    async def auto_loop(self) -> None:
        """Checks every AUTO_CHECK_INTERVAL_SEC for a newly closed candle on each auto symbol."""
        while not self.stop_event.is_set():
            try:
                if self.auto.enabled and self.connected:
                    tf_key, tf_const, _ = parse_timeframe(self.auto.timeframe)
                    for symbol in list(self.auto.symbols):
                        if not self.auto.enabled:
                            break
                        bar_time = await self.mt5.call(latest_closed_bar_time, symbol, tf_const)
                        key = f"{symbol}|{tf_key}"
                        if bar_time is None or self._last_auto_bar.get(key) == bar_time:
                            continue
                        self._last_auto_bar[key] = bar_time
                        await self.auto_scan(symbol)
            except Exception:  # noqa: BLE001
                log.exception("Auto loop error")
            try:
                await asyncio.wait_for(self.stop_event.wait(), timeout=AUTO_CHECK_INTERVAL_SEC)
            except asyncio.TimeoutError:
                pass

    async def auto_scan(self, symbol: str) -> None:
        try:
            async with self.trade_lock:
                await self._auto_scan_locked(symbol)
        except Exception as exc:  # noqa: BLE001
            log.exception("Auto scan failed")
            await self.broadcast(f"❌ AUTO {html.escape(symbol)} error: <code>{html.escape(str(exc))}</code>")

    async def _auto_scan_locked(self, symbol: str) -> None:
        s = self.auto
        tf_key, tf_const, tf_label = parse_timeframe(s.timeframe)

        async def skip(reason: str, important: bool = False) -> None:
            text = f"🤖 AUTO {symbol} {tf_key}: skip — {reason}"
            self.log(text)
            if important or s.verbose:
                await self.broadcast(html.escape(text))

        # ---- 1. is it a good TIME and are the conditions safe?
        now = datetime.now(timezone.utc)
        if not in_session(now.hour, s.session_start_utc, s.session_end_utc):
            await skip(f"outside trading hours ({s.session_start_utc:02d}–{s.session_end_utc:02d} UTC)")
            return
        if not await self.mt5.call(ensure_symbol_active, symbol):
            await skip("symbol not available in MT5", important=True)
            return
        meta = await self.mt5.call(get_symbol_meta, symbol)
        acc = await self.mt5.call(get_account)
        if meta is None or acc is None:
            await skip("no symbol/account data")
            return
        if meta["spread_pips"] > s.max_spread_pips:
            await skip(f"spread {meta['spread_pips']:.1f} pips > max {s.max_spread_pips}")
            return

        today = self.today_stats()
        loss_limit = acc["equity"] * s.daily_loss_limit_pct / 100
        if today["pnl_usd"] <= -loss_limit:
            s.enabled = False
            self.save_auto()
            await self.broadcast(f"🛑 <b>Daily loss limit reached</b> (today ${today['pnl_usd']:,.2f}, "
                                 f"limit -{s.daily_loss_limit_pct}% = -${loss_limit:,.2f}).\n"
                                 "AUTO mode switched OFF. Turn it on again with /auto_on when you are ready.")
            return
        if today["auto_trades"] >= s.max_trades_per_day:
            await skip(f"max {s.max_trades_per_day} auto trades today reached")
            return
        positions = await self.mt5.call(get_open_positions)
        if len(positions) >= MAX_OPEN_POSITIONS:
            await skip(f"{len(positions)} bot positions open (max {MAX_OPEN_POSITIONS})")
            return
        if any(p["symbol"] == symbol for p in positions):
            await skip("a position on this symbol is already open")
            return

        # ---- 2. run BOTH models on the same data
        bars = min(HISTORY_BARS, BARS_PER_TIMEFRAME.get(tf_key, HISTORY_BARS))
        df = await self.mt5.call(fetch_closed_rates, symbol, tf_const, bars)
        if df is None:
            await skip("history download failed", important=True)
            return
        c_sig, c_prob = await asyncio.to_thread(predict_market_direction, df, 30, 50, 10)
        adv = await asyncio.to_thread(predict_advanced, df, AdvancedConfig(), meta["pip"], meta["spread_price"])

        # ---- 3. compare and choose the optimal option
        stats = self.tracker.get_model_breakdown()
        decision = choose_trade(c_sig, float(c_prob), CLASSIC_SL_PIPS, CLASSIC_TP_PIPS, adv, stats)
        self.emit("signal_evaluated", {"model": decision.model or "ADVANCED", "symbol": symbol, "timeframe": tf_key,
                                       "signal": decision.action if decision.action != "SKIP" else "NEUTRAL",
                                       "probability": decision.probability or adv.probability,
                                       "buy_probability": adv.buy_probability,
                                       "sell_probability": adv.sell_probability,
                                       "velocity_state": adv.velocity_state})
        if decision.action == "SKIP":
            await skip(decision.reason)
            return

        # ---- 4. size the position: risk % of equity, scaled by confidence
        scale = confidence_scale(decision.confidence)
        risk_usd = acc["equity"] * s.risk_percent / 100 * scale
        lots, size_note = lots_for_risk(risk_usd, decision.sl_pips, meta["pip_value"], meta["volume_min"],
                                        meta["volume_max"], meta["volume_step"], s.max_lot)
        if lots <= 0:
            await skip(size_note, important=True)
            return

        note = (f"{decision.reason}\n• Confidence {decision.confidence * 100:.0f}% → risk "
                f"{s.risk_percent * scale:.2f}% of equity" + (f" ({size_note})" if size_note else ""))
        evaluation = {"decision": decision.to_dict(), "classic_signal": c_sig, "classic_probability": float(c_prob),
                      **{f"adv_{k}": v for k, v in adv.to_dict().items() if k != "last_candle"}}
        await self._execute(symbol=symbol, side=decision.action, model=decision.model,
                            probability=float(decision.probability), sl_pips=decision.sl_pips,
                            tp_pips=decision.tp_pips, lots=lots, pip_value=meta["pip_value"], tf_key=tf_key,
                            tf_label=tf_label, source="AUTO", evaluation=evaluation, details="", note=note,
                            notify=self.broadcast)

    async def status_text(self) -> str:
        acc = await self.mt5.call(get_account) if self.connected else None
        positions = await self.mt5.call(get_open_positions) if self.connected else []
        today = self.today_stats()
        mode = "🤖 AUTOMATIC (trading by itself)" if self.auto.enabled else "✋ MANUAL (auto is off)"
        acc_txt = (f"Balance ${acc['balance']:,.2f} | Equity ${acc['equity']:,.2f}" if acc else "MT5 not connected")
        return (f"<b>Mode:</b> {mode}\n"
                f"<b>Account:</b> {acc_txt}\n"
                f"<b>Open bot positions:</b> {len(positions)}\n"
                f"<b>Today:</b> {today['trades']} trades opened ({today['auto_trades']} auto), "
                f"closed PnL ${today['pnl_usd']:,.2f}\n\n"
                f"<b>Auto settings</b>\n<code>{html.escape(self.auto.describe())}</code>")

    async def panic(self) -> str:
        self.set_auto(False)
        results = await self.mt5.call(close_all_bot_positions) if self.connected else []
        lines = "\n".join(html.escape(r) for r in results) or "no open bot positions"
        self.log("🛑 PANIC: auto off, all bot positions closed")
        return f"🛑 <b>PANIC</b>: AUTO mode OFF and all bot positions closed.\n{lines}"

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
                        source = tr.get("extra", {}).get("source", "")
                        src = " (auto)" if source == "AUTO" else ""
                        text = (f"{icon} <b>DEAL CLOSED {html.escape(MODEL_LABELS.get(tr['model'], tr['model']))}"
                                f"{src}</b>\n"
                                f"• Ticket <code>#{tr['position_id']}</code> {tr['signal']} {tr['symbol']}\n"
                                f"• Result: <b>{tr['outcome']}</b> {tr['pips']:+.1f} pips  "
                                f"({'+' if net >= 0 else '-'}${abs(net):,.2f})")
                        self.log(_plain(text))
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
                mode = "🤖 AUTOMATIC (restored from last run)" if self.auto.enabled else "✋ MANUAL"
                await self.broadcast(f"⚡ <b>Trading Bot online</b> — mode: {mode}.\nSend /menu for buttons "
                                     "or /help for all commands.")
        else:
            self.log("⚠️ TELEGRAM_TOKEN not set - running without Telegram (GUI only).")

        monitor = self.spawn(self.monitor_loop())
        auto = self.spawn(self.auto_loop())
        await self.stop_event.wait()

        self.log("Shutting down…")
        monitor.cancel()
        auto.cancel()
        if self.app is not None:
            await self.app.updater.stop()
            await self.app.stop()
            await self.app.shutdown()
        await self.mt5.call(mt5.shutdown)
        self.mt5.shutdown()


# ======================================================================================
# TELEGRAM
# ======================================================================================
HELP_TEXT = (
    "⚡ <b>Multi-Model Trading Bot</b>\n\n"
    "<b>🎛 Control</b>\n"
    "• /menu – buttons: Auto ON / Manual / Status / Panic\n"
    "• /mode – current mode, account and auto settings\n"
    "• /auto_on – 🤖 start AUTOMATIC trading\n"
    "• /auto_off (or /manual) – ✋ stop automatic trading\n"
    "• /panic – stop auto AND close all bot trades\n\n"
    "<b>✋ Manual trading</b>\n"
    "• /buy <code>[symbol] amount [sl] [tp]</code>\n"
    "• /sell <code>[symbol] amount [sl] [tp]</code>\n"
    "   amount = lots <code>0.05</code> or risk in dollars <code>$50</code>\n"
    "   sl / tp in pips (default {sl:g} / {tp:g})\n"
    "   e.g. <code>/buy EURUSD 0.05</code>  •  <code>/sell GBPUSD $50 25 50</code>\n"
    "• /close <code>ticket</code> – close one trade\n"
    "• /closeall – close all bot trades\n"
    "• /trade_classic <code>[tf] [symbol] [amount]</code> – ask Classic model, trades if it agrees\n"
    "• /trade_advanced <code>[tf] [symbol] [amount]</code> – ask Advanced model\n\n"
    "<b>🤖 Auto settings</b>  (/auto_set <code>name value</code>)\n"
    "   <code>symbols EURUSD,GBPUSD</code> • <code>tf 15m</code> • <code>risk 0.5</code> (% equity)\n"
    "   <code>maxlot 0.5</code> • <code>spread 2</code> • <code>dailyloss 3</code> • <code>maxtrades 10</code>\n"
    "   <code>hours 7-20</code> (UTC) • <code>verbose on</code>\n"
    "• /auto_scan – run one auto analysis right now\n\n"
    "<b>📊 Info</b>\n"
    "• /balance • /price <code>[symbol]</code> • /positions • /stats • /export • /gui • /myid"
)


def authorised(handler):
    """Only chats listed in TELEGRAM_ALLOWED_CHAT_IDS may use trading/account commands."""

    @functools.wraps(handler)
    async def wrapper(update: Update, context: ContextTypes.DEFAULT_TYPE):
        chat_id = update.effective_chat.id if update.effective_chat else None
        if chat_id not in ALLOWED_CHAT_IDS:
            log.warning("Unauthorised command from chat %s", chat_id)
            if update.callback_query:
                await update.callback_query.answer("Not authorised", show_alert=True)
                return
            await update.effective_message.reply_text(
                f"⛔ Not authorised. Your chat id is {chat_id}. Add it to TELEGRAM_ALLOWED_CHAT_IDS."
            )
            return
        return await handler(update, context)

    return wrapper


def menu_keyboard(auto_on: bool) -> InlineKeyboardMarkup:
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🤖 AUTO ON" + (" ✓" if auto_on else ""), callback_data="auto_on"),
         InlineKeyboardButton("✋ MANUAL" + ("" if auto_on else " ✓"), callback_data="auto_off")],
        [InlineKeyboardButton("📊 Status", callback_data="status"),
         InlineKeyboardButton("📂 Positions", callback_data="positions"),
         InlineKeyboardButton("📈 Stats", callback_data="stats")],
        [InlineKeyboardButton("🔍 Scan now", callback_data="scan"),
         InlineKeyboardButton("🛑 PANIC", callback_data="panic")],
    ])


def build_telegram_app(ctrl: TradingController) -> Application:
    request = HTTPXRequest(connect_timeout=30.0, read_timeout=30.0)
    app = ApplicationBuilder().token(TELEGRAM_TOKEN).request(request).concurrent_updates(True).build()

    def reply_to(update: Update) -> Notifier:
        async def _send(text: str) -> None:
            await update.effective_message.reply_text(text, parse_mode=ParseMode.HTML)
            ctrl.emit("log_message", "📨 " + _plain(text.split("\n")[0]))
        return _send

    async def send(update: Update, text: str, keyboard: Optional[InlineKeyboardMarkup] = None) -> None:
        await update.effective_message.reply_text(text, parse_mode=ParseMode.HTML, reply_markup=keyboard)

    # ---------------- basic
    async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, HELP_TEXT.format(sl=MANUAL_SL_PIPS, tp=MANUAL_TP_PIPS))

    async def myid(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await update.effective_message.reply_text(f"Your chat id: {update.effective_chat.id}")

    @authorised
    async def menu(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, "🎛 <b>Control panel</b>", menu_keyboard(ctrl.auto.enabled))

    @authorised
    async def mode(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, await ctrl.status_text(), menu_keyboard(ctrl.auto.enabled))

    # ---------------- auto side
    @authorised
    async def auto_on(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, ctrl.set_auto(True))

    @authorised
    async def auto_off(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, ctrl.set_auto(False))

    @authorised
    async def auto_set(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if len(context.args) < 2:
            await send(update, "Usage: <code>/auto_set name value</code>  e.g. <code>/auto_set risk 0.5</code>\n\n"
                               f"<code>{html.escape(ctrl.auto.describe())}</code>")
            return
        try:
            done = ctrl.auto.update(context.args[0], " ".join(context.args[1:]))
        except (ValueError, IndexError) as exc:
            await send(update, f"⚠️ {html.escape(str(exc))}")
            return
        ctrl.save_auto()
        ctrl._last_auto_bar.clear()
        await send(update, f"✅ Saved: <code>{html.escape(done)}</code>\n\n"
                           f"<code>{html.escape(ctrl.auto.describe())}</code>")

    @authorised
    async def auto_scan(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, f"🔍 Running one AUTO analysis on {', '.join(ctrl.auto.symbols)} "
                           f"[{ctrl.auto.timeframe}] (trades only if the decision is good)…")

        async def run_scan():
            verbose = ctrl.auto.verbose
            ctrl.auto.verbose = True   # show skip reasons for this manual scan
            try:
                for sym in list(ctrl.auto.symbols):
                    await ctrl.auto_scan(sym)
            finally:
                ctrl.auto.verbose = verbose
        ctrl.spawn(run_scan())

    @authorised
    async def panic(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, await ctrl.panic())

    # ---------------- manual side
    def make_order_handler(side: str):
        @authorised
        async def handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
            args = list(context.args)
            symbol = DEFAULT_SYMBOL
            if args and parse_amount(args[0]) is None:
                symbol = args.pop(0).upper()
            if not args:
                await send(update, f"Usage: <code>/{side.lower()} [symbol] amount [sl_pips] [tp_pips]</code>\n"
                                   f"e.g. <code>/{side.lower()} EURUSD 0.05</code> or "
                                   f"<code>/{side.lower()} EURUSD $50 20 40</code>")
                return
            amount = args.pop(0)
            try:
                sl = float(args[0]) if len(args) > 0 else MANUAL_SL_PIPS
                tp = float(args[1]) if len(args) > 1 else MANUAL_TP_PIPS
                if sl <= 0 or tp <= 0:
                    raise ValueError
            except ValueError:
                await send(update, "⚠️ SL and TP must be positive numbers of pips, e.g. 20 40")
                return
            ctrl.spawn(ctrl.manual_order(side, symbol, amount, sl, tp, reply_to(update)))
        return handler

    @authorised
    async def close(update: Update, context: ContextTypes.DEFAULT_TYPE):
        if not context.args or not context.args[0].lstrip("#").isdigit():
            await send(update, "Usage: <code>/close ticket</code> (see /positions for ticket numbers)")
            return
        ok, msg = await ctrl.mt5.call(close_position, int(context.args[0].lstrip("#")))
        await send(update, ("✅ " if ok else "❌ ") + html.escape(msg))

    @authorised
    async def closeall(update: Update, context: ContextTypes.DEFAULT_TYPE):
        results = await ctrl.mt5.call(close_all_bot_positions)
        await send(update, "\n".join(html.escape(r) for r in results) or "📭 No open bot positions.")

    def make_trade_handler(model: str):
        @authorised
        async def handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
            tf_arg = context.args[0] if context.args else "15m"
            symbol = context.args[1].upper() if len(context.args) > 1 else DEFAULT_SYMBOL
            amount = context.args[2] if len(context.args) > 2 else None
            ctrl.spawn(ctrl.run_model(model, symbol, tf_arg, reply_to(update), amount))
        return handler

    # ---------------- info
    @authorised
    async def balance(update: Update, context: ContextTypes.DEFAULT_TYPE):
        acc = await ctrl.mt5.call(get_account)
        if acc is None:
            await update.effective_message.reply_text("❌ Failed to fetch account info.")
            return
        await send(update,
                   "💰 <b>Financial Summary</b>\n\n"
                   f"• <b>Account:</b> <code>{acc['login']}</code> ({html.escape(acc['server'])})\n"
                   f"• <b>Balance:</b> <code>${acc['balance']:,.2f}</code>\n"
                   f"• <b>Equity:</b> <code>${acc['equity']:,.2f}</code>\n"
                   f"• <b>Floating P/L:</b> <code>${acc['profit']:,.2f}</code>\n"
                   f"• <b>Free Margin:</b> <code>${acc['margin_free']:,.2f}</code>\n"
                   f"• <b>Leverage:</b> <code>1:{acc['leverage']}</code>")

    @authorised
    async def price(update: Update, context: ContextTypes.DEFAULT_TYPE):
        symbol = context.args[0].upper() if context.args else DEFAULT_SYMBOL
        tick = await ctrl.mt5.call(get_tick, symbol)
        if tick is None:
            await update.effective_message.reply_text(f"❌ Symbol {symbol} not active.")
            return
        d = tick["digits"]
        await send(update,
                   f"📊 <b>{html.escape(symbol)} Live</b>\nBid: <code>{tick['bid']:.{d}f}</code>\n"
                   f"Ask: <code>{tick['ask']:.{d}f}</code>\nSpread: <code>{tick['spread_pips']:.1f} pips</code>")

    async def positions_text() -> str:
        pos = await ctrl.mt5.call(get_open_positions)
        if not pos:
            return "📭 No open bot positions."
        lines = ["📂 <b>Open positions</b>\n"]
        for p in pos:
            t = ctrl.tracker.get_trade(p["ticket"])
            tag = MODEL_LABELS.get(t["model"], t["model"]) if t else "[UNTRACKED]"
            src = " auto" if t and t.get("extra", {}).get("source") == "AUTO" else ""
            prob = f" {t['probability']:.0f}%" if t and t["probability"] else ""
            lines.append(f"• <code>#{p['ticket']}</code> {html.escape(tag)}{src}{prob} {p['type']} {p['symbol']} "
                         f"{p['volume']} @ {p['price_open']} → <b>${p['profit']:,.2f}</b>")
        lines.append("\nClose one with <code>/close ticket</code>")
        return "\n".join(lines)

    def stats_text() -> str:
        def block(name: str, s: dict) -> str:
            pf = "—" if s["profit_factor"] is None else f"{s['profit_factor']:.2f}"
            return (f"<b>{name}</b>\n"
                    f"• Deals {s['total_closed']} | ✅ {s['wins']} ❌ {s['losses']} | Win rate {s['win_rate']:.1f}%\n"
                    f"• PnL ${s['pnl_usd']:,.2f} | {s['pnl_pips']:+.1f} pips | PF {pf} | Open {s['open_trades']}\n")

        text = "📈 <b>Performance</b>\n\n" + block("ALL", ctrl.tracker.get_summary()) + "\n"
        for key in ("CLASSIC", "ADVANCED", "COMBINED", "MANUAL"):
            text += block(MODEL_LABELS[key], ctrl.tracker.get_summary(key)) + "\n"
        return text

    @authorised
    async def positions(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, await positions_text())

    @authorised
    async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
        await send(update, stats_text())

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

    # ---------------- menu buttons
    @authorised
    async def on_button(update: Update, context: ContextTypes.DEFAULT_TYPE):
        query = update.callback_query
        await query.answer()
        action = query.data
        if action == "auto_on":
            await send(update, ctrl.set_auto(True))
        elif action == "auto_off":
            await send(update, ctrl.set_auto(False))
        elif action == "status":
            await send(update, await ctrl.status_text())
        elif action == "positions":
            await send(update, await positions_text())
        elif action == "stats":
            await send(update, stats_text())
        elif action == "scan":
            await auto_scan(update, context)
            return
        elif action == "panic":
            await send(update, "🛑 <b>Close ALL bot trades and switch AUTO off?</b>", InlineKeyboardMarkup([[
                InlineKeyboardButton("Yes, close everything", callback_data="panic_yes"),
                InlineKeyboardButton("Cancel", callback_data="panic_no")]]))
            return
        elif action == "panic_yes":
            await send(update, await ctrl.panic())
        elif action == "panic_no":
            await send(update, "👍 Cancelled, nothing changed.")
        try:
            await query.edit_message_reply_markup(menu_keyboard(ctrl.auto.enabled))
        except Exception:  # noqa: BLE001  (message unchanged / too old)
            pass

    app.add_handler(CommandHandler(["start", "help"], start))
    app.add_handler(CommandHandler("myid", myid))
    app.add_handler(CommandHandler("menu", menu))
    app.add_handler(CommandHandler(["mode", "status"], mode))
    app.add_handler(CommandHandler("auto_on", auto_on))
    app.add_handler(CommandHandler(["auto_off", "manual"], auto_off))
    app.add_handler(CommandHandler("auto_set", auto_set))
    app.add_handler(CommandHandler("auto_scan", auto_scan))
    app.add_handler(CommandHandler("panic", panic))
    app.add_handler(CommandHandler("buy", make_order_handler("BUY")))
    app.add_handler(CommandHandler("sell", make_order_handler("SELL")))
    app.add_handler(CommandHandler("close", close))
    app.add_handler(CommandHandler("closeall", closeall))
    app.add_handler(CommandHandler(["trade_classic", "trade"], make_trade_handler("CLASSIC")))
    app.add_handler(CommandHandler("trade_advanced", make_trade_handler("ADVANCED")))
    app.add_handler(CommandHandler("balance", balance))
    app.add_handler(CommandHandler("price", price))
    app.add_handler(CommandHandler("positions", positions))
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("export", export))
    app.add_handler(CommandHandler("gui", gui))
    app.add_handler(CallbackQueryHandler(on_button))
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
