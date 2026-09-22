# xuni 量化交易系统

一个基于 Freqtrade 的个人量化交易研究项目，主要用于本地 Dry-run、回测验证、风控模块和策略辅助脚本整理。

公开仓库只保留源码、测试、脚本和示例配置，不包含真实 API Key、本地数据库、历史行情文件、回测压缩包和运行日志。

## 模块内容

- 策略辅助模块
- 入场/出场信号拆分
- 风控与仓位计算
- 回测报告脚本
- 健康检查脚本
- pytest 测试用例
- Freqtrade 示例配置

## 目录结构

```text
.
├── src/                 # 业务模块
├── scripts/             # 辅助脚本
├── tests/               # 测试用例
├── docs/                # 配置说明
├── user_data/config/    # 示例配置
├── requirements.txt
└── README.md
```

## 本地运行

```bash
python -m venv .venv
pip install -r requirements.txt
pytest
```

Freqtrade 运行方式可参考 `docs/CONFIG.md` 和 `user_data/config/*.example.json`。

## 风险说明

本仓库用于学习、研究和工程整理，不构成投资建议。任何实盘操作都需要自行承担风险。
