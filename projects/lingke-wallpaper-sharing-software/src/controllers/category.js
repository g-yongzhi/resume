const Category = require('../models/category');

// 获取所有分类
const list = async (req, res) => {
    try {
        const categories = await Category.findAll();
        res.json({
            success: true,
            data: categories
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取分类列表失败'
        });
    }
};

// 获取分类详情
const detail = async (req, res) => {
    try {
        const category = await Category.findById(req.params.id);
        if (!category) {
            return res.status(404).json({
                success: false,
                message: '分类不存在'
            });
        }

        res.json({
            success: true,
            data: category
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '获取分类详情失败'
        });
    }
};

// 创建分类
const create = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: '分类名称不能为空'
            });
        }

        const categoryId = await Category.create(name);
        res.status(201).json({
            success: true,
            message: '创建成功',
            data: { id: categoryId }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '创建分类失败'
        });
    }
};

// 更新分类
const update = async (req, res) => {
    try {
        const { name } = req.body;
        const { id } = req.params;

        if (!name) {
            return res.status(400).json({
                success: false,
                message: '分类名称不能为空'
            });
        }

        const updated = await Category.update(id, name);
        if (!updated) {
            return res.status(404).json({
                success: false,
                message: '分类不存在'
            });
        }

        res.json({
            success: true,
            message: '更新成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '更新分类失败'
        });
    }
};

// 删除分类
const remove = async (req, res) => {
    try {
        const deleted = await Category.delete(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: '分类不存在'
            });
        }

        res.json({
            success: true,
            message: '删除成功'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: '删除分类失败'
        });
    }
};

module.exports = {
    list,
    detail,
    create,
    update,
    remove
}; 