# -*- coding: utf-8 -*-
"""
新闻 / 事件过滤占位。

当前阶段明确不做新闻模块；仅保留接口，避免后期大改策略结构。
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Any


@dataclass
class NewsFilter:
    """事件风险过滤器（当前恒允许交易）。"""

    enabled: bool = False

    def allow_entry(self, pair: str, current_time: datetime, **kwargs: Any) -> bool:
        if not self.enabled:
            return True
        # TODO(phase-news): 接入日历/情绪/突发新闻源
        return True

    def allow_exit(self, pair: str, current_time: datetime, **kwargs: Any) -> bool:
        return True
