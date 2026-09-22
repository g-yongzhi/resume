# -*- coding: utf-8 -*-
"""
健康检查：验证配置、策略导入、数据目录。

用法:
    python scripts/healthcheck.py
"""

from __future__ import annotations

import importlib.util
import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "user_data" / "config" / "config.json"
STRATEGY = ROOT / "user_data" / "strategies" / "AdaptiveMultiCoinStrategy.py"
DATA_DIR = ROOT / "user_data" / "data"


def ok(msg: str) -> None:
    print(f"[OK] {msg}")


def fail(msg: str) -> None:
    print(f"[FAIL] {msg}")


def main() -> int:
    errors = 0

    # 1) Python 版本
    if sys.version_info[:2] == (3, 12):
        ok(f"Python {sys.version.split()[0]}")
    else:
        print(f"[WARN] Python {sys.version.split()[0]}（推荐 3.12）")

    # 2) freqtrade
    try:
        import freqtrade

        ok(f"freqtrade importable ({getattr(freqtrade, '__version__', 'unknown')})")
    except Exception as exc:  # noqa: BLE001
        fail(f"无法 import freqtrade: {exc}")
        errors += 1

    # 3) 配置
    if not CONFIG.exists():
        fail(f"缺少配置文件: {CONFIG}")
        errors += 1
    else:
        try:
            cfg = json.loads(CONFIG.read_text(encoding="utf-8"))
            assert cfg.get("dry_run") is True
            assert cfg.get("exchange", {}).get("name") == "binance"
            pairs = cfg.get("exchange", {}).get("pair_whitelist", [])
            assert "BTC/USDT" in pairs
            ok(f"config.json 合法 | pairs={pairs} | dry_run={cfg.get('dry_run')}")
        except Exception as exc:  # noqa: BLE001
            fail(f"config.json 校验失败: {exc}")
            errors += 1

    # 4) 策略文件可加载
    if not STRATEGY.exists():
        fail(f"缺少策略: {STRATEGY}")
        errors += 1
    else:
        try:
            spec = importlib.util.spec_from_file_location("ams", STRATEGY)
            assert spec and spec.loader
            # 仅检查语法：用 compile
            compile(STRATEGY.read_text(encoding="utf-8"), str(STRATEGY), "exec")
            ok("AdaptiveMultiCoinStrategy.py 语法检查通过")
        except Exception as exc:  # noqa: BLE001
            fail(f"策略语法错误: {exc}")
            errors += 1

    # 5) 数据目录
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    data_files = list(DATA_DIR.rglob("*.feather")) + list(DATA_DIR.rglob("*.json"))
    if data_files:
        ok(f"发现历史数据文件 {len(data_files)} 个")
    else:
        print("[WARN] 尚未下载历史数据。运行: python scripts/download_data.py")

    if errors:
        print(f"\n健康检查失败: {errors} 项")
        return 1
    print("\n健康检查通过。系统底子可用。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
