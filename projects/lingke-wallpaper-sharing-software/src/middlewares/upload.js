const multer = require('multer');
const path = require('path');
const fs = require('fs');
const config = require('../config/config');

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '../../', config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 配置存储
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        // 生成唯一文件名
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, uniqueSuffix + extension);
    }
});

// 文件过滤器
const fileFilter = (req, file, cb) => {
    // 只允许图片文件
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('只允许上传图片文件'), false);
    }
};

// 创建上传中间件
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 限制10MB
    }
});

module.exports = upload; 