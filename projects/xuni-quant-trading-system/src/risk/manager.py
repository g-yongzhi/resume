# -*- coding: utf-8 -*-
"""
组合风控管理器。

Phase 2 已启用:
    - 最大持仓数限制
    - 基于 ATR 波动率的仓位缩放
    - 日亏损熔断钩子（由策略传入当日已实现盈亏比例）
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Any, Optional


@dataclass
class RiskManager:
    """账户级 / 交易级风控。"""

    max_portfolio_risk: float = 0.02
    max_daily_loss: float = 0.03
    max_open_trades: int = 3
    # ATR% 高于该阈值时开始减仓；高于 hard 上限时压到最低仓位比例
    atr_soft: float = 0.015
    atr_hard: float = 0.04
    min_stake_ratio: float = 0.35
    # 连续亏损熔断
    max_consecutive_losses: int = 5
    _daily_pnl_ratio: float = field(default=0.0, repr=False)
    _daily_date: Optional[date] = field(default=None, repr=False)
    _consecutive_losses: int = field(default=0, repr=False)
    _total_trades_today: int = field(default=0, repr=False)

    def update_daily_pnl(self, current_time: datetime, daily_pnl_ratio: float) -> None:
        """更新当日盈亏占比（相对起始资金，负数为亏损）。新一天重置计数器。"""
        d = current_time.date()
        if self._daily_date != d:
            self._daily_date = d
            self._daily_pnl_ratio = daily_pnl_ratio
            self._consecutive_losses = 0
            self._total_trades_today = 0
        else:
            self._daily_pnl_ratio = daily_pnl_ratio

    def is_circuit_broken(self, equity_curve: Any = None) -> bool:
        """日亏损熔断：当日亏损达到阈值或连续亏损超限则禁止新开仓。"""
        if self._daily_pnl_ratio <= -abs(self.max_daily_loss):
            return True
        if self._consecutive_losses >= self.max_consecutive_losses:
            return True
        return False

    def record_trade_result(self, profit_pct: float) -> None:
        """记录每笔交易结果，追踪连续亏损。"""
        self._total_trades_today += 1
        if profit_pct <= 0:
            self._consecutive_losses += 1
        else:
            self._consecutive_losses = 0

    def allow_entry(
        self,
        pair: str,
        current_time: datetime,
        proposed_stake: float,
        open_trades: int,
        **kwargs: Any,
    ) -> bool:
        if self.is_circuit_broken():
            return False
        if open_trades >= self.max_open_trades:
            return False
        if proposed_stake <= 0:
            return False
        return True

    def scale_stake(
        self,
        proposed_stake: float,
        volatility: Optional[float] = None,
        **kwargs: Any,
    ) -> float:
        """
        按 ATR/价格 波动率缩放仓位。
        volatility: ATR / close，例如 0.02 = 2%。
        """
        if proposed_stake <= 0:
            return proposed_stake
        if volatility is None or volatility <= 0:
            return proposed_stake

        if volatility <= self.atr_soft:
            ratio = 1.0
        elif volatility >= self.atr_hard:
            ratio = self.min_stake_ratio
        else:
            # 线性从 soft→hard 映射到 1.0→min_stake_ratio
            t = (volatility - self.atr_soft) / (self.atr_hard - self.atr_soft)
            ratio = 1.0 - t * (1.0 - self.min_stake_ratio)

        return max(proposed_stake * ratio, 0.0)
