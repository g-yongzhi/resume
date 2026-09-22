# 配置字段说明（config.json 为标准 JSON，不能写 // 注释）
# 本地可运行文件: user_data/config/config.json（由 example 复制，已 gitignore）
# 模板文件: user_data/config/config.example.json

## 核心运行

| 字段 | 推荐值 | 说明 |
|------|--------|------|
| dry_run | true | 本地模拟成交，底子阶段必须为 true |
| trading_mode | spot | 默认现货；期货见 config_futures.example.json |
| timeframe | 1h | 策略主周期（见下文选型理由） |
| stake_currency | USDT | 计价货币 |
| stake_amount | unlimited | 按可用余额与 max_open_trades 分配 |
| dry_run_wallet | 10000 | 模拟钱包初始资金 |
| max_open_trades | 3 | 最大同时持仓数（风控预留） |

## 交易所

| 字段 | 说明 |
|------|------|
| exchange.name | binance |
| exchange.key / secret | Dry-run 拉公有行情可留空；实盘再填 |
| pair_whitelist | 当前仅 BTC/USDT、ETH/USDT |
| pair_blacklist | 默认拉黑 BNB/.*，避免手续费币干扰 |

### 代理（国内网络常用）

若无法直连 Binance，在本地 `config.json` 中增加（端口按你的代理软件修改）：

```json
"ccxt_config": {
  "enableRateLimit": true,
  "aiohttp_proxy": "http://127.0.0.1:7890",
  "proxies": {
    "http": "http://127.0.0.1:7890",
    "https": "http://127.0.0.1:7890"
  },
  "options": {
    "defaultType": "spot"
  }
},
"ccxt_async_config": {
  "enableRateLimit": true,
  "rateLimit": 200,
  "aiohttp_proxy": "http://127.0.0.1:7890"
}
```

配置后重新执行 `download-data` / `backtesting` / `trade`。

## 风控相关（预留，可后续收紧）

| 字段 | 当前 | 含义 |
|------|------|------|
| stoploss | -0.10 | 单笔止损 10%（空策略不会触发） |
| minimal_roi | 阶梯 | 保本/止盈时间表 |
| tradable_balance_ratio | 0.99 | 可用资金比例 |
| trailing_stop | false | 追踪止损（后续再开） |
| cancellation / unfilledtimeout | 10min | 未成交撤单 |

## 路径

| 字段 | 路径 |
|------|------|
| user_data_dir | user_data |
| logfile | user_data/logs/freqtrade_spot.log |
| db_url | sqlite:///user_data/tradesv3.dryrun.sqlite |
| data | user_data/data/binance/ |

## 期货模板差异（config_futures）

- trading_mode = futures
- margin_mode = isolated
- pair 格式 = BTC/USDT:USDT
- stoploss_on_exchange = true
- liquidation_buffer = 0.05
- 独立 db / log / api port，避免与现货 bot 冲突

## 时间周期选型（专业结论）

- **主策略周期: 1h** — 噪声与信号密度平衡最好，适合底子验证与后续多币种扩展
- **辅助周期: 4h** — 预留趋势过滤 / 多周期确认，数据一并下载
- 不选 5m/15m 作为默认：手续费与假突破成本更高，不适合 Foundation 阶段
