# -*- coding: utf-8 -*-
"""
回调买入信号生成器。

核心逻辑：EMA 多头排列 + 价格靠近慢线 = 回调买入机会。
不需要缩量、反弹确认等复杂条件——那些在实际 15m K 线上几乎不会同时满足。
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class PullbackEntrySignal:
    has_signal: bool
    confidence: float
    entry_zone_low: float
    entry_zone_high: float
    stop_loss: float
    reason: str


@dataclass
class PullbackEntry:
    """简化为三条件：EMA 多头 + 价格靠近 EMA + 正常量能。"""

    pullback_to_ema_ratio: float = 0.025   # 价格在 EMA 慢线 2.5% 内

    def detect(self, dataframe: pd.DataFrame) -> PullbackEntrySignal:
        if len(dataframe) < 30:
            return PullbackEntrySignal(False, 0.0, 0, 0, 0, "data_insufficient")

        close = dataframe["close"]
        ema_fast = dataframe.get("ema_fast", close)
        ema_slow = dataframe.get("ema_slow", close)
        atr_pct = dataframe.get("atr_pct", pd.Series(0.01, index=dataframe.index))

        latest_close = float(close.iloc[-1])
        latest_ema_f = float(ema_fast.iloc[-1])
        latest_ema_s = float(ema_slow.iloc[-1])
        latest_atr_pct = float(atr_pct.iloc[-1])

        if latest_ema_s <= 0 or latest_ema_f <= 0:
            return PullbackEntrySignal(False, 0.0, 0, 0, 0, "no_ema")

        # 1) EMA 多头排列（快线 > 慢线）
        if latest_ema_f <= latest_ema_s:
            return PullbackEntrySignal(False, 0.0, 0, 0, 0, "ema_not_bull")

        # 2) 价格靠近慢线（回调到位）
        dist_to_ema = (latest_close - latest_ema_s) / latest_ema_s
        if abs(dist_to_ema) > self.pullback_to_ema_ratio:
            return PullbackEntrySignal(False, 0.0, 0, 0, 0, f"too_far:{dist_to_ema:.3f}")

        # 3) 波动不过大（ATR% < 5%）
        if latest_atr_pct > 0.05:
            return PullbackEntrySignal(False, 0.0, 0, 0, 0, "vol_too_high")

        # 前 12 根 K 线最低（止损参考）
        prev_low = float(close.iloc[-13:-1].min())

        # 入场区间
        entry_low = latest_ema_s * 0.995
        entry_high = latest_ema_s * 1.015
        stop_loss = min(prev_low * 0.995, latest_close * (1.0 - latest_atr_pct * 2.5))

        # 置信度 = f(距离 EMA 近, ATR 适中)
        dist_score = max(0.0, 1.0 - abs(dist_to_ema) / self.pullback_to_ema_ratio)
        vol_score = max(0.0, 1.0 - latest_atr_pct / 0.05)
        confidence = float(np.clip(0.6 * dist_score + 0.4 * vol_score, 0.25, 0.90))

        return PullbackEntrySignal(True, confidence, entry_low, entry_high, stop_loss, "pullback_simple")
