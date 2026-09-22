# -*- coding: utf-8 -*-
"""
将最近一次 Hyperopt 最优结果应用到策略参数文件。

用法:
    python scripts/apply_hyperopt_best.py
"""

from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CONFIG = ROOT / "user_data" / "config" / "config.json"
OUT = ROOT / "user_data" / "strategies" / "AdaptiveMultiCoinStrategy.json"


def main() -> int:
    cmd = [
        "freqtrade",
        "hyperopt-show",
        "-c",
        str(CONFIG),
        "-n",
        "-1",
        "--print-json",
        "--no-header",
    ]
    print("+", " ".join(cmd))
    proc = subprocess.run(cmd, cwd=str(ROOT), capture_output=True, text=True)
    if proc.returncode != 0:
        print(proc.stdout)
        print(proc.stderr)
        print("[ERROR] 没有可用的 hyperopt 结果。请先运行: python scripts/phase5_hyperopt.py")
        return proc.returncode

    raw = proc.stdout.strip()
    # hyperopt-show 可能混有日志，尽量截取 JSON 对象
    start = raw.find("{")
    end = raw.rfind("}")
    if start < 0 or end < 0:
        print(raw)
        print("[ERROR] 未能解析 JSON")
        return 1

    payload = json.loads(raw[start : end + 1])
    # 标准参数文件结构
    params = {
        "strategy_name": "AdaptiveMultiCoinStrategy",
        "params": payload.get("params", payload),
    }
    OUT.write_text(json.dumps(params, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"[OK] 已写入 {OUT}")
    print("重启 Dry-run 后生效。")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
