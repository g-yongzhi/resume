require('dotenv').config();

module.exports = {
    // 服务器配置
    port: process.env.PORT || 3000,

    // 数据库配置
    database: {
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: process.env.DB_NAME || 'wallpaper_db'
    },

    // JWT配置
    jwt: {
        secret: process.env.JWT_SECRET || 'your_jwt_secret_key',
        expiresIn: process.env.JWT_EXPIRES_IN || '24h'
    },

    // 文件上传配置
    upload: {
        dir: process.env.UPLOAD_DIR || 'uploads'
    }
}; 
