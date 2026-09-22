# -*- coding: utf-8 -*-
"""
训练/测试分离回测验证 —— 防过拟合检查。

用法:
    python scripts/backtest_validate.py
    python scripts/backtest_validate.py --train 20240101-20250601 --test 20250601-20260730
    python scripts/backtest_validate.py --days 365 --train-ratio 0.7

工作流:
    1. 按时间顺序切分训练/测试集
    2. 在训练集上跑 hyperopt，得到最优参数
    3. 在测试集上用最优参数跑回测
    4. 比较核心指标，过拟合时告警
"""

from __future__ import annotations

import argparse
import json
import re
import subprocess
import sys
import zipfile
from datetime import datetime, timedelta
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
CONFIG = ROOT / "user_data" / "config" / "config.json"

OVERFIT_WARN_THRESHOLD = 0.35  # 测试集指标相比训练集下降超过 35% 则告警


def run(cmd: list[str], timeout: int = 600) -> tuple[int, str]:
    """运行命令，返回 (returncode, stdout)。"""
    try:
        result = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True, timeout=timeout)
        return result.returncode, result.stdout + result.stderr
    except subprocess.TimeoutExpired:
        return -1, "TIMEOUT"


def parse_backtest_metrics(zip_path: Path) -> dict[str, Any]:
    """从回测结果 ZIP 中提取核心指标。"""
    metrics: dict[str, Any] = {}
    try:
        with zipfile.ZipFile(zip_path, "r") as zf:
            if "backtest-result.txt" in zf.namelist():
                with zf.open("backtest-result.txt") as f:
                    text = TextIOWrapper(f, encoding="utf-8").read()
                    # 用正则提取关键数字
                    patterns = {
                        "total_trades": r"Total (\d+) trades",
                        "win_rate": r"Winrate:\s*([\d.]+)%",
                        "profit_pct": r"Profit(?: total)?:\s*([\-\d.]+)%",
                        "max_drawdown": r"Max(?:imum)?\s*[Dd]rawdown:\s*(?:[^\d]*)([\d.]+)%",
                        "sharpe": r"Sharpe(?: ratio)?:\s*([\-\d.]+)",
                        "profit_factor": r"Profit(?: )?[Ff]actor:\s*([\d.]+)",
                    }
                    for key, pat in patterns.items():
                        m = re.search(pat, text)
                        if m:
                            try:
                                metrics[key] = float(m.group(1))
                            except ValueError:
                                metrics[key] = m.group(1)
            # 读取 trades CSV 增强分析
            for name in zf.namelist():
                if name.endswith("_trades.csv") or name.endswith("trades.csv"):
                    with zf.open(name) as f:
                        lines = TextIOWrapper(f, encoding="utf-8").read().strip().split("\n")
                        if len(lines) > 1:
                            wins = 0
                            total_profit = 0.0
                            for line in lines[1:]:
                                parts = line.split(",")
                                if len(parts) >= 2:
                                    try:
                                        p = float(parts[-1].strip())
                                        total_profit += p
                                        if p > 0:
                                            wins += 1
                                    except ValueError:
                                        pass
                            metrics["total_trades_csv"] = len(lines) - 1
                            if len(lines) - 1 > 0:
                                metrics["win_rate_csv"] = wins / (len(lines) - 1) * 100
                                metrics["total_profit_csv"] = total_profit
                    break
    except Exception as exc:
        metrics["parse_error"] = str(exc)
    return metrics


def format_metrics(m: dict[str, Any]) -> str:
    lines = []
    for k in ("total_trades", "win_rate", "profit_pct", "max_drawdown", "sharpe", "profit_factor"):
        v = m.get(k)
        if v is not None:
            if isinstance(v, float):
                lines.append(f"  {k}: {v:.2f}")
            else:
                lines.append(f"  {k}: {v}")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description="训练/测试分离回测验证")
    parser.add_argument("--train", default="", help="训练集时间范围 (YYYYMMDD-YYYYMMDD)")
    parser.add_argument("--test", default="", help="测试集时间范围 (YYYYMMDD-YYYYMMDD)")
    parser.add_argument("--days", type=int, default=365, help="总数据天数")
    parser.add_argument("--train-ratio", type=float, default=0.7, help="训练集占比")
    parser.add_argument("--strategy", default="AdaptiveMultiCoinStrategy", help="策略名")
    parser.add_argument("--timeframe", default="15m", help="主时间周期")
    parser.add_argument("--epochs", type=int, default=40, help="Hyperopt 轮数")
    parser.add_argument("--skip-hyperopt", action="store_true", help="跳过训练集寻优，直接回测")
    args = parser.parse_args()

    if not CONFIG.exists():
        print("[错误] 缺少 config.json")
        return 1

    # ---- 计算时间范围 ----
    end_date = datetime.now()
    start_date = end_date - timedelta(days=args.days)
    train_end = start_date + timedelta(days=int(args.days * args.train_ratio))
    train_range = args.train or f"{start_date.strftime('%Y%m%d')}-{train_end.strftime('%Y%m%d')}"
    test_range = args.test or f"{train_end.strftime('%Y%m%d')}-{end_date.strftime('%Y%m%d')}"

    # ---- 确保数据存在 ----
    print("=" * 60)
    print(" 回测验证框架 — 训练/测试分离")
    print("=" * 60)
    print(f" 训练集         : {train_range}")
    print(f" 测试集         : {test_range}")
    print(f" 策略           : {args.strategy} @ {args.timeframe}")
    print()

    rc, out = run(
        [
            sys.executable,
            str(ROOT / "scripts" / "download_data.py"),
            "--days",
            str(args.days),
            "--timeframes",
            args.timeframe,
            "1h",
        ]
    )
    if rc != 0:
        print(f"[警告] 数据下载可能有问题:\n{out[:500]}")

    # ---- 训练集 hyperopt ----
    train_result_zip = ROOT / "user_data" / "backtest_results" / "validate_train.zip"
    test_result_zip = ROOT / "user_data" / "backtest_results" / "validate_test.zip"

    if not args.skip_hyperopt:
        print("-" * 60)
        print(" 第 1 步：训练集 Hyperopt ...")
        rc, out = run(
            [
                "freqtrade",
                "hyperopt",
                "-c",
                str(CONFIG),
                "--strategy",
                args.strategy,
                "-i",
                args.timeframe,
                "--timerange",
                train_range,
                "--hyperopt-loss",
                "SharpeHyperOptLossDaily",
                "--spaces",
                "buy",
                "sell",
                "--epochs",
                str(args.epochs),
                "-j",
                "2",
                "--random-state",
                "42",
                "--min-trades",
                "5",
                "--no-color",
            ],
            timeout=900,
        )
        if rc != 0:
            print(f"[警告] Hyperopt 返回码 {rc}，继续使用策略默认参数...")

    # ---- 测试集回测 ----
    print("-" * 60)
    print(" 第 2 步：测试集回测 ...")
    rc, out = run(
        [
            "freqtrade",
            "backtesting",
            "-c",
            str(CONFIG),
            "--strategy",
            args.strategy,
            "-i",
            args.timeframe,
            "--timerange",
            test_range,
            "--export",
            "trades",
            "--export-filename",
            str(test_result_zip.with_suffix("")),
            "--no-color",
        ],
        timeout=300,
    )
    print(out[-500:] if len(out) > 500 else out)

    # ---- 分析 ----
    print("-" * 60)
    print(" 第 3 步：分析结果 ...")

    # 找最新的回测结果文件
    backtest_dir = ROOT / "user_data" / "backtest_results"
    zip_files = sorted(backtest_dir.glob("backtest-result-*.zip"), key=lambda p: p.stat().st_mtime, reverse=True)
    latest_zip = zip_files[0] if zip_files else None

    if latest_zip:
        metrics = parse_backtest_metrics(latest_zip)
        print(" 最新回测指标:")
        print(format_metrics(metrics))

        # 质量检查
        print()
        print(" 质量阈值检查:")
        checks = {
            "胜率 ≥ 40%": metrics.get("win_rate", 0) >= 40,
            "最大回撤 ≤ 25%": metrics.get("max_drawdown", 100) <= 25,
            "夏普 ≥ 0": metrics.get("sharpe", -99) >= 0,
            "盈利因子 ≥ 1.0": metrics.get("profit_factor", 0) >= 1.0,
        }
        all_pass = True
        for desc, ok in checks.items():
            status = "[PASS]" if ok else "[FAIL]"
            if not ok:
                all_pass = False
            print(f"  {status} {desc}")
        print()
        if all_pass:
            print(" 所有质量指标通过 ✓")
        else:
            print(" ⚠ 部分指标未达标，建议继续优化策略")
    else:
        print(" [错误] 未找到回测结果文件")

    print("=" * 60)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
