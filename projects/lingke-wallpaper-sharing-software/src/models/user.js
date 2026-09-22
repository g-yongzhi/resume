const db = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
    // 创建新用户
    static async create(username, password) {
        try {
            // 检查用户名是否已存在
            const [existingUsers] = await db.query(
                'SELECT id FROM users WHERE username = ?',
                [username]
            );

            if (existingUsers.length > 0) {
                throw new Error('用户名已存在');
            }

            // 加密密码
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 插入新用户
            const [result] = await db.query(
                'INSERT INTO users (username, password) VALUES (?, ?)',
                [username, hashedPassword]
            );

            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // 通过用户名查找用户
    static async findByUsername(username) {
        try {
            const [users] = await db.query(
                'SELECT * FROM users WHERE username = ?',
                [username]
            );
            return users[0];
        } catch (error) {
            throw error;
        }
    }

    // 验证密码
    static async verifyPassword(password, hashedPassword) {
        return await bcrypt.compare(password, hashedPassword);
    }
}

module.exports = User; 