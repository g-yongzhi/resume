#!/usr/bin/env bash
# 灵壳官网 — 宝塔 WebHook 自动部署（路径 / 仓库 / 分支已写死）
set -euo pipefail

PROJECT_DIR="/www/wwwroot/lingke-website"
PM2_NAME="lingke-website"
GIT_BRANCH="main"

cd "$PROJECT_DIR"

echo "[deploy] $(date '+%F %T') 开始 — $PROJECT_DIR"

git fetch origin
git checkout "$GIT_BRANCH"
git reset --hard "origin/$GIT_BRANCH"

npm install
npm run build

if command -v pm2 >/dev/null 2>&1; then
  if pm2 describe "$PM2_NAME" >/dev/null 2>&1; then
    pm2 restart "$PM2_NAME"
  else
    echo "[deploy] 未找到 PM2 进程 $PM2_NAME，尝试 pm2 restart all"
    pm2 restart all
  fi
else
  echo "[deploy] 未安装 pm2，请稍后在宝塔 Node 项目中手动点「重启」"
fi

echo "[deploy] 完成 — https://lingke.studio"
