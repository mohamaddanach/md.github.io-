"""
performance_tracker.py
======================
Persistent deal logger + analytics for the multi-model trading system.

- Stores every deal in a local SQLite database (trading_performance.db, created automatically)
- Records which model fired it (CLASSIC / ADVANCED), its probability, SL/TP, entry, exit
- Detects closed positions by reading MT5 deal history (sync_with_mt5)
- Computes win/loss ratio, cumulative PnL in USD and pips, and per-model breakdowns
- Can export everything to JSON (export_json) for backups or external analysis

Thread-safe: every public method holds an internal lock, so the Telegram/asyncio thread
and the GUI thread can both use the same tracker instance.
"""

from __future__ import annotations

import json
import sqlite3
import threading
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Optional

MODELS = ("CLASSIC", "ADVANCED")

_SCHEMA = """
CREATE TABLE IF NOT EXISTS trades (
    position_id     INTEGER PRIMARY KEY,
    order_ticket    INTEGER,
    model           TEXT    NOT NULL,
    symbol          TEXT    NOT NULL,
    timeframe       TEXT,
    signal          TEXT    NOT NULL,
    probability     REAL,
    volume          REAL,
    entry_price     REAL,
    sl              REAL,
    tp              REAL,
    pip_size        REAL,
    open_time       TEXT,
    status          TEXT    NOT NULL DEFAULT 'OPEN',
    close_price     REAL,
    close_time      TEXT,
    profit_usd      REAL,
    commission      REAL,
    swap            REAL,
    net_profit_usd  REAL,
    pips            REAL,
    outcome         TEXT,
    extra_json      TEXT
);
CREATE INDEX IF NOT EXISTS idx_trades_status ON trades(status);
CREATE INDEX IF NOT EXISTS idx_trades_model  ON trades(model);
"""


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


class PerformanceTracker:
    def __init__(self, db_path: str | Path = "trading_performance.db"):
        self.db_path = str(db_path)
        self._lock = threading.RLock()
        self._conn = sqlite3.connect(self.db_path, check_same_thread=False)
        self._conn.row_factory = sqlite3.Row
        with self._lock:
            self._conn.executescript(_SCHEMA)
            self._conn.commit()

    # ------------------------------------------------------------------ writes
    def record_open(
        self,
        position_id: int,
        model: str,
        symbol: str,
        signal: str,
        probability: float,
        volume: float,
        entry_price: float,
        sl: float,
        tp: float,
        pip_size: float,
        order_ticket: Optional[int] = None,
        timeframe: str = "",
        open_time: Optional[str] = None,
        extra: Optional[dict] = None,
    ) -> dict:
        row = {
            "position_id": int(position_id),
            "order_ticket": int(order_ticket) if order_ticket is not None else None,
            "model": model.upper(),
            "symbol": symbol.upper(),
            "timeframe": timeframe,
            "signal": signal.upper(),
            "probability": float(probability),
            "volume": float(volume),
            "entry_price": float(entry_price),
            "sl": float(sl),
            "tp": float(tp),
            "pip_size": float(pip_size),
            "open_time": open_time or _now_iso(),
            "status": "OPEN",
            "extra_json": json.dumps(extra or {}, default=str),
        }
        cols = ", ".join(row)
        marks = ", ".join("?" for _ in row)
        with self._lock:
            self._conn.execute(f"INSERT OR REPLACE INTO trades ({cols}) VALUES ({marks})", tuple(row.values()))
            self._conn.commit()
        return self.get_trade(position_id) or row

    def record_close(
        self,
        position_id: int,
        close_price: float,
        profit_usd: float,
        commission: float = 0.0,
        swap: float = 0.0,
        close_time: Optional[str] = None,
    ) -> Optional[dict]:
        trade = self.get_trade(position_id)
        if trade is None:
            return None

        pip = trade["pip_size"] or 0.0001
        if trade["signal"] == "BUY":
            pips = (close_price - trade["entry_price"]) / pip
        else:
            pips = (trade["entry_price"] - close_price) / pip

        net = float(profit_usd) + float(commission) + float(swap)
        if net > 0:
            outcome = "WIN"
        elif net < 0:
            outcome = "LOSS"
        else:
            outcome = "BREAKEVEN"

        with self._lock:
            self._conn.execute(
                """UPDATE trades SET status='CLOSED', close_price=?, close_time=?, profit_usd=?,
                   commission=?, swap=?, net_profit_usd=?, pips=?, outcome=? WHERE position_id=?""",
                (
                    float(close_price),
                    close_time or _now_iso(),
                    float(profit_usd),
                    float(commission),
                    float(swap),
                    round(net, 2),
                    round(pips, 1),
                    outcome,
                    int(position_id),
                ),
            )
            self._conn.commit()
        return self.get_trade(position_id)

    # ------------------------------------------------------------------ reads
    @staticmethod
    def _row_to_dict(row: sqlite3.Row) -> dict:
        d = dict(row)
        try:
            d["extra"] = json.loads(d.pop("extra_json") or "{}")
        except (TypeError, json.JSONDecodeError):
            d["extra"] = {}
        return d

    def get_trade(self, position_id: int) -> Optional[dict]:
        with self._lock:
            row = self._conn.execute("SELECT * FROM trades WHERE position_id=?", (int(position_id),)).fetchone()
        return self._row_to_dict(row) if row else None

    def get_open_trades(self) -> list[dict]:
        with self._lock:
            rows = self._conn.execute("SELECT * FROM trades WHERE status='OPEN' ORDER BY open_time").fetchall()
        return [self._row_to_dict(r) for r in rows]

    def get_recent_closed(self, limit: int = 20) -> list[dict]:
        with self._lock:
            rows = self._conn.execute(
                "SELECT * FROM trades WHERE status='CLOSED' ORDER BY close_time DESC LIMIT ?", (limit,)
            ).fetchall()
        return [self._row_to_dict(r) for r in rows]

    def get_summary(self, model: Optional[str] = None) -> dict[str, Any]:
        """Win/loss, win rate, PnL ($ and pips) for all trades or for one model."""
        where = "WHERE model=?" if model else ""
        params: tuple = (model.upper(),) if model else ()
        with self._lock:
            closed = self._conn.execute(
                f"""SELECT
                        COUNT(*)                                   AS total,
                        SUM(CASE WHEN outcome='WIN'  THEN 1 ELSE 0 END)       AS wins,
                        SUM(CASE WHEN outcome='LOSS' THEN 1 ELSE 0 END)       AS losses,
                        SUM(CASE WHEN outcome='BREAKEVEN' THEN 1 ELSE 0 END)  AS breakeven,
                        COALESCE(SUM(net_profit_usd), 0)           AS pnl_usd,
                        COALESCE(SUM(pips), 0)                     AS pnl_pips,
                        COALESCE(AVG(probability), 0)              AS avg_probability,
                        COALESCE(MAX(net_profit_usd), 0)           AS best_usd,
                        COALESCE(MIN(net_profit_usd), 0)           AS worst_usd,
                        COALESCE(AVG(CASE WHEN outcome='WIN'  THEN net_profit_usd END), 0) AS avg_win_usd,
                        COALESCE(AVG(CASE WHEN outcome='LOSS' THEN net_profit_usd END), 0) AS avg_loss_usd
                    FROM trades {where + (' AND' if where else 'WHERE')} status='CLOSED'""",
                params,
            ).fetchone()
            open_count = self._conn.execute(
                f"SELECT COUNT(*) FROM trades {where + (' AND' if where else 'WHERE')} status='OPEN'", params
            ).fetchone()[0]

        wins = closed["wins"] or 0
        losses = closed["losses"] or 0
        decided = wins + losses
        win_rate = (wins / decided * 100) if decided else 0.0
        gross_win = wins * (closed["avg_win_usd"] or 0)
        gross_loss = abs(losses * (closed["avg_loss_usd"] or 0))
        return {
            "model": model.upper() if model else "ALL",
            "total_closed": closed["total"] or 0,
            "wins": wins,
            "losses": losses,
            "breakeven": closed["breakeven"] or 0,
            "win_rate": round(win_rate, 2),
            "loss_rate": round(100 - win_rate, 2) if decided else 0.0,
            "pnl_usd": round(closed["pnl_usd"], 2),
            "pnl_pips": round(closed["pnl_pips"], 1),
            "avg_probability": round(closed["avg_probability"], 2),
            "best_usd": round(closed["best_usd"], 2),
            "worst_usd": round(closed["worst_usd"], 2),
            "avg_win_usd": round(closed["avg_win_usd"], 2),
            "avg_loss_usd": round(closed["avg_loss_usd"], 2),
            # None = no losing trades yet (profit factor undefined)
            "profit_factor": round(gross_win / gross_loss, 2) if gross_loss else None,
            "open_trades": open_count,
        }

    def get_model_breakdown(self) -> dict[str, dict]:
        return {m: self.get_summary(m) for m in MODELS}

    def get_dashboard_snapshot(self) -> dict:
        """Everything the GUI needs in one call."""
        return {
            "overall": self.get_summary(),
            "models": self.get_model_breakdown(),
            "recent": self.get_recent_closed(10),
        }

    # ------------------------------------------------------------------ MT5 sync
    def sync_with_mt5(self, mt5_module) -> list[dict]:
        """
        Checks every OPEN trade against MT5. If its position no longer exists, the exit
        deals are read from history and the trade is closed in the database.
        Call this from the same thread that owns the MT5 connection.
        Returns the list of trades closed during this sync.
        """
        closed_now = []
        entry_out = {getattr(mt5_module, "DEAL_ENTRY_OUT", 1), getattr(mt5_module, "DEAL_ENTRY_OUT_BY", 3)}

        for trade in self.get_open_trades():
            pid = trade["position_id"]
            still_open = mt5_module.positions_get(ticket=pid)
            if still_open:
                continue

            deals = mt5_module.history_deals_get(position=pid)
            if not deals:
                # History not loaded yet (or position unknown) - try again next cycle
                continue

            exits = [d for d in deals if d.entry in entry_out]
            if not exits:
                continue

            profit = sum(d.profit for d in deals)
            commission = sum(d.commission for d in deals)
            swap = sum(d.swap for d in deals)
            fee = sum(getattr(d, "fee", 0.0) for d in deals)
            total_volume = sum(d.volume for d in exits) or 1.0
            close_price = sum(d.price * d.volume for d in exits) / total_volume
            close_time = datetime.fromtimestamp(max(d.time for d in exits), tz=timezone.utc).isoformat(timespec="seconds")

            updated = self.record_close(pid, close_price, profit, commission + fee, swap, close_time)
            if updated:
                closed_now.append(updated)
        return closed_now

    # ------------------------------------------------------------------ export
    def export_json(self, path: str | Path = "trading_performance.json") -> str:
        with self._lock:
            rows = self._conn.execute("SELECT * FROM trades ORDER BY open_time").fetchall()
        payload = {
            "exported_at": _now_iso(),
            "summary": self.get_summary(),
            "models": self.get_model_breakdown(),
            "trades": [self._row_to_dict(r) for r in rows],
        }
        Path(path).write_text(json.dumps(payload, indent=2, default=str), encoding="utf-8")
        return str(path)

    def close(self) -> None:
        with self._lock:
            self._conn.close()


if __name__ == "__main__":
    # Self-test with a temporary database (no MT5 needed)
    import os
    import tempfile

    tmp = os.path.join(tempfile.mkdtemp(), "test_perf.db")
    tr = PerformanceTracker(tmp)
    tr.record_open(1001, "CLASSIC", "EURUSD", "BUY", 64.0, 0.01, 1.10000, 1.09850, 1.10300, 0.0001)
    tr.record_open(1002, "ADVANCED", "EURUSD", "SELL", 58.5, 0.01, 1.10100, 1.10160, 1.09980, 0.0001)
    tr.record_open(1003, "ADVANCED", "EURUSD", "BUY", 61.0, 0.01, 1.10050, 1.09990, 1.10170, 0.0001)
    tr.record_close(1001, 1.10300, 3.00)
    tr.record_close(1002, 1.09980, 1.20, commission=-0.07)
    print(json.dumps(tr.get_dashboard_snapshot(), indent=2, default=str))
    print("Exported to", tr.export_json(os.path.join(os.path.dirname(tmp), "perf.json")))
