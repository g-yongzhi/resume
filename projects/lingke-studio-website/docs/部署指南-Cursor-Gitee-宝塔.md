# 部署指南：Cursor → Gitee → 宝塔（通用版）

> **Typora 使用说明**  
> 1. 用 Typora 直接打开本 `.md` 文件即可。  
> 2. 折叠「易错点」：**文件 → 偏好设置 → 编辑器 → 勾选「允许折叠标题」**（或「开启标题折叠」），然后点击标题左侧 **▶** 收起/展开。  
> 3. 易错点统一用 **`#### ⚠️ 易错点`** 四级标题，在 Typora 里可折叠；不要用 HTML `<details>`（Typora 不支持）。  
> 4. 导出 PDF/HTML 时，折叠状态按 Typora 当前显示为准。

适用于：**Vite/React 前端 + Node 后端同机部署**、宝塔面板、PM2、WebHook 自动发布。

部署前请把占位符换成你的实际值：

| 占位符 | 示例 |
|--------|------|
| `你的域名` | `https://example.com` |
| `Gitee用户名/仓库名` | `user/my-site` |
| `服务器项目路径` | `/www/wwwroot/my-site` |
| `PM2进程名` | 宝塔 Node 项目里显示的名称 |
| `分支名` | 一般为 `main` |

---

## 一、一次性配置

### 1. 本机：Cursor 连接 Gitee

```powershell
cd "你的本地项目路径"
git remote -v
# 推荐：git@gitee.com:Gitee用户名/仓库名.git
```

首次推送：

```powershell
git add .
git commit -m "说明"
git push origin 分支名
```

#### ⚠️ 易错点

- **`Permission denied (publickey)`**  
  本机未配置 SSH。生成密钥并添加到 Gitee → [SSH 公钥设置](https://gitee.com/profile/sshkeys)。

- **推送被拒 `fetch first`**  
  远程有本地没有的提交。先执行：  
  `git pull --rebase origin 分支名`  
  再 `git push`。

- **提交一直卡住 / 界面转圈**  
  可能停在 `COMMIT_EDITMSG`：第 1 行写说明 → 保存 → 关闭标签页。  
  或直接用终端 `git commit -m "说明"`，更稳定。

---

### 2. 服务器：Git 拉取权限（宝塔终端）

```bash
cd 服务器项目路径
git remote set-url origin git@gitee.com:Gitee用户名/仓库名.git
```

生成**服务器专用**密钥（与家里电脑不是同一把）：

```bash
ssh-keygen -t ed25519 -f ~/.ssh/id_ed25519 -N ""
cat ~/.ssh/id_ed25519.pub
```

公钥整行复制 → Gitee → SSH 公钥 → 添加。

测试：

```bash
ssh -T git@gitee.com
git fetch origin
```

#### ⚠️ 易错点

- **家里电脑能 push，服务器不能 pull**  
  SSH 密钥按设备分别配置，服务器必须单独添加公钥。

- **HTTPS 拉代码时要账号密码**  
  - 用户名：Gitee 登录名（注意拼写）  
  - 密码：填 **私人令牌**，不是登录密码 → [生成令牌](https://gitee.com/personal_access_tokens)  
  - 长期建议改用 SSH，WebHook 无人值守时才不会失败。

- **`Permission denied (publickey)`**  
  公钥未添加、或 `git remote` 仍是 HTTPS 但想用 SSH。

- **首次连接问 `yes/no`**  
  输入 `yes` 将 Gitee 加入 known_hosts。

---

### 3. 服务器：环境变量 `.env`

在项目根目录创建/维护 `.env`（**不要提交到 Git**）。

常见项（按项目删减）：

```env
VITE_SITE_URL=https://你的域名
PORT=3001
# 其他后端变量…
```

#### ⚠️ 易错点

- **`VITE_` 开头变量**  
  在 **`npm run build` 时**写入前端，改 `.env` 后必须重新 build + 重启进程。

- **CORS / 站点 URL**  
  生产域名要写在允许列表里，否则接口 403。

---

### 4. 宝塔：WebHook 自动部署

**软件商店 → WebHook → 添加**，脚本模板（改路径与 PM2 名）：

```bash
#!/bin/bash
set -e
LOG=/www/wwwlogs/项目名-deploy.log
exec >> "$LOG" 2>&1
echo "======== $(date '+%F %T') ========"

cd 服务器项目路径 || exit 1

git fetch origin
echo "远程: $(git log -1 --oneline origin/分支名)"
git reset --hard origin/分支名
echo "本地: $(git log -1 --oneline)"

npm install
npm run build
pm2 restart PM2进程名 || pm2 restart all

echo "完成"
```

保存后复制 **Hook 地址**（仅宝塔提供，形如带 `hook?access_key=` 的 URL）。

#### ⚠️ 易错点

- **Gitee WebHook 返回 404**  
  URL 填成了网站首页域名，而不是宝塔 WebHook 专用地址。

- **服务器代码版本不变**  
  脚本里必须有 `git fetch`；仅 `pull` 可能因冲突或认证失败静默停在旧版本。  
  推荐 `git reset --hard origin/分支名`（会丢弃服务器上对 tracked 文件的本地修改）。

- **PM2 进程名不对**  
  在宝塔 **Node 项目** 或 `pm2 list` 中查看真实名称。

- **Hook 被触发十几次**  
  不要连续点「测试」；一次推送触发一次即可。  
  日志：`tail -30 /www/wwwlogs/项目名-deploy.log`

- **`scripts/xxx.sh` 不存在**  
  要么把逻辑写进 WebHook 脚本本体，要么确保该文件已 push 且服务器已 fetch 到。

---

### 5. Gitee：绑定 WebHook

**仓库页 → 管理 → WebHooks → 添加**

- URL：宝塔 Hook 地址  
- 事件：勾选 **Push**  
- 测试：应返回 **200**

#### ⚠️ 易错点

- **在个人设置里找不到 WebHook**  
  WebHook 在 **仓库的「管理」** 下，不在账号个人设置里。

- **404 / 超时**  
  检查 Hook URL、服务器防火墙、宝塔 WebHook 插件是否启用。

---

### 6. 静态资源与 SEO 文件（如有）

构建后应能直接访问（用浏览器**地址栏**打开，不要用 IDE 内嵌预览）：

- `https://你的域名/robots.txt` → 纯文本规则  
- `https://你的域名/sitemap.xml` → XML  

若打开后是**网站首页（带导航栏的白页）**，说明请求被 SPA 或 Nginx 转到了 `index.html`。

#### ⚠️ 易错点

- **IDE 预览报 frame / 跨域**  
  用 Chrome/Edge 地址栏直接访问，与线上用户一致。

- **Nginx 抢在 Node 前面**  
  在站点配置里为 `robots.txt`、`sitemap.xml` 单独加 `location =` 指向 `dist` 下文件，或确保 Node 对这两路径优先返回静态文件/XML。

- **sitemap 需构建生成**  
  若 `package.json` 的 `build` 含生成步骤，服务器也必须执行完整 `npm run build`，不能只复制旧 `dist`。

---

## 二、日常发布流程

```
改代码 → 保存 → Git 提交 → 推送到 Gitee → WebHook 部署 → 浏览器强刷验证
```

### 本机（Cursor）

1. `Ctrl+Shift+G` 打开源代码管理  
2. 在 **消息框** 写好说明 → **提交** → **推送**  

或终端：

```powershell
cd "你的本地项目路径"
git add .
git commit -m "本次更新说明"
git push origin 分支名
```

### 等待与验证（约 2～5 分钟）

| 检查项 | 做法 |
|--------|------|
| Gitee | 仓库最新 commit 是否为本次 |
| WebHook | 最近一条是否 **200** |
| 服务器 | `git log -1 --oneline` 是否与 Gitee 一致 |
| 网站 | **Ctrl+F5** 强刷，看改动是否生效 |

#### ⚠️ 易错点

- **只保存未推送** → 线上不会变。  
- **推送成功但网站未变** → WebHook 失败或 build 失败，查部署日志或用手动命令（第三节）。  
- **浏览器缓存** → 必须用强刷或无痕窗口。

---

## 三、自动部署失败：手动执行一次

宝塔终端（改路径、分支、PM2 名）：

```bash
cd 服务器项目路径
git fetch origin
git reset --hard origin/分支名
git log -1 --oneline
npm install
npm run build
pm2 restart PM2进程名
```

---

## 四、常见问题速查

| 现象 | 可能原因 |
|------|----------|
| WebHook 404 | Hook URL 错误 |
| 服务器 commit 很旧 | `fetch` 失败或未执行；HTTPS 无令牌 |
| `pull` 冲突 | 服务器改过 Git 跟踪的文件 → 用 `reset --hard` |
| 本机 push 慢/卡住 | 提交未完成；网络；用终端 push |
| robots/sitemap 是网页 | SPA/Nginx 未正确提供静态文件 |
| 环境变量不生效 | 未重新 build |

---

## 五、链路总览

```
Cursor 提交推送 → Gitee → WebHook → 服务器 fetch + build → PM2 重启 → 域名可访问
```

---

## 六、新站快速 Checklist

- [ ] 本机 SSH 可 `git push`  
- [ ] 服务器 SSH 可 `git fetch`  
- [ ] `.env` 已配置且含生产域名  
- [ ] 宝塔 WebHook 脚本路径 / PM2 名正确  
- [ ] Gitee WebHook 测试 200  
- [ ] 手动执行一次第三节命令成功  
- [ ] 推送后网站能更新  
- [ ] （可选）robots.txt / sitemap 正常；搜索引擎站长平台已提交  

---

*通用模板。换项目时只改占位符与 WebHook 脚本中的路径。适合 Typora 笔记库长期保存。*
