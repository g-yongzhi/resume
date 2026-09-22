# -*- coding: utf-8 -*-
"""
中文状态报告（老板看板）

用法（项目根目录，已激活 venv）:
    python scripts/status_cn.py

说明:
    - 读取本地 Dry-run 数据库与配置
    - 可选探测 FreqUI / 机器人是否在线
"""

from __future__ import annotations

import json
import sqlite3
import sys
import urllib.request
from datetime import datetime
from pathlib import Path

# Windows 控制台 UTF-8，避免中文乱码
if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "user_data" / "config" / "config.json"


def resolve_db(cfg: dict) -> Path:
    """从 config.db_url 解析本地 sqlite 路径。"""
    raw = str(cfg.get("db_url") or "sqlite:///user_data/tradesv3.dryrun.sqlite")
    if raw.startswith("sqlite:///"):
        rel = raw[len("sqlite:///") :]
        p = Path(rel)
        return p if p.is_absolute() else ROOT / p
    return ROOT / "user_data" / "tradesv3.dryrun.sqlite"


def load_config() -> dict:
    return json.loads(CONFIG.read_text(encoding="utf-8"))


def probe_ui(port: int) -> bool:
    try:
        with urllib.request.urlopen(f"http://127.0.0.1:{port}/", timeout=3) as r:
            return r.status == 200
    except Exception:  # noqa: BLE001
        return False


def fmt_money(v: float | None) -> str:
    if v is None:
        return "-"
    return f"{v:,.2f}"


def main() -> int:
    if not CONFIG.exists():
        print("[错误] 找不到配置文件 user_data/config/config.json")
        return 1

    cfg = load_config()
    db_path = resolve_db(cfg)
    start_wallet = float(cfg.get("dry_run_wallet", 10000) or 10000)
    pairs = cfg.get("exchange", {}).get("pair_whitelist", [])
    strategy = cfg.get("strategy", "-")
    dry_run = cfg.get("dry_run", True)
    port = int(cfg.get("api_server", {}).get("listen_port", 8080) or 8080)
    ui_ok = probe_ui(port)
    mode_tag = "70U大胆验证" if start_wallet <= 100 else "标准模拟"

    open_rows: list[tuple] = []
    closed_rows: list[tuple] = []
    closed_profit = 0.0

    if db_path.exists():
        con = sqlite3.connect(db_path)
        cur = con.cursor()
        open_rows = cur.execute(
            """
            SELECT id, pair, stake_amount, open_rate, open_date
            FROM trades WHERE is_open = 1 ORDER BY id DESC
            """
        ).fetchall()
        closed_rows = cur.execute(
            """
            SELECT id, pair, stake_amount, open_rate, close_rate,
                   close_profit, close_profit_abs, open_date, close_date
            FROM trades WHERE is_open = 0 ORDER BY id DESC LIMIT 10
            """
        ).fetchall()
        row = cur.execute(
            "SELECT COALESCE(SUM(close_profit_abs), 0) FROM trades WHERE is_open = 0"
        ).fetchone()
        closed_profit = float(row[0] or 0.0)
        con.close()

    # 粗估：起始资金 + 已实现盈亏（未计浮动盈亏）
    est_wallet = start_wallet + closed_profit
    est_pnl_pct = (est_wallet / start_wallet - 1.0) * 100.0 if start_wallet else 0.0

    print("=" * 52)
    print(" xuni 量化系统 · 中文状态报告")
    print("=" * 52)
    print(f"时间        : {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"模式        : {'模拟盘 Dry-run' if dry_run else '实盘'} · {mode_tag}")
    print(f"策略        : AdaptiveMultiCoinStrategy（主线 Phase7.5 · 70U）")
    print(f"交易对      : {', '.join(pairs) if pairs else '-'}")
    print(f"网页界面    : http://127.0.0.1:{port}  [{'在线' if ui_ok else '离线'}]")
    print(f"账本文件    : {db_path.name}")
    print("-" * 52)
    print("【模拟钱包】")
    print(f"起始资金    : {fmt_money(start_wallet)} USDT")
    print(f"已实现盈亏  : {fmt_money(closed_profit)} USDT")
    print(f"估算余额    : {fmt_money(est_wallet)} USDT（{est_pnl_pct:+.2f}%）")
    print(f"说明        : 未含当前持仓浮动盈亏；有持仓时以界面 Current profit 为准")
    print("-" * 52)
    print(f"【当前持仓】共 {len(open_rows)} 笔")
    if not open_rows:
        print("  （暂无持仓 —— 正常，系统在等待入场信号）")
    else:
        for tid, pair, stake, open_rate, open_date in open_rows:
            print(
                f"  #{tid} {pair} | 仓位 {fmt_money(stake)} | "
                f"开仓价 {open_rate} | 时间 {open_date}"
            )
    print("-" * 52)
    print(f"【最近平仓】显示最多 10 笔（库内已平仓相关）")
    if not closed_rows:
        print("  （暂无历史成交）")
    else:
        for r in closed_rows:
            tid, pair, stake, o, c, cp, cpa, od, cd = r
            pct = (float(cp) * 100.0) if cp is not None else 0.0
            print(
                f"  #{tid} {pair} | {pct:+.2f}% | "
                f"{fmt_money(cpa)} USDT | {od} -> {cd}"
            )
    print("=" * 52)
    print("提示: 打开网页看图；想快速看中文结论，再运行本脚本即可。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
