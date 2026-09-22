# -*- coding: utf-8 -*-
"""
动态多层级出场管理。

抛弃固定 ROI 表。出场由三个组件组成：
  1. 移动止盈（盈利达 ATR 倍数后激活）
  2. 信号止损（入场理由失效即走）
  3. 时间止损（超时减仓/清仓）
"""

from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone
from typing import Any, Optional


@dataclass
class ExitDecision:
    should_exit: bool
    reason: str
    exit_type: str   # "take_profit" | "stop_loss" | "time_stop" | "btc_hedge"


@dataclass
class DynamicExitManager:
    """动态出场管理。"""

    atr_tp_mult: float = 1.5       # ATR 倍数 = 移动止盈距离
    time_warn_minutes: float = 180  # 3h 不达预期 → 减半
    time_kill_minutes: float = 360  # 6h → 全平
    btc_drop_threshold: float = 0.015  # BTC 跌 1.5% → 联动止盈

    def check(
        self,
        trade: Any,
        current_time: datetime,
        current_rate: float,
        current_profit: float,
        atr_pct: float = 0.01,
        entry_stop: float | None = None,
        btc_drop_pct: float = 0.0,
    ) -> ExitDecision:
        open_date = getattr(trade, "open_date_utc", None) or trade.open_date
        if open_date is None:
            return ExitDecision(False, "", "")

        if open_date.tzinfo is None:
            open_date = open_date.replace(tzinfo=timezone.utc)
        if current_time.tzinfo is None:
            current_time = current_time.replace(tzinfo=timezone.utc)

        held_min = (current_time - open_date).total_seconds() / 60.0

        # 1) 时间止损
        if held_min >= self.time_kill_minutes:
            return ExitDecision(True, f"time_kill_{held_min:.0f}min", "time_stop")
        if held_min >= self.time_warn_minutes and current_profit < 0.005:
            return ExitDecision(True, f"time_warn_{held_min:.0f}min", "time_stop")

        # 2) 信号止损
        if entry_stop is not None and current_rate < entry_stop:
            return ExitDecision(True, "signal_stop", "stop_loss")

        # 3) ATR 移动止盈
        tp_distance = self.atr_tp_mult * atr_pct
        if current_profit > tp_distance:
            # 盈利已超过止盈距离，启动追踪（具体追踪由 Freqtrade trailing_stop 实现）
            # 这里只做标记，实际的追踪交给策略的 trailing_stop
            pass

        # 4) BTC 联动
        if btc_drop_pct > self.btc_drop_threshold and current_profit > 0.005:
            return ExitDecision(True, f"btc_hedge_{btc_drop_pct:.3f}", "btc_hedge")

        return ExitDecision(False, "", "")
