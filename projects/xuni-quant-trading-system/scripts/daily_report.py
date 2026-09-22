# -*- coding: utf-8 -*-
"""
每日中文报告：写入 logs/daily/，方便你不用盯英文界面。

用法:
    python scripts/daily_report.py
"""

from __future__ import annotations

import json
import sqlite3
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "user_data" / "config" / "config.json"
OUT_DIR = ROOT / "logs" / "daily"


def resolve_db(cfg: dict) -> Path:
    raw = str(cfg.get("db_url") or "sqlite:///user_data/tradesv3.dryrun.sqlite")
    if raw.startswith("sqlite:///"):
        rel = raw[len("sqlite:///") :]
        p = Path(rel)
        return p if p.is_absolute() else ROOT / p
    return ROOT / "user_data" / "tradesv3.dryrun.sqlite"


def probe_ui(port: int) -> bool:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=3) as r:
            return r.status == 200
    except Exception:  # noqa: BLE001
        return False


def main() -> int:
    cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
    db_path = resolve_db(cfg)
    start_wallet = float(cfg.get("dry_run_wallet", 10000) or 10000)
    port = int(cfg.get("api_server", {}).get("listen_port", 8080) or 8080)
    pairs = cfg.get("exchange", {}).get("pair_whitelist", [])

    open_n = 0
    closed_n = 0
    closed_profit = 0.0
    recent = []
    if db_path.exists():
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        open_n = cur.execute("SELECT COUNT(*) FROM trades WHERE is_open=1").fetchone()[0]
        closed_n = cur.execute("SELECT COUNT(*) FROM trades WHERE is_open=0").fetchone()[0]
        closed_profit = float(
            cur.execute(
                "SELECT COALESCE(SUM(close_profit_abs),0) FROM trades WHERE is_open=0"
            ).fetchone()[0]
            or 0.0
        )
        recent = cur.execute(
            """
            SELECT pair, close_profit, close_profit_abs, open_date, close_date
            FROM trades WHERE is_open=0 ORDER BY id DESC LIMIT 5
            """
        ).fetchall()
        con.close()

    est = start_wallet + closed_profit
    pct = (est / start_wallet - 1.0) * 100.0 if start_wallet else 0.0
    now = datetime.now()
    lines = [
        "=" * 52,
        " xuni 量化系统 · 每日中文报告",
        "=" * 52,
        f"时间        : {now.strftime('%Y-%m-%d %H:%M:%S')}",
        f"模式        : {'模拟盘 Dry-run' if cfg.get('dry_run', True) else '实盘'}",
        f"策略阶段    : Phase 6（15m 短线 + 超时离场）",
        f"交易对      : {', '.join(pairs)}",
        f"网页界面    : http://127.0.0.1:{port}  [{'在线' if probe_ui(port) else '离线'}]",
        "-" * 52,
        "【模拟钱包】",
        f"起始资金    : {start_wallet:,.2f} USDT",
        f"已实现盈亏  : {closed_profit:,.2f} USDT",
        f"估算余额    : {est:,.2f} USDT（{pct:+.2f}%）",
        f"平仓笔数    : {closed_n}",
        f"当前持仓    : {open_n}",
        "-" * 52,
        "【最近平仓】",
    ]
    if not recent:
        lines.append("  （暂无）")
    else:
        for pair, cp, cpa, od, cd in recent:
            lines.append(
                f"  {pair} | {(float(cp or 0)*100):+.2f}% | {float(cpa or 0):+.2f} USDT | {od} -> {cd}"
            )
    lines.extend(
        [
            "-" * 52,
            "【今日观察建议】",
            "  1. 看机器人是否在线",
            "  2. 看有没有新平仓/持仓",
            "  3. 连续亏损时系统会自动冷静期，属正常",
            "  4. 现阶段不要上真金，先积累模拟样本",
            "=" * 52,
        ]
    )
    text = "\n".join(lines) + "\n"
    print(text)

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    out = OUT_DIR / f"daily_{now.strftime('%Y%m%d')}.txt"
    out.write_text(text, encoding="utf-8")
    print(f"[OK] 已保存: {out}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
