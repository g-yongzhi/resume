const jwt = require('jsonwebtoken');
const config = require('../config/config');

// 验证 JWT token
const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '请先登录'
            });
        }

        const decoded = jwt.verify(token, config.jwt.secret);
        req.user = decoded;
        next();
    } catch (error) {
        res.status(401).json({
            success: false,
            message: '无效的token'
        });
    }
};

module.exports = auth; 