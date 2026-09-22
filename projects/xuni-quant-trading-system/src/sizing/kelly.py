# -*- coding: utf-8 -*-
"""
凯利仓位管理 + 动态调整。

- 基础仓位：凯利公式 f = (bp - q) / b
- 连续盈亏调整
- BTC 危险信号降仓
- 时段调整
"""

from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime, timezone


@dataclass
class KellySizer:
    """动态仓位计算器。"""

    max_stake_pct: float = 0.20      # 单笔最大占总资金 20%
    base_win_rate: float = 0.45      # 基准胜率
    base_avg_win: float = 0.015      # 基准平均盈利%
    base_avg_loss: float = 0.010     # 基准平均亏损%
    consecutive_wins: int = field(default=0, repr=False)
    consecutive_losses: int = field(default=0, repr=False)
    btc_danger: bool = field(default=False, repr=False)

    def calculate(
        self,
        total_capital: float,
        signal_confidence: float,
        current_time: datetime | None = None,
    ) -> float:
        """返回建议仓位金额（非保证金）。"""
        # 凯利比例
        b = abs(self.base_avg_win / self.base_avg_loss) if self.base_avg_loss != 0 else 1.5
        p = self.base_win_rate
        kelly = max(0.0, (b * p - (1.0 - p)) / b)

        # 半凯利：保守
        half_kelly = kelly * 0.5

        # 信号置信度调整
        confidence_mult = 0.7 + signal_confidence * 0.6  # 0.7 ~ 1.3

        # 连续盈亏调整
        streak_mult = 1.0
        if self.consecutive_wins >= 3:
            streak_mult = 1.0 + min(self.consecutive_wins - 2, 5) * 0.05  # 最多 +25%
        if self.consecutive_losses >= 2:
            streak_mult = 1.0 - min(self.consecutive_losses - 1, 4) * 0.10  # 最多 -40%

        # BTC 危险
        danger_mult = 0.50 if self.btc_danger else 1.0

        # 时段调整
        session_mult = self._session_mult(current_time)

        # 综合
        final_pct = half_kelly * confidence_mult * streak_mult * danger_mult * session_mult
        final_pct = max(0.05, min(final_pct, self.max_stake_pct))  # 夹在 5%~20%

        return total_capital * final_pct

    def _session_mult(self, current_time: datetime | None) -> float:
        """时段仓位系数。亚洲盘正常，美国盘降仓。"""
        if current_time is None:
            return 1.0
        if current_time.tzinfo is None:
            current_time = current_time.replace(tzinfo=timezone.utc)
        hour = current_time.hour

        # 亚洲活跃 (UTC 0-8 = 北京时间 8-16): 正常
        if 0 <= hour < 8:
            return 1.0
        # 欧洲 (UTC 8-15): 略微降仓
        if 8 <= hour < 15:
            return 0.90
        # 美国 (UTC 15-21): 假突破多，降仓
        if 15 <= hour < 21:
            return 0.70
        # 深夜 (UTC 21-24): 流动性差
        return 0.50

    def record_result(self, profit_pct: float) -> None:
        if profit_pct > 0:
            self.consecutive_wins += 1
            self.consecutive_losses = 0
        else:
            self.consecutive_losses += 1
            self.consecutive_wins = 0
