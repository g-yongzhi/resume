const jwt = require('jsonwebtoken');
const User = require('../models/user');
const config = require('../config/config');

// 用户注册
const register = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        // 创建用户
        const userId = await User.create(username, password);

        // 生成 token
        const token = jwt.sign(
            { id: userId, username },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.status(201).json({
            success: true,
            message: '注册成功',
            data: {
                token,
                user: {
                    id: userId,
                    username
                }
            }
        });
    } catch (error) {
        if (error.message === '用户名已存在') {
            return res.status(400).json({
                success: false,
                message: error.message
            });
        }
        res.status(500).json({
            success: false,
            message: '注册失败'
        });
    }
};

// 用户登录
const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证输入
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '用户名和密码不能为空'
            });
        }

        // 查找用户
        const user = await User.findByUsername(username);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 验证密码
        const isMatch = await User.verifyPassword(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 生成 token
        const token = jwt.sign(
            { id: user.id, username: user.username },
            config.jwt.secret,
            { expiresIn: config.jwt.expiresIn }
        );

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                user: {
                    id: user.id,
                    username: user.username
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '登录失败'
        });
    }
};

module.exports = {
    register,
    login
}; 