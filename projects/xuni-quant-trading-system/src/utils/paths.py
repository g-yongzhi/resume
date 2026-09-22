# -*- coding: utf-8 -*-
"""项目路径约定。"""

from __future__ import annotations

from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[2]


def ensure_runtime_dirs() -> None:
    """确保运行期目录存在。"""
    for rel in (
        "user_data/data",
        "user_data/logs",
        "user_data/backtest_results",
        "user_data/plot",
        "logs",
    ):
        (PROJECT_ROOT / rel).mkdir(parents=True, exist_ok=True)
