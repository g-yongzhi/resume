const db = require('../config/database');

class Category {
    // 获取所有分类
    static async findAll() {
        try {
            const [categories] = await db.query('SELECT * FROM categories ORDER BY name');
            return categories;
        } catch (error) {
            throw error;
        }
    }

    // 获取分类详情
    static async findById(id) {
        try {
            const [categories] = await db.query(
                'SELECT * FROM categories WHERE id = ?',
                [id]
            );
            return categories[0];
        } catch (error) {
            throw error;
        }
    }

    // 创建分类
    static async create(name) {
        try {
            const [result] = await db.query(
                'INSERT INTO categories (name) VALUES (?)',
                [name]
            );
            return result.insertId;
        } catch (error) {
            throw error;
        }
    }

    // 更新分类
    static async update(id, name) {
        try {
            const [result] = await db.query(
                'UPDATE categories SET name = ? WHERE id = ?',
                [name, id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }

    // 删除分类
    static async delete(id) {
        try {
            const [result] = await db.query(
                'DELETE FROM categories WHERE id = ?',
                [id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Category; 