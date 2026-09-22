# -*- coding: utf-8 -*-
"""
一键环境初始化（Windows PowerShell / 跨平台 Python）。

用法（在项目根目录）:
    py -3.12 scripts/setup_env.py
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VENV = ROOT / ".venv"
REQ = ROOT / "requirements.txt"
CFG_EXAMPLE = ROOT / "user_data" / "config" / "config.example.json"
CFG_LOCAL = ROOT / "user_data" / "config" / "config.json"
CFG_FUT_EXAMPLE = ROOT / "user_data" / "config" / "config_futures.example.json"
CFG_FUT_LOCAL = ROOT / "user_data" / "config" / "config_futures.json"


def run(cmd: list[str]) -> None:
    print("+", " ".join(cmd))
    subprocess.check_call(cmd, cwd=str(ROOT))


def main() -> int:
    if sys.version_info[:2] != (3, 12):
        print(
            f"[WARN] 当前解释器为 {sys.version.split()[0]}，推荐使用 Python 3.12。"
            " 请用: py -3.12 scripts/setup_env.py"
        )

    if not VENV.exists():
        run([sys.executable, "-m", "venv", str(VENV)])

    if os.name == "nt":
        pip = str(VENV / "Scripts" / "pip.exe")
        python = str(VENV / "Scripts" / "python.exe")
    else:
        pip = str(VENV / "bin" / "pip")
        python = str(VENV / "bin" / "python")

    run([python, "-m", "pip", "install", "--upgrade", "pip", "wheel", "setuptools"])
    run([pip, "install", "-r", str(REQ)])

    if not CFG_LOCAL.exists():
        shutil.copy2(CFG_EXAMPLE, CFG_LOCAL)
        print(f"[OK] 已生成本地配置: {CFG_LOCAL}")
    else:
        print(f"[SKIP] 本地配置已存在: {CFG_LOCAL}")

    if not CFG_FUT_LOCAL.exists():
        shutil.copy2(CFG_FUT_EXAMPLE, CFG_FUT_LOCAL)
        print(f"[OK] 已生成期货配置: {CFG_FUT_LOCAL}")
    else:
        print(f"[SKIP] 期货配置已存在: {CFG_FUT_LOCAL}")

    run([python, "-c", "import freqtrade; print('freqtrade', getattr(freqtrade, '__version__', 'ok'))"])
    print("\n环境就绪。激活虚拟环境:")
    if os.name == "nt":
        print(r"  .\.venv\Scripts\Activate.ps1")
    else:
        print("  source .venv/bin/activate")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
