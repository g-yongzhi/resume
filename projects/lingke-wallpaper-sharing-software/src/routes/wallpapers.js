const express = require('express');
const router = express.Router();
const { upload, list, detail, download, remove } = require('../controllers/wallpaper');
const auth = require('../middlewares/auth');
const uploadMiddleware = require('../middlewares/upload');

// 上传壁纸（需要登录）
router.post('/', auth, uploadMiddleware.single('image'), upload);

// 获取壁纸列表
router.get('/', list);

// 获取壁纸详情
router.get('/:id', detail);

// 下载壁纸
router.get('/:id/download', download);

// 删除壁纸（需要登录）
router.delete('/:id', auth, remove);

module.exports = router; 