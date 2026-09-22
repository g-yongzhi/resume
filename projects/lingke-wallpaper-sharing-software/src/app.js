const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const config = require('./config/config');

// 创建 Express 应用
const app = express();

// 确保上传目录存在
const uploadsDir = path.join(__dirname, '..', config.upload.dir);
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// 中间件
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态文件服务
app.use('/uploads', express.static(uploadsDir));
app.use(express.static(path.join(__dirname, '../public')));

// 路由
app.use('/api/auth', require('./routes/auth'));
app.use('/api/wallpapers', require('./routes/wallpapers'));
app.use('/api/categories', require('./routes/categories'));

// 主页跳转
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 错误处理中间件
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        success: false,
        message: '服务器内部错误'
    });
});

// 启动服务器
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`服务器运行在 http://localhost:${PORT}`);
    console.log(`上传目录: ${uploadsDir}`);
}); 