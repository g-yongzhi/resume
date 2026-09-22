#!/bin/bash
# 整段复制到：宝塔 → WebHook → 脚本框（覆盖旧脚本）

set -e
LOG=/www/wwwlogs/lingke-deploy.log
exec >> "$LOG" 2>&1
echo "======== $(date '+%F %T') ========"

cd /www/wwwroot/lingke-website || exit 1

git fetch origin
echo "Gitee 最新: $(git log -1 --oneline origin/main)"

git reset --hard origin/main
echo "服务器当前: $(git log -1 --oneline)"

npm install
npm run build

pm2 restart lingke || pm2 restart all

echo "完成"
