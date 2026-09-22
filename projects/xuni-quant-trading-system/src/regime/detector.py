# -*- coding: utf-8 -*-
"""
市场状态识别器。

识别四种状态：
  - trending_up:    ADX > 25, EMA 多头排列, 斜率一致向上
  - trending_down:  ADX > 25, EMA 空头排列, 斜率一致向下
  - ranging:        ADX < 20, 价格在 EMA 之间穿梭, 无方向
  - expanding:      ATR 突破近期均值 1.5x, 波动爆发（方向未定）
  - contracting:    ATR 缩到近期最低 20%, 布林带宽收窄（酝酿突破）
"""

from __future__ import annotations

from dataclasses import dataclass
from enum import Enum, auto

import numpy as np
import pandas as pd


class Regime(Enum):
    TRENDING_UP = auto()
    TRENDING_DOWN = auto()
    RANGING = auto()
    EXPANDING = auto()
    CONTRACTING = auto()


@dataclass
class RegimeResult:
    regime: Regime
    confidence: float       # 0~1，状态判断置信度
    volatility_pct: float   # 当前 ATR%
    volatility_rank: float  # ATR 在其历史分布中的百分位
    squeeze: bool           # 布林带宽是否收缩到极致


@dataclass
class RegimeDetector:
    """市场状态检测器。"""

    adx_trend_threshold: int = 18
    adx_range_threshold: int = 15
    ema_fast: int = 20
    ema_slow: int = 50
    volatility_expand_ratio: float = 1.5
    squeeze_percentile: float = 0.20

    def detect(self, dataframe: pd.DataFrame) -> RegimeResult:
        """返回当前最新 K 线对应的市场状态。"""
        if len(dataframe) < 50:
            return RegimeResult(Regime.RANGING, 0.0, 0.0, 0.5, False)

        latest = dataframe.iloc[-1]

        # ---- 指标 ----
        adx = float(latest.get("adx", 20) or 20)
        ema_f = float(latest.get("ema_fast", latest["close"]) or latest["close"])
        ema_s = float(latest.get("ema_slow", latest["close"]) or latest["close"])
        atr_pct = float(latest.get("atr_pct", 0.01) or 0.01)
        ema_slope = float(latest.get("ema_slow_slope", 0) or 0)

        # ATR 百分位
        atr_series = dataframe["atr_pct"].dropna()
        atr_rank = float((atr_pct > atr_series).mean()) if len(atr_series) > 0 else 0.5

        # 布林带宽
        bb_width = self._bb_width(dataframe)

        # ---- 状态判断 ----
        squeeze = bb_width is not None and bb_width <= self.squeeze_percentile * self._bb_width_median(dataframe)

        # 波动扩张
        if atr_series.mean() > 0 and atr_pct > self.volatility_expand_ratio * atr_series.mean():
            return RegimeResult(Regime.EXPANDING, 0.80, atr_pct, atr_rank, squeeze)

        # 波动收敛
        if squeeze:
            return RegimeResult(Regime.CONTRACTING, 0.60, atr_pct, atr_rank, True)

        # 弱震荡
        if adx < self.adx_range_threshold:
            return RegimeResult(Regime.RANGING, 1.0 - adx / self.adx_range_threshold, atr_pct, atr_rank, False)

        # 强趋势
        if adx >= self.adx_trend_threshold:
            if ema_f > ema_s and ema_slope > 0:
                confidence = min(1.0, adx / 40.0)
                return RegimeResult(Regime.TRENDING_UP, confidence, atr_pct, atr_rank, False)
            elif ema_f < ema_s and ema_slope < 0:
                confidence = min(1.0, adx / 40.0)
                return RegimeResult(Regime.TRENDING_DOWN, confidence, atr_pct, atr_rank, False)

        # 默认
        return RegimeResult(Regime.RANGING, 0.30, atr_pct, atr_rank, False)

    def _bb_width(self, df: pd.DataFrame, period: int = 20, nbdev: int = 2) -> float | None:
        """布林带宽 = (上轨 - 下轨) / 中轨。"""
        if len(df) < period:
            return None
        close = df["close"].iloc[-period:]
        middle = close.mean()
        std = close.std()
        if middle == 0:
            return None
        return float((2 * nbdev * std) / middle)

    def _bb_width_median(self, df: pd.DataFrame, window: int = 100) -> float:
        """近 window 根 K 线的布林带宽中位数。"""
        if len(df) < window + 20:
            return 0.02  # fallback
        widths = []
        for i in range(window):
            end = len(df) - i
            start = end - 20
            if start < 0:
                break
            w = self._bb_width(df.iloc[start:end])
            if w is not None:
                widths.append(w)
        return float(np.median(widths)) if widths else 0.02
