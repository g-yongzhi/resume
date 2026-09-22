const Wallpaper = require('../models/wallpaper');
const fs = require('fs').promises;
const path = require('path');
const config = require('../config/config');

// 上传壁纸
const upload = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: '请选择要上传的图片'
            });
        }

        const { resolution, categories } = req.body;

        // 验证分辨率
        if (!['4K', '2K', '1080P'].includes(resolution)) {
            // 删除已上传的文件
            await fs.unlink(req.file.path);
            return res.status(400).json({
                success: false,
                message: '无效的分辨率'
            });
        }

        // 创建壁纸记录
        const wallpaperId = await Wallpaper.create({
            filename: req.file.filename,
            original_filename: req.file.originalname,
            resolution,
            uploader_id: req.user.id,
            categories: categories ? JSON.parse(categories) : []
        });

        res.status(201).json({
            success: true,
            message: '上传成功',
            data: { id: wallpaperId }
        });
    } catch (error) {
        // 删除已上传的文件
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        res.status(500).json({
            success: false,
            message: '上传失败'
        });
    }
};

// 获取壁纸列表
const list = async (req, res) => {
    try {
        const { category_id, page, limit } = req.query;
        const wallpapers = await Wallpaper.findAll({
            category_id: category_id ? parseInt(category_id) : undefined,
            page: page ? parseInt(page) : 1,
            limit: limit ? parseInt(limit) : 10
        });

        res.json({
            success: true,
            data: wallpapers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取壁纸列表失败'
        });
    }
};

// 获取壁纸详情
const detail = async (req, res) => {
    try {
        const wallpaper = await Wallpaper.findById(req.params.id);
        if (!wallpaper) {
            return res.status(404).json({
                success: false,
                message: '壁纸不存在'
            });
        }

        res.json({
            success: true,
            data: wallpaper
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取壁纸详情失败'
        });
    }
};

// 下载壁纸
const download = async (req, res) => {
    try {
        const wallpaper = await Wallpaper.findById(req.params.id);
        if (!wallpaper) {
            return res.status(404).json({
                success: false,
                message: '壁纸不存在'
            });
        }

        const filePath = path.join(config.upload.dir, wallpaper.filename);
        
        // 增加下载次数
        await Wallpaper.incrementDownloadCount(wallpaper.id);

        res.download(filePath, wallpaper.original_filename);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '下载失败'
        });
    }
};

// 删除壁纸
const remove = async (req, res) => {
    try {
        const wallpaper = await Wallpaper.findById(req.params.id);
        if (!wallpaper) {
            return res.status(404).json({
                success: false,
                message: '壁纸不存在'
            });
        }

        // 检查是否是上传者
        if (wallpaper.uploader_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: '没有权限删除此壁纸'
            });
        }

        // 删除文件
        const filePath = path.join(config.upload.dir, wallpaper.filename);
        await fs.unlink(filePath);

        // 删除数据库记录
        const deleted = await Wallpaper.delete(wallpaper.id, req.user.id);
        if (!deleted) {
            return res.status(500).json({
                success: false,
                message: '删除失败'
            });
        }

        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除失败'
        });
    }
};

module.exports = {
    upload,
    list,
    detail,
    download,
    remove
}; 