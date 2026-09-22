const db = require('../config/database');

class Wallpaper {
    // 创建新壁纸
    static async create(data) {
        try {
            const { filename, original_filename, resolution, uploader_id, categories } = data;

            // 开始事务
            const connection = await db.getConnection();
            await connection.beginTransaction();

            try {
                // 插入壁纸记录
                const [result] = await connection.query(
                    'INSERT INTO wallpapers (filename, original_filename, resolution, uploader_id) VALUES (?, ?, ?, ?)',
                    [filename, original_filename, resolution, uploader_id]
                );

                const wallpaperId = result.insertId;

                // 插入分类关联
                if (categories && categories.length > 0) {
                    const values = categories.map(categoryId => [wallpaperId, categoryId]);
                    await connection.query(
                        'INSERT INTO wallpaper_categories (wallpaper_id, category_id) VALUES ?',
                        [values]
                    );
                }

                await connection.commit();
                return wallpaperId;
            } catch (error) {
                await connection.rollback();
                throw error;
            } finally {
                connection.release();
            }
        } catch (error) {
            throw error;
        }
    }

    // 获取壁纸列表
    static async findAll(options = {}) {
        try {
            const { category_id, page = 1, limit = 10 } = options;
            const offset = (page - 1) * limit;

            let query = `
                SELECT w.*, u.username as uploader_name,
                GROUP_CONCAT(c.name) as categories
                FROM wallpapers w
                LEFT JOIN users u ON w.uploader_id = u.id
                LEFT JOIN wallpaper_categories wc ON w.id = wc.wallpaper_id
                LEFT JOIN categories c ON wc.category_id = c.id
            `;

            const queryParams = [];

            if (category_id) {
                query += ' WHERE wc.category_id = ?';
                queryParams.push(category_id);
            }

            query += ' GROUP BY w.id ORDER BY w.created_at DESC LIMIT ? OFFSET ?';
            queryParams.push(limit, offset);

            const [wallpapers] = await db.query(query, queryParams);
            return wallpapers;
        } catch (error) {
            throw error;
        }
    }

    // 获取壁纸详情
    static async findById(id) {
        try {
            const [wallpapers] = await db.query(
                `SELECT w.*, u.username as uploader_name,
                GROUP_CONCAT(c.name) as categories
                FROM wallpapers w
                LEFT JOIN users u ON w.uploader_id = u.id
                LEFT JOIN wallpaper_categories wc ON w.id = wc.wallpaper_id
                LEFT JOIN categories c ON wc.category_id = c.id
                WHERE w.id = ?
                GROUP BY w.id`,
                [id]
            );
            return wallpapers[0];
        } catch (error) {
            throw error;
        }
    }

    // 增加下载次数
    static async incrementDownloadCount(id) {
        try {
            await db.query(
                'UPDATE wallpapers SET download_count = download_count + 1 WHERE id = ?',
                [id]
            );
        } catch (error) {
            throw error;
        }
    }

    // 删除壁纸
    static async delete(id, uploader_id) {
        try {
            const [result] = await db.query(
                'DELETE FROM wallpapers WHERE id = ? AND uploader_id = ?',
                [id, uploader_id]
            );
            return result.affectedRows > 0;
        } catch (error) {
            throw error;
        }
    }
}

module.exports = Wallpaper; 