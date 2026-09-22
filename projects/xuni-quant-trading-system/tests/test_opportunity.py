# -*- coding: utf-8 -*-
"""机会评分器（OpportunityScorer）单元测试。"""

from __future__ import annotations

import sys
from pathlib import Path

import numpy as np
import pandas as pd
import pytest

# 确保 src 可导入
_ROOT = Path(__file__).resolve().parents[1]
if str(_ROOT) not in sys.path:
    sys.path.insert(0, str(_ROOT))

from src.scoring.opportunity import OpportunityScorer


# ---------------------------------------------------------------------------
# 评分器实例
# ---------------------------------------------------------------------------


@pytest.fixture
def scorer() -> OpportunityScorer:
    return OpportunityScorer(min_score=0.45)


# ---------------------------------------------------------------------------
# _trend_factor — 核心修复验证
# ---------------------------------------------------------------------------


class TestTrendFactor:
    """验证 _trend_factor 对牛市/熊市/震荡有明显区分度。"""

    def test_bull_gt_bear(self, scorer: OpportunityScorer, bull_df: pd.DataFrame, bear_df: pd.DataFrame) -> None:
        """牛市 trend_factor 均值应显著高于熊市。"""
        bull_trend = scorer._trend_factor(bull_df)
        bear_trend = scorer._trend_factor(bear_df)
        assert bull_trend.mean() > bear_trend.mean() + 0.15, (
            f"牛市趋势因子均值 {bull_trend.mean():.3f} 未显著高于熊市 {bear_trend.mean():.3f}"
        )

    def test_bull_high_discrimination(self, scorer: OpportunityScorer, bull_df: pd.DataFrame) -> None:
        """牛市趋势因子至少有部分 > 0.70（旧版永远 < 0.60）。"""
        bull_trend = scorer._trend_factor(bull_df)
        high_ratio = (bull_trend > 0.70).mean()
        assert high_ratio > 0.05, f"牛市高分区占比仅 {high_ratio:.2%}，区分度不足"

    def test_bear_low_discrimination(self, scorer: OpportunityScorer, bear_df: pd.DataFrame) -> None:
        """熊市趋势因子至少有部分 < 0.30。"""
        bear_trend = scorer._trend_factor(bear_df)
        low_ratio = (bear_trend < 0.30).mean()
        assert low_ratio > 0.05, f"熊市低分区占比仅 {low_ratio:.2%}，区分度不足"

    def test_flat_near_mid(self, scorer: OpportunityScorer, flat_df: pd.DataFrame) -> None:
        """震荡市趋势因子均值在 0.4~0.6 之间。"""
        flat_trend = scorer._trend_factor(flat_df)
        m = flat_trend.mean()
        assert 0.35 < m < 0.65, f"震荡市趋势因子均值 {m:.3f} 偏离中性区间"

    def test_falls_back_without_columns(self, scorer: OpportunityScorer) -> None:
        """缺少 EMA 列时返回 0.5。"""
        df = pd.DataFrame({"close": [100, 101, 102]})
        result = scorer._trend_factor(df)
        assert (result == 0.5).all()

    def test_output_range(self, scorer: OpportunityScorer, bull_df: pd.DataFrame) -> None:
        """输出在 [0, 1] 范围内。"""
        trend = scorer._trend_factor(bull_df)
        assert trend.min() >= 0.0
        assert trend.max() <= 1.0


# ---------------------------------------------------------------------------
# _rsi_factor
# ---------------------------------------------------------------------------


class TestRSIFactor:
    def test_sweet_zone_best(self, scorer: OpportunityScorer) -> None:
        """RSI 在甜区中间时得分最高。"""
        df = pd.DataFrame({"rsi": [52.5]})  # (40+65)/2
        score = scorer._rsi_factor(df)
        assert score.iloc[0] > 0.90

    def test_overbought_low(self, scorer: OpportunityScorer) -> None:
        """RSI 过热扣分。"""
        df = pd.DataFrame({"rsi": [85.0]})
        score = scorer._rsi_factor(df)
        assert score.iloc[0] < 0.50

    def test_oversold_low(self, scorer: OpportunityScorer) -> None:
        """RSI 过冷扣分。"""
        df = pd.DataFrame({"rsi": [20.0]})
        score = scorer._rsi_factor(df)
        assert score.iloc[0] < 0.50


# ---------------------------------------------------------------------------
# _volatility_factor
# ---------------------------------------------------------------------------


class TestVolatilityFactor:
    def test_atr_soft_good(self, scorer: OpportunityScorer) -> None:
        """ATR% <= soft 阈值得分 0.85。"""
        df = pd.DataFrame({"atr_pct": [0.005]})
        score = scorer._volatility_factor(df)
        assert score.iloc[0] == pytest.approx(0.85, abs=0.01)

    def test_atr_hard_bad(self, scorer: OpportunityScorer) -> None:
        """ATR% >= hard 阈值得分 0.15。"""
        df = pd.DataFrame({"atr_pct": [0.05]})
        score = scorer._volatility_factor(df)
        assert score.iloc[0] == pytest.approx(0.15, abs=0.01)


# ---------------------------------------------------------------------------
# _htf_factor
# ---------------------------------------------------------------------------


class TestHTFFactor:
    def test_bull_is_one(self, scorer: OpportunityScorer, bull_df: pd.DataFrame) -> None:
        """htf_bull=1 → factor=1。"""
        score = scorer._htf_factor(bull_df)
        assert (score == 1.0).all()

    def test_bear_is_zero(self, scorer: OpportunityScorer, bear_df: pd.DataFrame) -> None:
        """htf_bull=0 → factor=0。"""
        score = scorer._htf_factor(bear_df)
        assert (score == 0.0).all()

    def test_no_htf_defaults(self, scorer: OpportunityScorer) -> None:
        """无 htf 列 → 0.5。"""
        df = pd.DataFrame({"close": [100]})
        score = scorer._htf_factor(df)
        assert score.iloc[0] == 0.5


# ---------------------------------------------------------------------------
# _momentum_factor
# ---------------------------------------------------------------------------


class TestMomentumFactor:
    def test_gentle_up_best(self, scorer: OpportunityScorer) -> None:
        """温和上涨 (±1%) 得分高。"""
        df = pd.DataFrame({"pct_change_1": [0.01]})
        score = scorer._momentum_factor(df)
        assert score.iloc[0] > 0.60

    def test_crash_low(self, scorer: OpportunityScorer) -> None:
        """暴跌 (>3%) 得分 0.25。"""
        df = pd.DataFrame({"pct_change_1": [-0.05]})
        score = scorer._momentum_factor(df)
        assert score.iloc[0] == pytest.approx(0.25, abs=0.01)


# ---------------------------------------------------------------------------
# _volume_factor — 新增
# ---------------------------------------------------------------------------


class TestVolumeFactor:
    def test_sweet_zone_high(self, scorer: OpportunityScorer) -> None:
        """rel_volume 在 1.0 附近高分。"""
        df = pd.DataFrame({"rel_volume": [1.2]})
        score = scorer._volume_factor(df)
        assert score.iloc[0] == pytest.approx(1.0, abs=0.01)

    def test_too_low_bad(self, scorer: OpportunityScorer) -> None:
        """缩量严重低分。"""
        df = pd.DataFrame({"rel_volume": [0.3]})
        score = scorer._volume_factor(df)
        assert score.iloc[0] <= 0.35

    def test_no_col_defaults(self, scorer: OpportunityScorer) -> None:
        """无 rel_volume 列 → 0.5。"""
        df = pd.DataFrame({"close": [100]})
        score = scorer._volume_factor(df)
        assert score.iloc[0] == 0.5


# ---------------------------------------------------------------------------
# score_frame / score_latest / explain
# ---------------------------------------------------------------------------


class TestScoreFrame:
    def test_output_is_series(self, scorer: OpportunityScorer, bull_df: pd.DataFrame) -> None:
        result = scorer.score_frame(bull_df, "BTC/USDT")
        assert isinstance(result, pd.Series)
        assert len(result) == len(bull_df)

    def test_values_in_range(self, scorer: OpportunityScorer, bull_df: pd.DataFrame) -> None:
        result = scorer.score_frame(bull_df, "BTC/USDT")
        assert result.min() >= 0.0
        assert result.max() <= 1.0

    def test_all_factors_contribute(self, scorer: OpportunityScorer, bull_df: pd.DataFrame, bear_df: pd.DataFrame) -> None:
        """牛市 vs 熊市的总分应有显著差异（≥0.20），证明所有因子在起作用。"""
        bull_score = scorer.score_frame(bull_df, "BTC/USDT")
        bear_score = scorer.score_frame(bear_df, "BTC/USDT")
        assert bull_score.mean() > bear_score.mean() + 0.20, (
            f"牛市均分 {bull_score.mean():.3f} vs 熊市 {bear_score.mean():.3f}，差异不足"
        )

    def test_score_latest_smoke(self, scorer: OpportunityScorer, bull_df: pd.DataFrame) -> None:
        s = scorer.score_latest(bull_df, "BTC/USDT")
        assert isinstance(s, float)
        assert 0.0 <= s <= 1.0

    def test_score_latest_empty(self, scorer: OpportunityScorer) -> None:
        s = scorer.score_latest(None, "BTC/USDT")
        assert s == 0.0

    def test_explain_keys(self, scorer: OpportunityScorer, bull_df: pd.DataFrame) -> None:
        exp = scorer.explain(bull_df, "BTC/USDT")
        assert "pair" in exp
        assert "score" in exp
        assert "factors" in exp
        for k in ("trend", "rsi", "volatility", "htf", "volume", "momentum"):
            assert k in exp["factors"], f"缺失因子: {k}"
