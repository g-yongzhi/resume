# -*- coding: utf-8 -*-
"""
回测质量指标报告 —— 从 Freqtrade 回测输出提取并格式化质量指标。

用法:
    python scripts/backtest_report.py
    python scripts/backtest_report.py --input user_data/backtest_results/backtest-result-2026-07-30_17-37-55.zip

输出:
    1. 核心指标总览（收益率、夏普、索提诺、回撤、胜率、盈亏比）
    2. 逐交易对分析
    3. 质量阈值检查
    4. 保存 Markdown 报告到 user_data/backtest_results/
"""

from __future__ import annotations

import argparse
import json
import re
import sys
import zipfile
from datetime import datetime
from io import TextIOWrapper
from pathlib import Path
from typing import Any

if hasattr(sys.stdout, "reconfigure"):
    try:
        sys.stdout.reconfigure(encoding="utf-8")
        sys.stderr.reconfigure(encoding="utf-8")
    except Exception:  # noqa: BLE001
        pass

ROOT = Path(__file__).resolve().parents[1]

QUALITY_TARGETS = {
    "sharpe_ratio": 0.0,
    "sortino_ratio": 0.0,
    "max_drawdown_pct": 25.0,
    "win_rate_pct": 40.0,
    "profit_factor": 1.0,
    "avg_win_loss_ratio": 1.2,
}


def parse_backtest_zip(zip_path: Path) -> dict[str, Any]:
    """从 Freqtrade 回测 ZIP 文件中提取所有指标（JSON 格式）。"""
    result: dict[str, Any] = {"pairs": {}, "exit_reasons": {}}

    if not zip_path.exists():
        return {"error": f"文件不存在: {zip_path}"}

    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            file_list = zf.namelist()

            # 1) 优先读取 JSON trades 文件
            for fname in file_list:
                if fname.endswith(".json") and "config" not in fname.lower() and "strategy" not in fname.lower():
                    text = TextIOWrapper(zf.open(fname), encoding="utf-8").read()
                    _parse_trades_json(text, result)
                    break

            # 2) 读取配置文件获取初始资金
            for fname in file_list:
                if "config" in fname.lower() and fname.endswith(".json"):
                    cfg_text = TextIOWrapper(zf.open(fname), encoding="utf-8").read()
                    try:
                        cfg = json.loads(cfg_text)
                        result["start_wallet"] = float(cfg.get("dry_run_wallet", 70) or 70)
                    except (json.JSONDecodeError, ValueError):
                        pass
                    break

    except Exception as exc:
        result["error"] = str(exc)

    return result


def _parse_trades_json(text: str, result: dict) -> None:
    """从 JSON 交易明细计算所有指标。"""
    try:
        data = json.loads(text)
    except json.JSONDecodeError:
        return

    # 定位 trades 数组
    trades: list[dict] = []
    if "strategy" in data:
        for strategy_name, strategy_data in data["strategy"].items():
            trades = strategy_data.get("trades", [])
            break
    elif isinstance(data, list):
        trades = data
    else:
        for v in data.values():
            if isinstance(v, dict) and "trades" in v:
                trades = v["trades"]
                break

    if not trades:
        return

    profits: list[float] = []
    wins_profits: list[float] = []
    losses_profits: list[float] = []
    durations: list[float] = []
    pair_stats: dict[str, dict] = {}
    exit_stats: dict[str, dict] = {}

    start_wallet = 70.0  # 固定 70U，不从旧 ZIP 的过期 config 读

    for t in trades:
        profit_ratio = float(t.get("profit_ratio", 0))
        profit_abs = float(t.get("profit_abs", 0))
        duration = float(t.get("trade_duration", 0))
        pair = t.get("pair", "UNKNOWN")
        exit_reason = t.get("exit_reason", "unknown")

        profits.append(profit_abs)
        durations.append(duration)

        if profit_ratio > 0:
            wins_profits.append(profit_abs)
        else:
            losses_profits.append(profit_abs)

        # 逐对统计
        if pair not in pair_stats:
            pair_stats[pair] = {"trades": 0, "wins": 0, "profit_sum": 0.0}
        pair_stats[pair]["trades"] += 1
        pair_stats[pair]["profit_sum"] += profit_abs
        if profit_ratio > 0:
            pair_stats[pair]["wins"] += 1

        # 退出原因统计
        if exit_reason not in exit_stats:
            exit_stats[exit_reason] = {"count": 0, "wins": 0, "profit_sum": 0.0}
        exit_stats[exit_reason]["count"] += 1
        exit_stats[exit_reason]["profit_sum"] += profit_abs
        if profit_ratio > 0:
            exit_stats[exit_reason]["wins"] += 1

    total_trades = len(trades)
    if total_trades == 0:
        return

    wins_count = len(wins_profits)
    losses_count = len(losses_profits)

    total_profit = sum(profits)
    total_wins = sum(wins_profits) if wins_profits else 0
    total_losses = abs(sum(losses_profits)) if losses_profits else 0

    result["total_trades"] = total_trades
    result["win_rate_pct"] = wins_count / total_trades * 100
    result["profit_pct"] = total_profit / start_wallet * 100
    result["total_profit_abs"] = total_profit
    result["profit_factor"] = total_wins / total_losses if total_losses > 0 else float("inf")
    result["avg_win"] = sum(wins_profits) / wins_count if wins_count else 0
    result["avg_loss"] = sum(losses_profits) / losses_count if losses_count else 0
    result["avg_win_loss_ratio"] = (
        abs(result["avg_win"] / result["avg_loss"]) if result.get("avg_loss") else float("inf")
    )
    result["avg_duration_min"] = sum(durations) / total_trades
    result["avg_duration_win"] = (
        sum(d for i, d in enumerate(durations) if profits[i] > 0) / wins_count if wins_count else 0
    )
    result["avg_duration_loss"] = (
        sum(d for i, d in enumerate(durations) if profits[i] <= 0) / losses_count if losses_count else 0
    )

    # 最大回撤（从累计盈亏曲线估算）
    cumsum = 0.0
    peak = 0.0
    max_dd = 0.0
    for p in profits:
        cumsum += p
        if cumsum > peak:
            peak = cumsum
        dd = peak - cumsum
        if dd > max_dd:
            max_dd = dd
    result["max_drawdown_abs"] = max_dd
    result["max_drawdown_pct"] = max_dd / start_wallet * 100

    # 连续盈亏
    max_consec_wins = max_consec_losses = cur_wins = cur_losses = 0
    for p in profits:
        if p > 0:
            cur_wins += 1
            cur_losses = 0
            max_consec_wins = max(max_consec_wins, cur_wins)
        else:
            cur_losses += 1
            cur_wins = 0
            max_consec_losses = max(max_consec_losses, cur_losses)
    result["max_consecutive_wins"] = max_consec_wins
    result["max_consecutive_losses"] = max_consec_losses

    # 夏普比率（简化版：日化）
    if len(profits) > 1:
        daily_returns = _approx_daily_returns(profits, start_wallet)
        if daily_returns and len(daily_returns) > 1:
            mean_r = sum(daily_returns) / len(daily_returns)
            std_r = (sum((r - mean_r) ** 2 for r in daily_returns) / len(daily_returns)) ** 0.5
            result["sharpe_ratio"] = (mean_r / std_r * (252 ** 0.5)) if std_r > 0 else 0
            # 索提诺（仅下行标准差）
            down_r = [r for r in daily_returns if r < 0]
            if down_r:
                down_std = (sum((r - 0) ** 2 for r in down_r) / len(down_r)) ** 0.5
                result["sortino_ratio"] = (mean_r / down_std * (252 ** 0.5)) if down_std > 0 else 0

    # 逐对汇总
    for pair, stats in pair_stats.items():
        if stats["trades"] > 0:
            stats["win_rate"] = stats["wins"] / stats["trades"] * 100
    result["pairs"] = pair_stats

    # 退出原因汇总
    for reason, stats in exit_stats.items():
        if stats["count"] > 0:
            stats["win_rate"] = stats["wins"] / stats["count"] * 100
    result["exit_reasons"] = exit_stats


def _approx_daily_returns(profits: list[float], start_wallet: float) -> list[float]:
    """将逐笔盈亏近似分配到日。简单做法：按交易序号时间跨度估算日数。"""
    n = len(profits)
    if n < 2:
        return []
    # 假设交易均匀分布在回测期内，估算每日盈亏
    cumsum = start_wallet
    daily_returns = []
    chunk = max(1, n // 30)  # 假设约 30 个交易日
    for i in range(0, n, chunk):
        chunk_profit = sum(profits[i : i + chunk])
        daily_returns.append(chunk_profit / cumsum)
    return daily_returns


def quality_check(result: dict) -> list[tuple[str, bool, str]]:
    checks = []
    target_keys = [
        ("sharpe_ratio", "夏普比率"),
        ("sortino_ratio", "索提诺比率"),
        ("win_rate_pct", "胜率"),
        ("win_rate_csv", "胜率(CSV)"),
        ("profit_factor", "盈利因子"),
        ("avg_win_loss_ratio", "盈亏比"),
    ]
    for key, label in target_keys:
        val = result.get(key)
        if val is None:
            continue
        threshold = QUALITY_TARGETS.get(key, 0)
        ok = val >= threshold
        checks.append((label, ok, f"{val:.2f} (阈值 ≥ {threshold})"))
        break  # only use first match

    # 回撤是越小越好
    dd = result.get("max_drawdown_pct")
    if dd is not None:
        max_dd = QUALITY_TARGETS["max_drawdown_pct"]
        ok = dd <= max_dd
        checks.append(("最大回撤", ok, f"{dd:.2f}% (阈值 ≤ {max_dd}%)"))

    # 综合检查
    specs = [
        ("sharpe_ratio", "夏普比率", lambda v: v >= 0),
        ("win_rate_pct", "胜率", lambda v: v >= 40),
        ("profit_factor", "盈利因子", lambda v: v >= 1.0),
        ("max_drawdown_pct", "最大回撤", lambda v: v <= 25),
    ]
    for key, label, check_fn in specs:
        v = result.get(key)
        if v is None:
            alt_key = key + "_csv"
            v = result.get(alt_key)
            if v is None and key == "win_rate_pct":
                v = result.get("win_rate_csv")
        if v is not None:
            ok = check_fn(v)
            if not any(c[0] == label for c in checks):
                checks.append((label, ok, f"{v:.2f}"))

    return checks


def main() -> int:
    parser = argparse.ArgumentParser(description="回测质量指标报告")
    parser.add_argument("--input", default="", help="回测结果 ZIP 路径（默认用最新）")
    parser.add_argument("--output-dir", default="user_data/backtest_results", help="报告输出目录")
    args = parser.parse_args()

    # 找最新回测结果
    if args.input:
        zip_path = Path(args.input)
        if not zip_path.is_absolute():
            zip_path = ROOT / zip_path
    else:
        backtest_dir = ROOT / "user_data" / "backtest_results"
        zips = sorted(backtest_dir.glob("backtest-result-*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
        zip_path = zips[0] if zips else None

    if not zip_path or not zip_path.exists():
        # 尝试 .last_result.json
        last_json = ROOT / "user_data" / "backtest_results" / ".last_result.json"
        if last_json.exists():
            data = json.loads(last_json.read_text(encoding="utf-8"))
            result = data
        else:
            print("[错误] 未找到回测结果文件")
            return 1
    else:
        result = parse_backtest_zip(zip_path)

    if "error" in result:
        print(f"[错误] {result['error']}")
        return 1

    # ---- 输出 ----
    now = datetime.now()
    lines = [
        "=" * 60,
        " xuni 量化系统 · 回测质量报告",
        "=" * 60,
        f" 时间          : {now.strftime('%Y-%m-%d %H:%M:%S')}",
        f" 数据来源      : {zip_path.name if zip_path else 'last_result.json'}",
        "",
        "━━━ 核心指标 ━━━",
    ]

    core_metrics = [
        ("总收益率", result.get("profit_pct", "?"), "%"),
        ("年化CAGR", result.get("cagr", "?"), "%"),
        ("夏普比率", result.get("sharpe_ratio", "?"), ""),
        ("索提诺比率", result.get("sortino_ratio", "?"), ""),
        ("最大回撤", result.get("max_drawdown_pct", "?"), "%"),
        ("总交易笔数", result.get("total_trades", result.get("trades_csv", "?")), ""),
        ("胜率", result.get("win_rate_pct", result.get("win_rate_csv", "?")), "%"),
        ("盈利因子", result.get("profit_factor", "?"), ""),
        ("盈亏比", result.get("avg_win_loss_ratio", "?"), ""),
        ("平均盈利", result.get("avg_win", "?"), " USDT"),
        ("平均亏损", result.get("avg_loss", "?"), " USDT"),
    ]

    for label, value, unit in core_metrics:
        if isinstance(value, float):
            lines.append(f"  {label:<12} : {value:>10.2f}{unit}")
        else:
            lines.append(f"  {label:<12} : {str(value):>10}{unit}")

    # 逐交易对
    pairs = result.get("pairs", {})
    if pairs:
        lines.append("")
        lines.append("━━━ 逐交易对 ━━━")
        for pair in sorted(pairs.keys()):
            stats = pairs[pair]
            trades = stats.get("trades", "?")
            wr = stats.get("win_rate", 0)
            ps = stats.get("profit_sum", stats.get("profit_abs", 0.0))
            lines.append(f"  {pair:<14} {trades:>3}笔  胜率 {wr:>5.1f}%  盈亏 {ps:>+8.2f} USDT")

    # 质量检查
    lines.append("")
    lines.append("━━━ 质量阈值检查 ━━━")
    checks = quality_check(result)
    all_pass = True
    for label, ok, detail in checks:
        status = "[PASS]" if ok else "[FAIL]"
        if not ok:
            all_pass = False
        lines.append(f"  {status} {label}: {detail}")
    lines.append("")
    if all_pass:
        lines.append("  结论: 所有质量指标通过 ✓")
    else:
        lines.append("  结论: ⚠ 部分指标未达标，建议继续优化策略")

    lines.append("")
    lines.append("=" * 60)

    report = "\n".join(lines)
    print(report)

    # 保存报告
    out_dir = ROOT / args.output_dir
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"quality_report_{now.strftime('%Y%m%d_%H%M%S')}.md"
    out_path.write_text(report, encoding="utf-8")
    print(f"\n[OK] 报告已保存: {out_path}")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
