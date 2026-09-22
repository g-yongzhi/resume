# -*- coding: utf-8 -*-
"""风控管理器（RiskManager）单元测试。"""

from __future__ import annotations

import sys
from datetime import datetime, timezone
from pathlib import Path

import pytest

# 确保 src 可导入
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from src.risk.manager import RiskManager


# ---------------------------------------------------------------------------
# fixtures
# ---------------------------------------------------------------------------


@pytest.fixture
def now() -> datetime:
    return datetime(2024, 6, 15, 14, 30, tzinfo=timezone.utc)


@pytest.fixture
def rm() -> RiskManager:
    return RiskManager(
        max_portfolio_risk=0.02,
        max_daily_loss=0.12,
        max_open_trades=3,
        atr_soft=0.008,
        atr_hard=0.035,
        min_stake_ratio=0.35,
    )


# ---------------------------------------------------------------------------
# 日盈亏 & 熔断
# ---------------------------------------------------------------------------


class TestDailyPnL:
    def test_circuit_broken_not_triggered_initially(self, rm: RiskManager) -> None:
        """初始状态不触发熔断。"""
        assert not rm.is_circuit_broken()

    def test_circuit_broken_triggered(self, rm: RiskManager, now: datetime) -> None:
        """日亏损达阈值触发熔断。"""
        rm.update_daily_pnl(now, -0.15)  # -15% > -12% limit
        assert rm.is_circuit_broken()

    def test_circuit_broken_not_on_small_loss(self, rm: RiskManager, now: datetime) -> None:
        """小亏损（-5%）不触发熔断。"""
        rm.update_daily_pnl(now, -0.05)
        assert not rm.is_circuit_broken()

    def test_new_day_resets(self, rm: RiskManager, now: datetime) -> None:
        """新一天重置日盈亏。"""
        rm.update_daily_pnl(now, -0.15)
        assert rm.is_circuit_broken()

        next_day = now.replace(day=16)
        rm.update_daily_pnl(next_day, 0.0)
        assert not rm.is_circuit_broken()

    def test_same_day_overwrites(self, rm: RiskManager, now: datetime) -> None:
        """同一天更新覆盖。"""
        rm.update_daily_pnl(now, -0.15)
        rm.update_daily_pnl(now, -0.01)
        assert not rm.is_circuit_broken()


# ---------------------------------------------------------------------------
# allow_entry — 入场守卫
# ---------------------------------------------------------------------------


class TestAllowEntry:
    def test_ok_all_conditions(self, rm: RiskManager, now: datetime) -> None:
        """所有条件正常时允许入场。"""
        assert rm.allow_entry("BTC/USDT", now, proposed_stake=100.0, open_trades=1)

    def test_block_circuit_broken(self, rm: RiskManager, now: datetime) -> None:
        """熔断触发 → 禁止入场。"""
        rm.update_daily_pnl(now, -0.15)
        assert not rm.allow_entry("BTC/USDT", now, proposed_stake=100.0, open_trades=1)

    def test_block_max_open_trades(self, rm: RiskManager, now: datetime) -> None:
        """持仓数达上限 → 禁止入场。"""
        assert not rm.allow_entry("BTC/USDT", now, proposed_stake=100.0, open_trades=3)
        assert not rm.allow_entry("BTC/USDT", now, proposed_stake=100.0, open_trades=5)

    def test_block_negative_stake(self, rm: RiskManager, now: datetime) -> None:
        """负本金 → 禁止入场。"""
        assert not rm.allow_entry("BTC/USDT", now, proposed_stake=0.0, open_trades=0)
        assert not rm.allow_entry("BTC/USDT", now, proposed_stake=-50.0, open_trades=0)


# ---------------------------------------------------------------------------
# record_trade_result — 连续亏损追踪
# ---------------------------------------------------------------------------


class TestConsecutiveLosses:
    def test_counts_losses(self, rm: RiskManager) -> None:
        """亏损单增加计数。"""
        assert rm._consecutive_losses == 0
        rm.record_trade_result(-0.01)
        assert rm._consecutive_losses == 1
        rm.record_trade_result(-0.02)
        assert rm._consecutive_losses == 2

    def test_resets_on_win(self, rm: RiskManager) -> None:
        """盈利后重置连续亏损计数。"""
        rm.record_trade_result(-0.01)
        rm.record_trade_result(-0.02)
        rm.record_trade_result(0.01)  # win
        assert rm._consecutive_losses == 0

    def test_triggers_circuit_breaker(self, rm: RiskManager) -> None:
        """连续亏损达到上限触发熔断。"""
        for _ in range(rm.max_consecutive_losses):
            rm.record_trade_result(-0.01)
        assert rm.is_circuit_broken()

    def test_not_triggered_below_threshold(self, rm: RiskManager) -> None:
        """连续亏损未达上限不触发。"""
        for _ in range(rm.max_consecutive_losses - 1):
            rm.record_trade_result(-0.01)
        assert not rm.is_circuit_broken()

    def test_new_day_resets_consecutive(self, rm: RiskManager, now: datetime) -> None:
        """新一天重置连续亏损计数。"""
        for _ in range(rm.max_consecutive_losses):
            rm.record_trade_result(-0.01)
        assert rm.is_circuit_broken()

        next_day = now.replace(day=16)
        rm.update_daily_pnl(next_day, 0.0)
        assert not rm.is_circuit_broken()
        assert rm._consecutive_losses == 0


# ---------------------------------------------------------------------------
# scale_stake — 仓位缩放
# ---------------------------------------------------------------------------


class TestScaleStake:
    def test_full_stake_low_volatility(self, rm: RiskManager) -> None:
        """低波动（≤ atr_soft）满仓不缩。"""
        result = rm.scale_stake(100.0, volatility=0.005)
        assert result == pytest.approx(100.0, abs=0.01)

    def test_min_stake_high_volatility(self, rm: RiskManager) -> None:
        """高波动（≥ atr_hard）缩到最小比例。"""
        result = rm.scale_stake(100.0, volatility=0.05)
        assert result == pytest.approx(35.0, abs=0.01)

    def test_linear_interpolation(self, rm: RiskManager) -> None:
        """中间波动线性插值。atr=0.02 时比例约 0.72。"""
        # soft=0.008, hard=0.035, range=0.027
        # t = (0.02 - 0.008) / 0.027 = 0.444
        # ratio = 1.0 - 0.444 * 0.65 = 0.711
        result = rm.scale_stake(100.0, volatility=0.02)
        assert result == pytest.approx(71.1, abs=1.0)

    def test_zero_stake_returns_zero(self, rm: RiskManager) -> None:
        assert rm.scale_stake(0.0, volatility=0.01) == 0.0

    def test_none_volatility_passthrough(self, rm: RiskManager) -> None:
        """未提供波动率时原样返回。"""
        assert rm.scale_stake(100.0) == 100.0
