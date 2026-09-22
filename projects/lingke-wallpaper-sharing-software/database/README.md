# 壁纸网站数据库设计文档

## 数据库概述
数据库名：`wallpaper_db`

## 表结构说明

### 1. 用户表 (users)
存储用户基本信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INT | 用户ID | 主键，自增 |
| username | VARCHAR(50) | 用户名 | 非空，唯一 |
| password | VARCHAR(255) | 密码 | 非空（存储加密后的密码） |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新为当前时间 |

### 2. 分类表 (categories)
存储壁纸分类信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INT | 分类ID | 主键，自增 |
| name | VARCHAR(50) | 分类名称 | 非空，唯一 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |

### 3. 壁纸表 (wallpapers)
存储壁纸信息。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| id | INT | 壁纸ID | 主键，自增 |
| filename | VARCHAR(255) | 存储的文件名 | 非空 |
| original_filename | VARCHAR(255) | 原始文件名 | 非空 |
| resolution | ENUM | 分辨率 | 非空，可选值：'4K', '2K', '1080P' |
| uploader_id | INT | 上传者ID | 非空，外键关联users表 |
| download_count | INT | 下载次数 | 默认0 |
| created_at | TIMESTAMP | 创建时间 | 默认当前时间 |
| updated_at | TIMESTAMP | 更新时间 | 自动更新为当前时间 |

### 4. 壁纸分类关联表 (wallpaper_categories)
存储壁纸和分类的多对多关系。

| 字段名 | 类型 | 说明 | 约束 |
|--------|------|------|------|
| wallpaper_id | INT | 壁纸ID | 主键的一部分，外键关联wallpapers表 |
| category_id | INT | 分类ID | 主键的一部分，外键关联categories表 |

## 预置数据
系统预置了以下基础分类：
- 风景
- 动物
- 动漫
- 游戏
- 艺术
- 科技
- 建筑
- 美食
- 运动
- 其他

## 表关系
1. 一个用户可以上传多个壁纸（一对多）
2. 一个壁纸可以属于多个分类（多对多）
3. 一个分类可以包含多个壁纸（多对多）

## 注意事项
1. 所有表都使用 InnoDB 引擎，支持事务和外键约束
2. 用户密码存储时需要进行加密处理
3. 删除用户时会级联删除其上传的壁纸
4. 删除壁纸时会级联删除相关的分类关联记录 