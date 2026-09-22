const express = require('express');
const router = express.Router();
const { list, detail, create, update, remove } = require('../controllers/category');
const auth = require('../middlewares/auth');

// 获取所有分类
router.get('/', list);

// 获取分类详情
router.get('/:id', detail);

// 创建分类（需要登录）
router.post('/', auth, create);

// 更新分类（需要登录）
router.put('/:id', auth, update);

// 删除分类（需要登录）
router.delete('/:id', auth, remove);

module.exports = router; 