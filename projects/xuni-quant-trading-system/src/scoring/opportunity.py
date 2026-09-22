# -*- coding: utf-8 -*-
"""
机会评分器 Phase 3。

输入列（由策略预先计算）:
    ema_fast, ema_slow, rsi, atr_pct, htf_bull(可选), volume

输出:
    opportunity_score ∈ [0.0, 1.0]
"""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any

import numpy as np
import pandas as pd


@dataclass
class OpportunityScorer:
    """多因子机会评分。"""

    min_score: float = 0.55
    rsi_sweet_low: float = 40.0
    rsi_sweet_high: float = 65.0
    atr_soft: float = 0.01
    atr_hard: float = 0.045

    def score_frame(self, dataframe: pd.DataFrame, pair: str) -> pd.Series:
        trend = self._trend_factor(dataframe)
        rsi = self._rsi_factor(dataframe)
        vol = self._volatility_factor(dataframe)
        htf = self._htf_factor(dataframe)
        volume = self._volume_factor(dataframe)
        momentum = self._momentum_factor(dataframe)

        # 权重：趋势与高周期方向为核心，量能与动量辅助
        score = (
            0.25 * trend
            + 0.25 * htf
            + 0.20 * rsi
            + 0.15 * vol
            + 0.10 * volume
            + 0.05 * momentum
        )
        score = score.clip(0.0, 1.0).fillna(0.0)
        return pd.Series(score, index=dataframe.index, name="opportunity_score")

    def score_latest(self, dataframe: pd.DataFrame, pair: str) -> float:
        if dataframe is None or len(dataframe) == 0:
            return 0.0
        return float(self.score_frame(dataframe, pair).iloc[-1])

    def explain(self, dataframe: pd.DataFrame, pair: str) -> dict[str, Any]:
        if dataframe is None or len(dataframe) == 0:
            return {"pair": pair, "score": 0.0, "factors": {}}
        row = dataframe.iloc[-1]
        factors = {
            "trend": float(self._trend_factor(dataframe).iloc[-1]),
            "rsi": float(self._rsi_factor(dataframe).iloc[-1]),
            "volatility": float(self._volatility_factor(dataframe).iloc[-1]),
            "htf": float(self._htf_factor(dataframe).iloc[-1]),
            "volume": float(self._volume_factor(dataframe).iloc[-1]),
            "momentum": float(self._momentum_factor(dataframe).iloc[-1]),
        }
        return {
            "pair": pair,
            "score": float(self.score_frame(dataframe, pair).iloc[-1]),
            "rsi_value": float(row.get("rsi", 0) or 0),
            "atr_pct": float(row.get("atr_pct", 0) or 0),
            "factors": factors,
        }

    def _trend_factor(self, df: pd.DataFrame) -> pd.Series:
        """EMA 斜率 + 价格偏离，用 ATR 归一化后 sigmoid 映射。

        旧版本用 (ema_fast - ema_slow) / close * 50 + 0.5，在 15m 级别
        EMA 价差极小（0.05%~0.2%），输出永远在 0.52~0.6，几乎无区分度。
        新版用多维度斜率 + sigmoid，充分利用 EMA 变化速率与价格位置。
        """
        if "ema_fast" not in df or "ema_slow" not in df:
            return pd.Series(0.5, index=df.index, name="trend")

        atr = df.get("atr", df["close"] * 0.005)
        atr_safe = atr.replace(0, np.nan)
        if atr_safe.isna().all():
            atr_safe = df["close"] * 0.005

        # --- 子维度 1: EMA 快线 5 周期斜率（短期动能）---
        ema_fast_slope = df["ema_fast"].diff(5) / atr_safe
        score_fast = 1.0 / (1.0 + np.exp(-ema_fast_slope * 3.0))

        # --- 子维度 2: EMA 慢线 10 周期斜率（中期趋势结构）---
        ema_slow_slope = df["ema_slow"].diff(10) / atr_safe
        score_slow = 1.0 / (1.0 + np.exp(-ema_slow_slope * 2.0))

        # --- 子维度 3: 价格 vs EMA 快线偏离（短期强弱）---
        price_dev = (df["close"] - df["ema_fast"]) / atr_safe
        score_price = 1.0 / (1.0 + np.exp(-price_dev * 4.0))

        trend = (
            0.4 * score_fast.fillna(0.5)
            + 0.3 * score_slow.fillna(0.5)
            + 0.3 * score_price.fillna(0.5)
        )
        return pd.Series(trend, index=df.index, name="trend").clip(0.0, 1.0).fillna(0.0)

    def _rsi_factor(self, df: pd.DataFrame) -> pd.Series:
        if "rsi" not in df:
            return pd.Series(0.5, index=df.index)
        rsi = df["rsi"]
        # 甜区最高分；过冷/过热降分
        mid = (self.rsi_sweet_low + self.rsi_sweet_high) / 2.0
        dist = (rsi - mid).abs()
        width = max((self.rsi_sweet_high - self.rsi_sweet_low) / 2.0, 1.0)
        score = (1.0 - dist / (width * 2.0)).clip(0.0, 1.0)
        return score.fillna(0.0)

    def _volatility_factor(self, df: pd.DataFrame) -> pd.Series:
        if "atr_pct" not in df:
            return pd.Series(0.5, index=df.index)
        atr = df["atr_pct"].fillna(0.0)
        # 适中波动最好；过高扣分
        score = pd.Series(1.0, index=df.index)
        score = np.where(
            atr <= self.atr_soft,
            0.85,
            np.where(
                atr >= self.atr_hard,
                0.15,
                1.0 - (atr - self.atr_soft) / (self.atr_hard - self.atr_soft) * 0.7,
            ),
        )
        return pd.Series(score, index=df.index).clip(0.0, 1.0)

    def _volume_factor(self, df: pd.DataFrame) -> pd.Series:
        """量能健康度：相对均量在合理区间内得分高。

        - 缩量（< 0.6x 均值）：流动性差，低分
        - 爆量（> 3.0x 均值）：可能有异常事件，降分
        - 甜区（0.8x ~ 2.0x）：正常成交活跃
        """
        if "rel_volume" not in df:
            return pd.Series(0.5, index=df.index)

        rv = df["rel_volume"].fillna(1.0).clip(0.0, 5.0)
        # 分段线性映射：0.8~2.0 满分，两端线性衰减
        score = pd.Series(1.0, index=df.index)
        score = np.where(rv < 0.6, 0.30, score)
        score = np.where((rv >= 0.6) & (rv < 0.8), 0.30 + (rv - 0.6) / 0.2 * 0.70, score)
        score = np.where((rv > 2.0) & (rv <= 3.0), 1.0 - (rv - 2.0) / 1.0 * 0.50, score)
        score = np.where(rv > 3.0, 0.50, score)
        return pd.Series(score, index=df.index).clip(0.0, 1.0).fillna(0.5)

    def _htf_factor(self, df: pd.DataFrame) -> pd.Series:
        if "htf_bull" in df:
            return df["htf_bull"].astype(float).clip(0.0, 1.0)
        if "ema_fast_4h" in df and "ema_slow_4h" in df:
            return (df["ema_fast_4h"] > df["ema_slow_4h"]).astype(float)
        return pd.Series(0.5, index=df.index)

    def _momentum_factor(self, df: pd.DataFrame) -> pd.Series:
        if "pct_change_1" not in df:
            return pd.Series(0.5, index=df.index)
        # 温和上涨加分，暴涨暴跌降分
        chg = df["pct_change_1"].fillna(0.0)
        score = 0.5 + chg * 20.0
        score = score.where(chg.abs() < 0.03, 0.25)
        return score.clip(0.0, 1.0)
