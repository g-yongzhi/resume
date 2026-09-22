# -*- coding: utf-8 -*-
"""共享 pytest fixtures。"""

from __future__ import annotations

from typing import Any

import numpy as np
import pandas as pd
import pytest

# ---------------------------------------------------------------------------
# 多场景测试 DataFrame：覆盖牛市、熊市、震荡
# ---------------------------------------------------------------------------


def _make_price_series(
    n: int, trend: float, volatility: float, seed: int = 42
) -> np.ndarray:
    """生成几何随机游走价格序列。trend > 0 = 牛市，< 0 = 熊市，~0 = 震荡。"""
    rng = np.random.default_rng(seed)
    returns = rng.normal(trend, volatility, n)
    prices = 100.0 * np.exp(np.cumsum(returns))
    return prices


@pytest.fixture
def bull_df() -> pd.DataFrame:
    """15m 牛市行情 DataFrame（200 行），EMA 多头排列。"""
    n = 200
    rng = np.random.default_rng(99)
    close = _make_price_series(n, trend=0.002, volatility=0.008, seed=99)
    high = close * (1 + rng.uniform(0, 0.01, n))
    low = close * (1 - rng.uniform(0, 0.01, n))
    open_ = close * (1 + rng.uniform(-0.005, 0.005, n))

    df = pd.DataFrame(
        {
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": rng.uniform(500, 5000, n),
            "date": pd.date_range("2024-01-01", periods=n, freq="15min"),
        }
    )

    # 技术指标
    df["ema_fast"] = df["close"].ewm(span=11, adjust=False).mean()
    df["ema_slow"] = df["close"].ewm(span=32, adjust=False).mean()
    df["ema_slow_slope"] = df["ema_slow"].diff(3)
    df["rsi"] = 55.0 + rng.normal(0, 5, n)  # 偏强
    df["atr"] = df["close"] * 0.008
    df["atr_pct"] = 0.008
    df["atr_pct_ma"] = 0.008
    df["pct_change_1"] = df["close"].pct_change().fillna(0.0)
    df["volume_mean"] = df["volume"].rolling(20).mean()
    df["rel_volume"] = (df["volume"] / df["volume_mean"]).fillna(1.0)
    df["adx"] = 25.0
    df["htf_bull"] = 1
    df["volatility_ok"] = 1
    df["volume_ok"] = 1
    df["signal_ready"] = 1
    df["risk_ok"] = 1
    df["news_ok"] = 1
    df["opportunity_score"] = 0.6

    return df


@pytest.fixture
def bear_df() -> pd.DataFrame:
    """15m 熊市行情 DataFrame（200 行），EMA 空头排列。"""
    n = 200
    rng = np.random.default_rng(42)
    close = _make_price_series(n, trend=-0.002, volatility=0.010, seed=42)
    high = close * (1 + rng.uniform(0, 0.012, n))
    low = close * (1 - rng.uniform(0, 0.012, n))
    open_ = close * (1 + rng.uniform(-0.006, 0.006, n))

    df = pd.DataFrame(
        {
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": rng.uniform(300, 3000, n),
            "date": pd.date_range("2024-01-01", periods=n, freq="15min"),
        }
    )

    df["ema_fast"] = df["close"].ewm(span=11, adjust=False).mean()
    df["ema_slow"] = df["close"].ewm(span=32, adjust=False).mean()
    df["rsi"] = 35.0 + rng.normal(0, 5, n)
    df["atr"] = df["close"] * 0.012
    df["atr_pct"] = 0.012
    df["pct_change_1"] = df["close"].pct_change().fillna(0.0)
    df["volume_mean"] = df["volume"].rolling(20).mean()
    df["rel_volume"] = (df["volume"] / df["volume_mean"]).fillna(1.0)
    df["adx"] = 28.0
    df["htf_bull"] = 0
    df["ema_slow_slope"] = df["ema_slow"].diff(3)

    return df


@pytest.fixture
def flat_df() -> pd.DataFrame:
    """15m 震荡行情 DataFrame（200 行），方向不明。"""
    n = 200
    rng = np.random.default_rng(77)
    close = _make_price_series(n, trend=0.0001, volatility=0.005, seed=77)
    high = close * (1 + rng.uniform(0, 0.006, n))
    low = close * (1 - rng.uniform(0, 0.006, n))
    open_ = close * (1 + rng.uniform(-0.003, 0.003, n))

    df = pd.DataFrame(
        {
            "open": open_,
            "high": high,
            "low": low,
            "close": close,
            "volume": rng.uniform(400, 3000, n),
            "date": pd.date_range("2024-01-01", periods=n, freq="15min"),
        }
    )

    df["ema_fast"] = df["close"].ewm(span=11, adjust=False).mean()
    df["ema_slow"] = df["close"].ewm(span=32, adjust=False).mean()
    df["rsi"] = 48.0 + rng.normal(0, 3, n)
    df["atr"] = df["close"] * 0.005
    df["atr_pct"] = 0.005
    df["pct_change_1"] = df["close"].pct_change().fillna(0.0)
    df["volume_mean"] = df["volume"].rolling(20).mean()
    df["rel_volume"] = (df["volume"] / df["volume_mean"]).fillna(1.0)
    df["adx"] = 18.0
    df["htf_bull"] = 0
    df["ema_slow_slope"] = df["ema_slow"].diff(3)

    return df
