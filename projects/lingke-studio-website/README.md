# 灵壳官方网站

一个基于 React、Vite 和 TypeScript 的工作室官网项目，包含首页展示、案例详情、联系表单、后台配置接口和 SEO 文件生成等内容。

公开仓库已移除 `.env`、本地 SQLite 数据库、构建产物、依赖目录和视频大文件，仅保留源码、公共静态资源和文档。

## 功能模块

- React 官网首页
- 案例展示和案例详情页
- 联系表单
- 管理后台入口
- Express API 服务
- SQLite 数据结构与站点设置逻辑
- robots.txt / sitemap.xml 支持

## 技术栈

- React
- TypeScript
- Vite
- Framer Motion
- Express
- SQLite

## 本地运行

```bash
npm install
npm run dev
```

后端服务需要根据 `.env.example` 自行配置环境变量。

## 说明

本仓库为源码整理版本，不包含线上后台密码、本地数据库和部署私密信息。
