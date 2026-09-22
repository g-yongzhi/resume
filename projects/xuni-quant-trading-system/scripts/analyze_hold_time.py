# -*- coding: utf-8 -*-
"""
持仓时长统计分析 —— 用数据替代拍脑袋的 6 小时超时。

用法:
    python scripts/analyze_hold_time.py
    python scripts/analyze_hold_time.py --db user_data/tradesv3.dryrun_70u.sqlite

方法:
    1. 从 SQLite 交易库读取所有已平仓交易
    2. 分别统计盈利单 / 亏损单的持仓时长分布
    3. 按时长分桶，计算每桶胜率与平均收益
    4. 给出 max_hold_minutes 建议值
"""

from __future__ import annotations

import argparse
import sqlite3
import sys
import textwrap
from datetime import datetime
from pathlib import Path

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

ROOT = Path(__file__).resolve().parents[1]

# 时长分桶（分钟）
DURATION_BUCKETS = [
    (0, 15, "0-15min"),
    (15, 30, "15-30min"),
    (30, 60, "30-60min"),
    (60, 120, "1-2h"),
    (120, 240, "2-4h"),
    (240, 360, "4-6h"),
    (360, 720, "6-12h"),
    (720, 1440, "12-24h"),
    (1440, 99999, "24h+"),
]


def _parse_dt(raw: str | None) -> datetime | None:
    if not raw:
        return None
    for fmt in (
        "%Y-%m-%d %H:%M:%S",
        "%Y-%m-%d %H:%M:%S.%f",
        "%Y-%m-%dT%H:%M:%S",
        "%Y-%m-%dT%H:%M:%S.%f",
    ):
        try:
            return datetime.strptime(raw.replace("T", " ").split("+")[0].split("Z")[0], fmt)
        except ValueError:
            continue
    return None


def main() -> int:
    parser = argparse.ArgumentParser(description="持仓时长统计分析")
    parser.add_argument(
        "--db",
        default="user_data/tradesv3.dryrun_70u.sqlite",
        help="SQLite 数据库路径（默认 70U 账本）",
    )
    args = parser.parse_args()
    db_path = Path(args.db)
    if not db_path.is_absolute():
        db_path = ROOT / db_path
    if not db_path.exists():
        print(f"[错误] 找不到数据库: {db_path}")
        return 1

    con = sqlite3.connect(str(db_path))
    cur = con.cursor()

    rows = cur.execute(
        """
        SELECT id, pair, open_date, close_date, close_profit, close_profit_abs
        FROM trades WHERE is_open = 0 AND close_date IS NOT NULL
        ORDER BY id DESC
        """
    ).fetchall()
    con.close()

    if not rows:
        print("[提示] 数据库中没有已平仓的交易记录。")
        print("       请先运行一段时间 Dry-run 或回测后再使用本脚本。")
        return 0

    winners: list[float] = []
    losers: list[float] = []
    all_durations: list[float] = []
    bucket_stats: dict[str, dict] = {label: {"count": 0, "wins": 0, "profit_sum": 0.0} for _, _, label in DURATION_BUCKETS}

    for _tid, pair, open_dt, close_dt, cp, cpa in rows:
        od = _parse_dt(open_dt)
        cd = _parse_dt(close_dt)
        if not od or not cd:
            continue
        duration_min = (cd - od).total_seconds() / 60.0
        if duration_min <= 0:
            continue
        all_durations.append(duration_min)

        profit = float(cp or 0)
        profit_abs = float(cpa or 0)
        is_win = profit > 0

        if is_win:
            winners.append(duration_min)
        else:
            losers.append(duration_min)

        # 分桶统计
        for lo, hi, label in DURATION_BUCKETS:
            if lo <= duration_min < hi:
                bucket_stats[label]["count"] += 1
                if is_win:
                    bucket_stats[label]["wins"] += 1
                bucket_stats[label]["profit_sum"] += profit_abs
                break

    total = len(all_durations)

    # ---- 分位数 ----
    def _pct(values: list[float], q: float) -> float:
        if not values:
            return 0.0
        sorted_vals = sorted(values)
        idx = int(len(sorted_vals) * q / 100.0)
        return sorted_vals[min(idx, len(sorted_vals) - 1)]

    print("=" * 60)
    print(" 持仓时长统计分析")
    print("=" * 60)
    print(f" 统计交易数    : {total} 笔（盈 {len(winners)} / 亏 {len(losers)}）")
    print(f" 总胜率        : {len(winners)/total*100:.1f}%" if total else " 总胜率: N/A")
    print()

    # ---- 分位数表 ----
    print("-" * 60)
    print(" 持仓时长分位数（分钟）")
    print(f" {'分位':>8}  {'全部':>8}  {'盈利单':>8}  {'亏损单':>8}")
    print("-" * 40)
    for q in (25, 50, 75, 90, 95):
        print(
            f" {'P'+str(q):>8}"
            f" {_pct(all_durations, q):>8.0f}"
            f" {_pct(winners, q):>8.0f}"
            f" {_pct(losers, q):>8.0f}"
        )
    print(f" {'均值':>8} {sum(all_durations)/total:>8.0f}" if total else "")

    # ---- 分桶统计 ----
    print()
    print("-" * 60)
    print(" 按时长分桶")
    print(f" {'区间':>10}  {'笔数':>6}  {'胜率':>8}  {'累计盈亏':>12}")
    print("-" * 50)
    for lo, hi, label in DURATION_BUCKETS:
        bs = bucket_stats[label]
        cnt = bs["count"]
        if cnt == 0:
            continue
        wr = bs["wins"] / cnt * 100
        print(f" {label:>10}  {cnt:>6}  {wr:>7.1f}%  {bs['profit_sum']:>+11.2f}")

    # ---- 建议 ----
    print()
    print("-" * 60)
    print(" 建议 max_hold_minutes")

    # 策略：盈利单 P90 与亏损单 P50 的中位数
    win_p90 = _pct(winners, 90)
    loss_p50 = _pct(losers, 50)
    suggested = int((win_p90 + loss_p50) / 2.0)

    # 找盈亏拐点：最后一桶胜率 > 40% 的时长
    elbow_min = 60
    for lo, hi, label in DURATION_BUCKETS:
        bs = bucket_stats[label]
        if bs["count"] >= 3 and bs["wins"] / bs["count"] >= 0.40:
            elbow_min = hi

    recommended = max(suggested, elbow_min)
    # 合理下限
    if recommended < 60:
        recommended = 90
    # 合理上限
    if recommended > 480:
        recommended = 480

    print(f"   盈利单 P90 持仓时长 : {win_p90:.0f} 分钟")
    print(f"   亏损单 P50 持仓时长 : {loss_p50:.0f} 分钟")
    print(f"   盈亏拐点（胜率>40%桶的上界）: {elbow_min} 分钟")
    print(f"   → 建议 max_hold_minutes = {recommended} 分钟（{recommended/60:.1f} 小时）")
    print()
    print(f"   如需在策略中生效，请修改 bot_start() 中的:")
    print(f"     self.max_hold_minutes = {recommended}")
    print("=" * 60)

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
