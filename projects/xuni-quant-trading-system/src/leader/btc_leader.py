# -*- coding: utf-8 -*-
"""
BTC 领导力分析。

加密市场独有的 alpha 来源：BTC 先动，山寨币后跟。
这个模块量化这种领先-滞后关系，输出每个山寨币的相对强弱评分。
"""

from __future__ import annotations

from dataclasses import dataclass

import numpy as np
import pandas as pd


@dataclass
class BTCLeaderResult:
    relative_strength: float     # > 1.0 = 比 BTC 强，< 1.0 = 比 BTC 弱
    btc_momentum: float          # BTC 自身的动量方向 (-1 ~ +1)
    divergence: float            # 山寨与 BTC 的背离程度（正=山寨补涨机会）
    btc_danger: bool             # BTC 是否处于危险状态


@dataclass
class BTCLeaderAnalyzer:
    """BTC 领导力分析器。"""

    strength_window: int = 96   # 4h * 24 = 4 天，衡量相对强弱
    momentum_window: int = 24   # 1h * 24，衡量 BTC 短期动量
    danger_ema_period: int = 50

    def analyze(
        self,
        alt_df: pd.DataFrame,
        btc_df: pd.DataFrame,
    ) -> BTCLeaderResult:
        """计算山寨币相对于 BTC 的强弱。"""
        if len(alt_df) < 10 or len(btc_df) < 10:
            return BTCLeaderResult(1.0, 0.0, 0.0, False)

        alt_close = alt_df["close"]
        btc_close = btc_df["close"]

        # 对齐长度
        min_len = min(len(alt_close), len(btc_close))
        alt_close = alt_close.iloc[-min_len:]
        btc_close = btc_close.iloc[-min_len:]

        # 归一化：各自从起始点算累计收益
        alt_norm = alt_close / alt_close.iloc[0]
        btc_norm = btc_close / btc_close.iloc[0]

        # 相对强弱 = 山寨累计收益 / BTC 累计收益
        rs = float(alt_norm.iloc[-1] / btc_norm.iloc[-1]) if btc_norm.iloc[-1] > 0 else 1.0

        # BTC 动量
        btc_ret = btc_close.pct_change(self.momentum_window).iloc[-1]
        btc_momentum = float(np.clip(btc_ret / 0.05, -1.0, 1.0)) if not np.isnan(btc_ret) else 0.0

        # 背离度：如果 BTC 涨但山寨没跟，divergence > 0（山寨可能补涨）
        btc_short = btc_close.pct_change(12).iloc[-1]
        alt_short = alt_close.pct_change(12).iloc[-1]
        divergence = float(btc_short - alt_short) if not (np.isnan(btc_short) or np.isnan(alt_short)) else 0.0

        # BTC 危险信号：价格跌破长期 EMA + 放量
        btc_danger = False
        if "ema_slow" in btc_df.columns:
            btc_ema = btc_df["ema_slow"].iloc[-1]
            btc_price = btc_close.iloc[-1]
            if btc_price < btc_ema:
                btc_danger = True
        # 放量下跌
        if "rel_volume" in btc_df.columns and "pct_change_1" in btc_df.columns:
            rv = float(btc_df["rel_volume"].iloc[-1])
            chg = float(btc_df["pct_change_1"].iloc[-1])
            if rv > 2.0 and chg < -0.005:
                btc_danger = True

        return BTCLeaderResult(
            relative_strength=float(np.clip(rs, 0.5, 2.0)),
            btc_momentum=btc_momentum,
            divergence=float(np.clip(divergence, -0.1, 0.1)),
            btc_danger=btc_danger,
        )
