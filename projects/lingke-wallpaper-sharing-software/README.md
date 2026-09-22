# 灵壳壁纸分享软件

一个基于 Node.js、Express 和 MySQL 的壁纸分享网站项目，包含前端页面、后端接口、用户注册登录、壁纸上传、分类浏览、详情查看和下载统计等功能。

本仓库整理自项目源码目录，已移除本地运行密码、依赖目录和用户上传图片。软著证书、合作开发协议、使用说明书等证明材料未放入公开仓库，可作为面试或材料审核时的补充文件。

## 功能模块

- 用户注册、登录与 JWT 鉴权
- 壁纸列表、分类筛选与详情页
- 登录用户上传壁纸
- 壁纸下载次数统计
- MySQL 数据表结构与初始化分类
- API 文档和用户操作手册

## 目录结构

```text
.
├── src/                 # Express 后端源码
├── public/              # 前端页面与静态资源
├── database/            # 数据库结构说明
├── docs/                # API 文档、用户操作手册
├── package.json
└── .env.example
```

## 本地运行

```bash
npm install
copy .env.example .env
npm run dev
```

运行前需要先创建 MySQL 数据库，可参考 [database/schema.sql](database/schema.sql)。

默认接口地址为：

```text
http://localhost:3000/api
```

## 说明

本项目为学习和课程/软著材料整理用途。公开仓库中不包含真实数据库密码、线上部署配置和用户上传文件。
