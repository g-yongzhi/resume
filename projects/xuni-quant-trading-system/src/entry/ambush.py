# -*- coding: utf-8 -*-
"""
埋伏买入：布林带下轨 + 大周期看涨。简洁版。
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class AmbushEntrySignal:
    has_signal: bool
    confidence: float
    entry_price: float
    stop_loss: float
    reason: str


@dataclass
class AmbushEntry:
    bb_period: int = 20
    bb_nbdev: int = 2

    def detect(self, dataframe: pd.DataFrame) -> AmbushEntrySignal:
        if len(dataframe) < self.bb_period + 20:
            return AmbushEntrySignal(False, 0.0, 0, 0, "data_insufficient")

        close = dataframe["close"]
        latest_close = float(close.iloc[-1])

        # 布林带
        bb = self._bollinger(dataframe)
        if bb is None:
            return AmbushEntrySignal(False, 0.0, 0, 0, "bb_fail")

        lower, middle, upper, width = bb

        # 价格在下半区（0~35%）
        pos = (latest_close - lower) / (upper - lower) if (upper - lower) > 0 else 0.5
        if pos > 0.35:
            return AmbushEntrySignal(False, 0.0, 0, 0, f"pos={pos:.2f}")

        # HTF 看涨
        if dataframe.get("htf_bull") is not None and float(dataframe["htf_bull"].iloc[-1]) == 0:
            return AmbushEntrySignal(False, 0.0, 0, 0, "htf_bear")

        conf = float(np.clip(1.0 - pos / 0.35, 0.20, 0.65))
        stop = lower * 0.990
        return AmbushEntrySignal(True, conf, latest_close, stop, "ambush")

    def _bollinger(self, df: pd.DataFrame) -> tuple | None:
        c = df["close"].iloc[-self.bb_period:]
        if len(c) < self.bb_period:
            return None
        m = float(c.mean())
        s = float(c.std())
        return (m - self.bb_nbdev * s, m, m + self.bb_nbdev * s, (2 * self.bb_nbdev * s) / m if m > 0 else 0)
