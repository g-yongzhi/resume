-- 创建数据库
CREATE DATABASE IF NOT EXISTS wallpaper_db;
USE wallpaper_db;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- 分类表
CREATE TABLE IF NOT EXISTS categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 壁纸表
CREATE TABLE IF NOT EXISTS wallpapers (
    id INT PRIMARY KEY AUTO_INCREMENT,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    resolution ENUM('4K', '2K', '1080P') NOT NULL,
    uploader_id INT NOT NULL,
    download_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (uploader_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 壁纸分类关联表
CREATE TABLE IF NOT EXISTS wallpaper_categories (
    wallpaper_id INT NOT NULL,
    category_id INT NOT NULL,
    PRIMARY KEY (wallpaper_id, category_id),
    FOREIGN KEY (wallpaper_id) REFERENCES wallpapers(id) ON DELETE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
);

-- 插入一些基础分类
INSERT INTO categories (name) VALUES 
('风景'),
('动物'),
('动漫'),
('游戏'),
('艺术'),
('科技'),
('建筑'),
('美食'),
('运动'),
('其他'); 