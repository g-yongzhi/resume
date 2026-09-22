# -*- coding: utf-8 -*-
"""
Phase 5：短线参数寻优封装。

用法（需网络可访问 Binance / 代理开启）:
    python scripts/phase5_hyperopt.py
    python scripts/phase5_hyperopt.py --epochs 80 --days 90
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "user_data" / "config" / "config.json"


def run(cmd: list[str]) -> int:
    print("+", " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))


def main() -> int:
    parser = argparse.ArgumentParser(description="Phase5 hyperopt for 15m short strategy")
    parser.add_argument("--epochs", type=int, default=60)
    parser.add_argument("--days", type=int, default=90)
    parser.add_argument("--timerange", default="20260526-")
    parser.add_argument("--jobs", type=int, default=2)
    args = parser.parse_args()

    if not CONFIG.exists():
        print("[ERROR] missing config.json")
        return 1

    # 1) 确保有 15m / 1h 数据
    rc = run(
        [
            sys.executable,
            str(ROOT / "scripts" / "download_data.py"),
            "--days",
            str(args.days),
            "--timeframes",
            "15m",
            "1h",
        ]
    )
    if rc != 0:
        print("[ERROR] 数据下载失败。请先开启代理（127.0.0.1:7897）后重试。")
        return rc

    # 2) Hyperopt
    rc = run(
        [
            "freqtrade",
            "hyperopt",
            "-c",
            str(CONFIG),
            "--strategy",
            "AdaptiveMultiCoinStrategy",
            "-i",
            "15m",
            "--timerange",
            args.timerange,
            "--hyperopt-loss",
            "SharpeHyperOptLossDaily",
            "--spaces",
            "buy",
            "sell",
            "stoploss",
            "roi",
            "--epochs",
            str(args.epochs),
            "-j",
            str(args.jobs),
            "--random-state",
            "42",
            "--enable-protections",
            "--min-trades",
            "10",
        ]
    )
    if rc != 0:
        return rc

    print("\n完成。查看最优结果:")
    print("  freqtrade hyperopt-list -c user_data/config/config.json")
    print("  freqtrade hyperopt-show -c user_data/config/config.json -n -1 --print-json")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
