"""
trading_gui.py
==============
PyQt6 floating desktop dashboard for the multi-model trading system.

Panels
------
1. Active Deal Probability card  - probability %, BUY/SELL, which model fired it, entry/SL/TP
2. Live tab                      - open positions table with live P/L + manual model buttons
3. Performance tab               - win/loss bar, win rate, cumulative PnL ($ and pips),
                                   Classic vs Advanced side-by-side breakdown, recent closed deals
4. Log tab                       - everything the engine / Telegram bot reports

Threading model
---------------
The GUI runs in the main thread. The trading engine (MT5 + Telegram) runs in a background
asyncio thread and talks to the GUI ONLY through the Qt signals on `GuiBridge`. Qt delivers
signals emitted from another thread as queued events, so this is thread-safe.

Run this file directly to preview the window with simulated data (no MT5 needed):
    python trading_gui.py
"""

from __future__ import annotations

import sys
from datetime import datetime
from typing import Callable, Optional

from PyQt6.QtCore import QObject, QRectF, Qt, QTimer, pyqtSignal
from PyQt6.QtGui import QBrush, QColor, QFont, QPainter, QPen
from PyQt6.QtWidgets import (
    QAbstractItemView,
    QApplication,
    QCheckBox,
    QComboBox,
    QFrame,
    QGridLayout,
    QGroupBox,
    QHBoxLayout,
    QHeaderView,
    QLabel,
    QLineEdit,
    QMainWindow,
    QPlainTextEdit,
    QProgressBar,
    QPushButton,
    QScrollArea,
    QSizePolicy,
    QTableWidget,
    QTableWidgetItem,
    QTabWidget,
    QVBoxLayout,
    QWidget,
)

GREEN = "#26a69a"
RED = "#ef5350"
AMBER = "#ffb300"
BLUE = "#42a5f5"
PURPLE = "#ab47bc"
MODEL_COLORS = {"CLASSIC": BLUE, "ADVANCED": PURPLE}
MODEL_LABELS = {"CLASSIC": "[CLASSIC MODEL]", "ADVANCED": "[ADVANCED MODEL]"}

STYLE = f"""
QWidget {{ background-color: #131722; color: #d1d4dc; font-family: 'Segoe UI', Arial; font-size: 10pt; }}
QGroupBox {{ border: 1px solid #2a2e39; border-radius: 6px; margin-top: 14px; padding: 8px; font-weight: bold; }}
QGroupBox::title {{ subcontrol-origin: margin; left: 10px; padding: 0 4px; color: #9598a1; }}
QTabWidget::pane {{ border: 1px solid #2a2e39; border-radius: 4px; }}
QTabBar::tab {{ background: #1e222d; padding: 6px 14px; border-top-left-radius: 4px; border-top-right-radius: 4px; }}
QTabBar::tab:selected {{ background: #2a2e39; color: white; }}
QTableWidget {{ background: #1e222d; gridline-color: #2a2e39; border: none; }}
QHeaderView::section {{ background: #2a2e39; color: #9598a1; padding: 4px; border: none; }}
QPushButton {{ background: #2a2e39; border: 1px solid #363a45; border-radius: 4px; padding: 6px 12px; }}
QPushButton:hover {{ background: #363a45; }}
QPushButton#classicBtn {{ border-color: {BLUE}; color: {BLUE}; }}
QPushButton#advancedBtn {{ border-color: {PURPLE}; color: {PURPLE}; }}
QLineEdit, QComboBox {{ background: #1e222d; border: 1px solid #363a45; border-radius: 4px; padding: 4px; }}
QPlainTextEdit {{ background: #0e1118; border: none; font-family: Consolas, monospace; font-size: 9pt; }}
QProgressBar {{ background: #1e222d; border: 1px solid #2a2e39; border-radius: 4px; text-align: center; height: 18px; }}
QProgressBar::chunk {{ border-radius: 3px; }}
"""


# ======================================================================================
# Bridge: the only object the background trading thread touches
# ======================================================================================
class GuiBridge(QObject):
    trade_opened = pyqtSignal(dict)        # a deal was executed
    trade_closed = pyqtSignal(dict)        # a deal closed (tracker row)
    signal_evaluated = pyqtSignal(dict)    # a model finished analysing (incl. NEUTRAL)
    positions_updated = pyqtSignal(list)   # live open positions from MT5
    stats_updated = pyqtSignal(dict)       # PerformanceTracker.get_dashboard_snapshot()
    account_updated = pyqtSignal(dict)     # balance / equity / margin
    connection_status = pyqtSignal(bool, str)
    log_message = pyqtSignal(str)
    show_window = pyqtSignal()             # /gui command from Telegram


# ======================================================================================
# Custom widgets
# ======================================================================================
class WinLossBar(QWidget):
    """Horizontal green/red bar showing the win vs loss split with percentages."""

    def __init__(self, parent=None):
        super().__init__(parent)
        self.wins = 0
        self.losses = 0
        self.setMinimumHeight(30)
        self.setSizePolicy(QSizePolicy.Policy.Expanding, QSizePolicy.Policy.Fixed)

    def set_values(self, wins: int, losses: int) -> None:
        self.wins, self.losses = int(wins), int(losses)
        self.update()

    def paintEvent(self, event):  # noqa: N802 (Qt naming)
        p = QPainter(self)
        p.setRenderHint(QPainter.RenderHint.Antialiasing)
        rect = QRectF(self.rect()).adjusted(1, 1, -1, -1)
        total = self.wins + self.losses

        p.setPen(Qt.PenStyle.NoPen)
        if total == 0:
            p.setBrush(QBrush(QColor("#2a2e39")))
            p.drawRoundedRect(rect, 5, 5)
            p.setPen(QPen(QColor("#9598a1")))
            p.drawText(rect, Qt.AlignmentFlag.AlignCenter, "No closed deals yet")
            return

        win_frac = self.wins / total
        win_w = rect.width() * win_frac
        p.setBrush(QBrush(QColor(RED)))
        p.drawRoundedRect(rect, 5, 5)
        if win_w > 0:
            p.setBrush(QBrush(QColor(GREEN)))
            p.drawRoundedRect(QRectF(rect.left(), rect.top(), win_w, rect.height()), 5, 5)

        p.setPen(QPen(QColor("white")))
        font = QFont(self.font())
        font.setBold(True)
        p.setFont(font)
        p.drawText(rect.adjusted(8, 0, 0, 0), Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignLeft,
                   f"WIN {win_frac * 100:.0f}%")
        p.drawText(rect.adjusted(0, 0, -8, 0), Qt.AlignmentFlag.AlignVCenter | Qt.AlignmentFlag.AlignRight,
                   f"LOSS {(1 - win_frac) * 100:.0f}%")


class StatTile(QFrame):
    """Small card: caption + big value."""

    def __init__(self, caption: str, parent=None):
        super().__init__(parent)
        self.setStyleSheet("QFrame { background: #1e222d; border-radius: 6px; }")
        lay = QVBoxLayout(self)
        lay.setContentsMargins(10, 6, 10, 6)
        self.caption = QLabel(caption)
        self.caption.setStyleSheet("color: #9598a1; font-size: 8pt; background: transparent;")
        self.value = QLabel("—")
        self.value.setStyleSheet("font-size: 15pt; font-weight: bold; background: transparent;")
        lay.addWidget(self.caption)
        lay.addWidget(self.value)

    def set(self, text: str, color: Optional[str] = None) -> None:
        self.value.setText(text)
        style = "font-size: 15pt; font-weight: bold; background: transparent;"
        if color:
            style += f" color: {color};"
        self.value.setStyleSheet(style)


def _item(text, color: Optional[str] = None, align_right: bool = False) -> QTableWidgetItem:
    it = QTableWidgetItem(str(text))
    it.setFlags(it.flags() & ~Qt.ItemFlag.ItemIsEditable)
    if color:
        it.setForeground(QBrush(QColor(color)))
    if align_right:
        it.setTextAlignment(Qt.AlignmentFlag.AlignRight | Qt.AlignmentFlag.AlignVCenter)
    return it


def _money(v: float) -> str:
    sign = "+" if v > 0 else "-" if v < 0 else ""
    return f"{sign}${abs(v):,.2f}"


def _pnl_color(v: float) -> Optional[str]:
    return GREEN if v > 0 else RED if v < 0 else None


# ======================================================================================
# Main window
# ======================================================================================
class TradingDashboard(QMainWindow):
    """
    trade_requester(model: str, symbol: str, timeframe: str) is called when the user clicks
    one of the "Run Classic / Run Advanced" buttons. main.py wires it to the trading engine.
    """

    TIMEFRAMES = ["1m", "5m", "15m", "30m", "1h", "4h"]

    def __init__(self, bridge: GuiBridge, trade_requester: Optional[Callable[[str, str, str], None]] = None,
                 default_symbol: str = "EURUSD"):
        super().__init__()
        self.bridge = bridge
        self.trade_requester = trade_requester
        self.default_symbol = default_symbol
        self._active_ticket: Optional[int] = None
        self._open_meta: dict[int, dict] = {}   # ticket -> model/probability (for the positions table)

        self.setWindowTitle("⚡ Multi-Model Algo Trader")
        self.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint, True)
        self.resize(600, 860)
        self.setStyleSheet(STYLE)

        central = QWidget()
        root = QVBoxLayout(central)
        root.setContentsMargins(10, 8, 10, 10)
        root.setSpacing(8)
        root.addLayout(self._build_header())
        root.addWidget(self._build_signal_card())

        self.tabs = QTabWidget()
        self.tabs.addTab(self._build_live_tab(), "Live")
        perf_scroll = QScrollArea()
        perf_scroll.setWidgetResizable(True)
        perf_scroll.setFrameShape(QFrame.Shape.NoFrame)
        perf_scroll.setWidget(self._build_performance_tab())
        self.tabs.addTab(perf_scroll, "Performance")
        self.tabs.addTab(self._build_log_tab(), "Log")
        root.addWidget(self.tabs, 1)
        self.setCentralWidget(central)

        self._connect_bridge()

        # Clock in the header
        self._clock = QTimer(self)
        self._clock.timeout.connect(lambda: self.clock_label.setText(datetime.now().strftime("%H:%M:%S")))
        self._clock.start(1000)

    # ------------------------------------------------------------------ layout builders
    def _build_header(self) -> QHBoxLayout:
        lay = QHBoxLayout()
        self.status_dot = QLabel("●")
        self.status_dot.setStyleSheet(f"color: {AMBER}; font-size: 14pt;")
        self.status_label = QLabel("Connecting to MT5…")
        self.account_label = QLabel("Balance —  |  Equity —")
        self.account_label.setStyleSheet("color: #9598a1;")
        self.clock_label = QLabel("")
        self.clock_label.setStyleSheet("color: #9598a1;")
        self.on_top = QCheckBox("On top")
        self.on_top.setChecked(True)
        self.on_top.toggled.connect(self._toggle_on_top)

        lay.addWidget(self.status_dot)
        lay.addWidget(self.status_label)
        lay.addStretch(1)
        lay.addWidget(self.account_label)
        lay.addWidget(self.clock_label)
        lay.addWidget(self.on_top)
        return lay

    def _build_signal_card(self) -> QGroupBox:
        box = QGroupBox("Active Deal Probability")
        grid = QGridLayout(box)

        self.model_badge = QLabel("NO ACTIVE DEAL")
        self.model_badge.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.model_badge.setStyleSheet("background: #2a2e39; border-radius: 4px; padding: 4px; font-weight: bold;")

        self.signal_label = QLabel("—")
        self.signal_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.signal_label.setStyleSheet("font-size: 22pt; font-weight: bold;")

        self.prob_label = QLabel("0.0%")
        self.prob_label.setAlignment(Qt.AlignmentFlag.AlignCenter)
        self.prob_label.setStyleSheet("font-size: 26pt; font-weight: bold;")

        self.prob_bar = QProgressBar()
        self.prob_bar.setRange(0, 1000)
        self.prob_bar.setTextVisible(False)

        self.deal_details = QLabel("Waiting for the first signal…")
        self.deal_details.setStyleSheet("color: #9598a1;")
        self.deal_details.setWordWrap(True)

        grid.addWidget(self.model_badge, 0, 0, 1, 2)
        grid.addWidget(self.signal_label, 1, 0)
        grid.addWidget(self.prob_label, 1, 1)
        grid.addWidget(self.prob_bar, 2, 0, 1, 2)
        grid.addWidget(self.deal_details, 3, 0, 1, 2)
        return box

    def _build_live_tab(self) -> QWidget:
        w = QWidget()
        lay = QVBoxLayout(w)

        controls = QHBoxLayout()
        self.symbol_input = QLineEdit(self.default_symbol)
        self.symbol_input.setMaximumWidth(100)
        self.tf_combo = QComboBox()
        self.tf_combo.addItems(self.TIMEFRAMES)
        self.classic_btn = QPushButton("▶ Run Classic")
        self.classic_btn.setObjectName("classicBtn")
        self.advanced_btn = QPushButton("▶ Run Advanced")
        self.advanced_btn.setObjectName("advancedBtn")
        self.classic_btn.clicked.connect(lambda: self._request_trade("CLASSIC"))
        self.advanced_btn.clicked.connect(lambda: self._request_trade("ADVANCED"))
        controls.addWidget(QLabel("Symbol"))
        controls.addWidget(self.symbol_input)
        controls.addWidget(self.tf_combo)
        controls.addStretch(1)
        controls.addWidget(self.classic_btn)
        controls.addWidget(self.advanced_btn)
        lay.addLayout(controls)

        self.positions_table = QTableWidget(0, 8)
        self.positions_table.setHorizontalHeaderLabels(
            ["Ticket", "Model", "Symbol", "Side", "Prob %", "Entry", "Current", "P/L $"]
        )
        self._style_table(self.positions_table)
        lay.addWidget(QLabel("Open positions (this bot)"))
        lay.addWidget(self.positions_table, 1)

        self.last_eval_label = QLabel("Last analysis: —")
        self.last_eval_label.setWordWrap(True)
        self.last_eval_label.setStyleSheet("color: #9598a1;")
        lay.addWidget(self.last_eval_label)
        return w

    def _build_performance_tab(self) -> QWidget:
        w = QWidget()
        lay = QVBoxLayout(w)

        # Win / loss
        wl_box = QGroupBox("Win / Loss Ratio")
        wl = QVBoxLayout(wl_box)
        self.winloss_bar = WinLossBar()
        self.winloss_text = QLabel("0 wins  /  0 losses")
        self.winloss_text.setAlignment(Qt.AlignmentFlag.AlignCenter)
        wl.addWidget(self.winloss_bar)
        wl.addWidget(self.winloss_text)
        lay.addWidget(wl_box)

        # Tiles
        tiles = QGridLayout()
        self.tile_trades = StatTile("Closed deals")
        self.tile_winrate = StatTile("Win rate")
        self.tile_pnl = StatTile("Cumulative PnL ($)")
        self.tile_pips = StatTile("Cumulative PnL (pips)")
        self.tile_pf = StatTile("Profit factor")
        self.tile_open = StatTile("Open deals")
        for i, t in enumerate([self.tile_trades, self.tile_winrate, self.tile_pnl,
                               self.tile_pips, self.tile_pf, self.tile_open]):
            tiles.addWidget(t, i // 3, i % 3)
        lay.addLayout(tiles)

        # Model breakdown
        mb_box = QGroupBox("Model Breakdown")
        mb = QVBoxLayout(mb_box)
        self.model_rows = ["Deals", "Wins", "Losses", "Win rate", "PnL ($)", "PnL (pips)",
                           "Avg probability", "Profit factor", "Open"]
        self.model_table = QTableWidget(len(self.model_rows), 2)
        self.model_table.setHorizontalHeaderLabels(["Classic Model", "Advanced Model"])
        self.model_table.setVerticalHeaderLabels(self.model_rows)
        self._style_table(self.model_table, vertical_header=True)
        self.model_table.setMinimumHeight(28 * len(self.model_rows) + 30)
        mb.addWidget(self.model_table)

        bars = QGridLayout()
        self.classic_wr_bar = QProgressBar()
        self.advanced_wr_bar = QProgressBar()
        for bar, color in ((self.classic_wr_bar, BLUE), (self.advanced_wr_bar, PURPLE)):
            bar.setRange(0, 1000)
            bar.setFormat("0.0%")
            bar.setStyleSheet(f"QProgressBar::chunk {{ background: {color}; }}")
        bars.addWidget(QLabel("Classic win rate"), 0, 0)
        bars.addWidget(self.classic_wr_bar, 0, 1)
        bars.addWidget(QLabel("Advanced win rate"), 1, 0)
        bars.addWidget(self.advanced_wr_bar, 1, 1)
        mb.addLayout(bars)
        lay.addWidget(mb_box)

        # Recent deals
        self.recent_table = QTableWidget(0, 6)
        self.recent_table.setHorizontalHeaderLabels(["Ticket", "Model", "Side", "Outcome", "Pips", "PnL $"])
        self._style_table(self.recent_table)
        lay.addWidget(QLabel("Recent closed deals"))
        self.recent_table.setMinimumHeight(220)
        lay.addWidget(self.recent_table, 1)
        return w

    def _build_log_tab(self) -> QWidget:
        w = QWidget()
        lay = QVBoxLayout(w)
        self.log_view = QPlainTextEdit()
        self.log_view.setReadOnly(True)
        self.log_view.setMaximumBlockCount(1000)
        lay.addWidget(self.log_view)
        clear = QPushButton("Clear log")
        clear.clicked.connect(self.log_view.clear)
        lay.addWidget(clear, 0, Qt.AlignmentFlag.AlignRight)
        return w

    @staticmethod
    def _style_table(table: QTableWidget, vertical_header: bool = False) -> None:
        table.horizontalHeader().setSectionResizeMode(QHeaderView.ResizeMode.Stretch)
        table.verticalHeader().setVisible(vertical_header)
        table.setSelectionBehavior(QAbstractItemView.SelectionBehavior.SelectRows)
        table.setEditTriggers(QAbstractItemView.EditTrigger.NoEditTriggers)
        table.setAlternatingRowColors(False)

    # ------------------------------------------------------------------ wiring
    def _connect_bridge(self) -> None:
        b = self.bridge
        b.trade_opened.connect(self.on_trade_opened)
        b.trade_closed.connect(self.on_trade_closed)
        b.signal_evaluated.connect(self.on_signal_evaluated)
        b.positions_updated.connect(self.on_positions_updated)
        b.stats_updated.connect(self.on_stats_updated)
        b.account_updated.connect(self.on_account_updated)
        b.connection_status.connect(self.on_connection_status)
        b.log_message.connect(self.append_log)
        b.show_window.connect(self.bring_to_front)

    def _toggle_on_top(self, checked: bool) -> None:
        self.setWindowFlag(Qt.WindowType.WindowStaysOnTopHint, checked)
        self.show()  # changing window flags hides the window

    def _request_trade(self, model: str) -> None:
        symbol = self.symbol_input.text().strip().upper() or self.default_symbol
        tf = self.tf_combo.currentText()
        if self.trade_requester is None:
            self.append_log("⚠️ No trading engine attached (preview mode).")
            return
        self.append_log(f"🖱 Manual request: {MODEL_LABELS[model]} {symbol} {tf}")
        self.trade_requester(model, symbol, tf)

    # ------------------------------------------------------------------ slots
    def append_log(self, text: str) -> None:
        self.log_view.appendPlainText(f"{datetime.now():%H:%M:%S}  {text}")

    def bring_to_front(self) -> None:
        self.showNormal()
        self.raise_()
        self.activateWindow()

    def on_connection_status(self, ok: bool, message: str) -> None:
        self.status_dot.setStyleSheet(f"color: {GREEN if ok else RED}; font-size: 14pt;")
        self.status_label.setText(message)

    def on_account_updated(self, acc: dict) -> None:
        self.account_label.setText(
            f"Balance ${acc.get('balance', 0):,.2f}  |  Equity ${acc.get('equity', 0):,.2f}"
            f"  |  Free ${acc.get('margin_free', 0):,.2f}"
        )

    def _set_probability(self, prob: float, color: str) -> None:
        self.prob_label.setText(f"{prob:.1f}%")
        self.prob_label.setStyleSheet(f"font-size: 26pt; font-weight: bold; color: {color};")
        self.prob_bar.setValue(int(max(0.0, min(100.0, prob)) * 10))
        self.prob_bar.setStyleSheet(f"QProgressBar::chunk {{ background: {color}; }}")

    def _set_model_badge(self, model: str, suffix: str = "") -> None:
        color = MODEL_COLORS.get(model, "#2a2e39")
        self.model_badge.setText(f"{MODEL_LABELS.get(model, model)}{suffix}")
        self.model_badge.setStyleSheet(
            f"background: {color}; color: white; border-radius: 4px; padding: 4px; font-weight: bold;"
        )

    def on_trade_opened(self, deal: dict) -> None:
        """deal keys: ticket, model, symbol, signal, probability, entry, sl, tp, sl_pips, tp_pips, volume, timeframe"""
        side = deal.get("signal", "?")
        color = GREEN if side == "BUY" else RED
        self._active_ticket = deal.get("ticket")
        self._open_meta[deal.get("ticket")] = {"model": deal.get("model"), "probability": deal.get("probability")}

        self._set_model_badge(deal.get("model", ""), f"  •  #{deal.get('ticket')}")
        self.signal_label.setText(f"{'▲' if side == 'BUY' else '▼'} {side}")
        self.signal_label.setStyleSheet(f"font-size: 22pt; font-weight: bold; color: {color};")
        self._set_probability(float(deal.get("probability", 0)), color)
        self.deal_details.setText(
            f"{deal.get('symbol')} {deal.get('timeframe', '')}  •  {deal.get('volume')} lot  •  "
            f"Entry {deal.get('entry')}  •  SL {deal.get('sl')} ({deal.get('sl_pips')} pips)  •  "
            f"TP {deal.get('tp')} ({deal.get('tp_pips')} pips)  •  opened {datetime.now():%H:%M:%S}"
        )
        self.append_log(f"🚀 {MODEL_LABELS.get(deal.get('model'), '')} {side} {deal.get('symbol')} "
                        f"#{deal.get('ticket')} @ {deal.get('entry')} ({deal.get('probability', 0):.1f}%)")

    def on_trade_closed(self, trade: dict) -> None:
        pid = trade.get("position_id")
        self._open_meta.pop(pid, None)
        net = float(trade.get("net_profit_usd") or 0)
        self.append_log(
            f"{'✅' if net > 0 else '❌'} Closed #{pid} {MODEL_LABELS.get(trade.get('model'), '')} "
            f"{trade.get('outcome')}  {trade.get('pips')} pips  {_money(net)}"
        )
        if pid == self._active_ticket:
            self._active_ticket = None
            self.deal_details.setText(
                f"Last deal #{pid} closed: {trade.get('outcome')} {trade.get('pips')} pips ({_money(net)})"
            )
            self.model_badge.setText(f"{MODEL_LABELS.get(trade.get('model'), '')}  •  CLOSED")

    def on_signal_evaluated(self, ev: dict) -> None:
        """ev keys: model, symbol, timeframe, signal, probability, buy_probability?, sell_probability?, details?"""
        model = ev.get("model", "")
        text = (f"Last analysis: {MODEL_LABELS.get(model, model)} {ev.get('symbol')} {ev.get('timeframe')} → "
                f"{ev.get('signal')} ({ev.get('probability', 0):.1f}%)")
        if "buy_probability" in ev:
            text += f"  |  BUY {ev['buy_probability']:.1f}%  SELL {ev['sell_probability']:.1f}%"
        if ev.get("velocity_state"):
            text += f"  |  Velocity {ev['velocity_state']}"
        self.last_eval_label.setText(text)
        self.append_log(text.replace("Last analysis: ", "🔍 "))

        # If nothing is open, show the fresh evaluation in the probability card
        if self._active_ticket is None:
            sig = ev.get("signal", "NEUTRAL")
            color = GREEN if sig == "BUY" else RED if sig == "SELL" else AMBER
            self._set_model_badge(model, "  •  signal only")
            self.signal_label.setText(sig)
            self.signal_label.setStyleSheet(f"font-size: 22pt; font-weight: bold; color: {color};")
            self._set_probability(float(ev.get("probability", 0)), color)

    def on_positions_updated(self, positions: list) -> None:
        """positions: list of dicts with ticket, symbol, type, volume, price_open, price_current, profit, comment"""
        t = self.positions_table
        t.setRowCount(len(positions))
        for r, pos in enumerate(positions):
            ticket = pos.get("ticket")
            meta = self._open_meta.get(ticket, {})
            model = meta.get("model") or pos.get("model") or ("ADVANCED" if "ADV" in pos.get("comment", "") else "CLASSIC")
            prob = meta.get("probability") or pos.get("probability") or 0
            side = pos.get("type", "?")
            profit = float(pos.get("profit", 0))
            t.setItem(r, 0, _item(ticket))
            t.setItem(r, 1, _item(model, MODEL_COLORS.get(model)))
            t.setItem(r, 2, _item(pos.get("symbol")))
            t.setItem(r, 3, _item(side, GREEN if side == "BUY" else RED))
            t.setItem(r, 4, _item(f"{float(prob):.1f}", align_right=True))
            t.setItem(r, 5, _item(pos.get("price_open"), align_right=True))
            t.setItem(r, 6, _item(pos.get("price_current"), align_right=True))
            t.setItem(r, 7, _item(_money(profit), _pnl_color(profit), align_right=True))

        # Keep the active card's live P/L up to date
        if self._active_ticket is not None:
            for pos in positions:
                if pos.get("ticket") == self._active_ticket:
                    base = self.deal_details.text().split("  •  Live P/L")[0]
                    self.deal_details.setText(f"{base}  •  Live P/L {_money(float(pos.get('profit', 0)))}")

    def on_stats_updated(self, snap: dict) -> None:
        o = snap.get("overall", {})
        self.winloss_bar.set_values(o.get("wins", 0), o.get("losses", 0))
        self.winloss_text.setText(
            f"{o.get('wins', 0)} wins  /  {o.get('losses', 0)} losses  "
            f"({o.get('win_rate', 0):.1f}% / {o.get('loss_rate', 0):.1f}%)"
        )
        self.tile_trades.set(str(o.get("total_closed", 0)))
        wr = o.get("win_rate", 0)
        self.tile_winrate.set(f"{wr:.1f}%", GREEN if wr >= 50 else RED if o.get("total_closed") else None)
        pnl = o.get("pnl_usd", 0)
        self.tile_pnl.set(_money(pnl), _pnl_color(pnl))
        pips = o.get("pnl_pips", 0)
        self.tile_pips.set(f"{pips:+.1f}", _pnl_color(pips))
        pf = o.get("profit_factor")
        self.tile_pf.set("—" if pf is None else f"{pf:.2f}")
        self.tile_open.set(str(o.get("open_trades", 0)))

        models = snap.get("models", {})
        for col, key in enumerate(("CLASSIC", "ADVANCED")):
            m = models.get(key, {})
            pf_m = m.get("profit_factor")
            values = [
                (m.get("total_closed", 0), None),
                (m.get("wins", 0), GREEN),
                (m.get("losses", 0), RED),
                (f"{m.get('win_rate', 0):.1f}%", None),
                (_money(m.get("pnl_usd", 0)), _pnl_color(m.get("pnl_usd", 0))),
                (f"{m.get('pnl_pips', 0):+.1f}", _pnl_color(m.get("pnl_pips", 0))),
                (f"{m.get('avg_probability', 0):.1f}%", None),
                ("—" if pf_m is None else f"{pf_m:.2f}", None),
                (m.get("open_trades", 0), None),
            ]
            for row, (val, color) in enumerate(values):
                self.model_table.setItem(row, col, _item(val, color, align_right=True))
            bar = self.classic_wr_bar if key == "CLASSIC" else self.advanced_wr_bar
            bar.setValue(int(m.get("win_rate", 0) * 10))
            bar.setFormat(f"{m.get('win_rate', 0):.1f}%  ({m.get('wins', 0)}W / {m.get('losses', 0)}L)")

        recent = snap.get("recent", [])
        self.recent_table.setRowCount(len(recent))
        for r, tr in enumerate(recent):
            net = float(tr.get("net_profit_usd") or 0)
            self.recent_table.setItem(r, 0, _item(tr.get("position_id")))
            self.recent_table.setItem(r, 1, _item(tr.get("model"), MODEL_COLORS.get(tr.get("model"))))
            self.recent_table.setItem(r, 2, _item(tr.get("signal"), GREEN if tr.get("signal") == "BUY" else RED))
            self.recent_table.setItem(r, 3, _item(tr.get("outcome"), _pnl_color(net)))
            self.recent_table.setItem(r, 4, _item(f"{tr.get('pips') or 0:+.1f}", align_right=True))
            self.recent_table.setItem(r, 5, _item(_money(net), _pnl_color(net), align_right=True))


def create_gui(trade_requester: Optional[Callable[[str, str, str], None]] = None,
               default_symbol: str = "EURUSD") -> tuple[QApplication, GuiBridge, TradingDashboard]:
    """Convenience factory used by main.py."""
    app = QApplication.instance() or QApplication(sys.argv)
    bridge = GuiBridge()
    window = TradingDashboard(bridge, trade_requester, default_symbol)
    return app, bridge, window


# ======================================================================================
# Preview mode: python trading_gui.py
# ======================================================================================
if __name__ == "__main__":
    import random

    app, bridge, window = create_gui()
    window.show()

    state = {"ticket": 500000, "open": [], "closed": [], "price": 1.10000}

    def fake_tick():
        state["price"] += random.gauss(0, 0.00008)
        positions = []
        for d in state["open"]:
            diff = state["price"] - d["entry"] if d["signal"] == "BUY" else d["entry"] - state["price"]
            positions.append({"ticket": d["ticket"], "symbol": "EURUSD", "type": d["signal"], "volume": 0.01,
                              "price_open": d["entry"], "price_current": round(state["price"], 5),
                              "profit": round(diff * 100000 * 0.01, 2), "comment": d["model"]})
        bridge.positions_updated.emit(positions)
        bridge.account_updated.emit({"balance": 10000 + sum(c["net_profit_usd"] for c in state["closed"]),
                                     "equity": 10000, "margin_free": 9800})

    def fake_trade():
        model = random.choice(["CLASSIC", "ADVANCED"])
        side = random.choice(["BUY", "SELL"])
        state["ticket"] += 1
        prob = random.uniform(55, 80)
        bridge.signal_evaluated.emit({"model": model, "symbol": "EURUSD", "timeframe": "1m", "signal": side,
                                      "probability": prob})
        deal = {"ticket": state["ticket"], "model": model, "symbol": "EURUSD", "signal": side,
                "probability": prob, "entry": round(state["price"], 5), "sl": 0, "tp": 0,
                "sl_pips": 15, "tp_pips": 30, "volume": 0.01, "timeframe": "1m"}
        state["open"].append(deal)
        bridge.trade_opened.emit(deal)

    def fake_close():
        if not state["open"]:
            return
        d = state["open"].pop(0)
        win = random.random() < 0.6
        net = 3.0 if win else -1.5
        trade = {"position_id": d["ticket"], "model": d["model"], "signal": d["signal"],
                 "outcome": "WIN" if win else "LOSS", "pips": 30.0 if win else -15.0, "net_profit_usd": net,
                 "probability": d["probability"]}
        state["closed"].insert(0, trade)
        bridge.trade_closed.emit(trade)

        def summary(rows, name):
            w = sum(1 for r in rows if r["outcome"] == "WIN")
            lo = len(rows) - w
            return {"model": name, "total_closed": len(rows), "wins": w, "losses": lo,
                    "win_rate": w / len(rows) * 100 if rows else 0, "loss_rate": lo / len(rows) * 100 if rows else 0,
                    "pnl_usd": sum(r["net_profit_usd"] for r in rows), "pnl_pips": sum(r["pips"] for r in rows),
                    "avg_probability": sum(r["probability"] for r in rows) / len(rows) if rows else 0,
                    "profit_factor": (w * 3.0) / (lo * 1.5) if lo else None,
                    "open_trades": sum(1 for o in state["open"] if o["model"] == name or name == "ALL")}

        closed = state["closed"]
        bridge.stats_updated.emit({
            "overall": summary(closed, "ALL"),
            "models": {m: summary([c for c in closed if c["model"] == m], m) for m in ("CLASSIC", "ADVANCED")},
            "recent": closed[:10],
        })

    bridge.connection_status.emit(True, "PREVIEW MODE (simulated data)")
    t1 = QTimer(); t1.timeout.connect(fake_tick); t1.start(1000)
    t2 = QTimer(); t2.timeout.connect(fake_trade); t2.start(4000)
    t3 = QTimer(); t3.timeout.connect(fake_close); t3.start(6000)
    sys.exit(app.exec())
