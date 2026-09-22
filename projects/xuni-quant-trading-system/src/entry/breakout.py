# -*- coding: utf-8 -*-
"""
突破买入：放量破前高即入场。简洁实用。
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class BreakoutEntrySignal:
    has_signal: bool
    confidence: float
    entry_price: float
    stop_loss: float
    reason: str


@dataclass
class BreakoutEntry:
    lookback: int = 24
    volume_spike_ratio: float = 1.2

    def detect(self, dataframe: pd.DataFrame) -> BreakoutEntrySignal:
        if len(dataframe) < self.lookback + 5:
            return BreakoutEntrySignal(False, 0.0, 0, 0, "data_insufficient")

        close = dataframe["close"]
        high = dataframe["high"]
        volume = dataframe["volume"]
        vol_mean = volume.rolling(20).mean()

        latest_close = float(close.iloc[-1])
        latest_vol = float(volume.iloc[-1])
        latest_vol_mean = float(vol_mean.iloc[-1])

        # 前 lookback 根 K 线高点（不含当前）
        recent_high = float(high.iloc[-(self.lookback + 1):-1].max())

        # 突破
        if latest_close <= recent_high:
            return BreakoutEntrySignal(False, 0.0, 0, 0, "no_breakout")

        # 放量
        if latest_vol_mean > 0 and latest_vol < latest_vol_mean * self.volume_spike_ratio:
            return BreakoutEntrySignal(False, 0.0, 0, 0, "vol_low")

        confidence = min(1.0, (latest_close / recent_high - 1.0) / 0.005)
        stop_loss = recent_high * 0.990

        return BreakoutEntrySignal(True, float(np.clip(confidence, 0.25, 0.90)), latest_close, stop_loss, "breakout")
