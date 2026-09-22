# -*- coding: utf-8 -*-
"""
下载 Binance 历史 K 线（现货 BTC/ETH，短线默认 15m + 1h）。

用法（已激活 .venv）:
    python scripts/download_data.py
    python scripts/download_data.py --days 120
"""

from __future__ import annotations

import argparse
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "user_data" / "config" / "config.json"


def main() -> int:
    parser = argparse.ArgumentParser(description="Download OHLCV for short-term pairs")
    parser.add_argument("--days", type=int, default=120, help="历史天数，默认 120")
    parser.add_argument(
        "--timeframes",
        nargs="+",
        default=["15m", "1h"],
        help="时间周期，默认 15m 1h",
    )
    args = parser.parse_args()

    if not CONFIG.exists():
        print(f"[ERROR] 缺少本地配置: {CONFIG}")
        print("请先运行: py -3.12 scripts/setup_env.py")
        return 1

    cmd = [
        "freqtrade",
        "download-data",
        "-c",
        str(CONFIG),
        "--exchange",
        "binance",
        "-t",
        *args.timeframes,
        "--days",
        str(args.days),
        "--trading-mode",
        "spot",
    ]
    print("+", " ".join(cmd))
    return subprocess.call(cmd, cwd=str(ROOT))


if __name__ == "__main__":
    raise SystemExit(main())
