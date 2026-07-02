/**
 * 博客管理路由
 * 处理博客文章的增删改查
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const BLOG_FILE = path.join(__dirname, '../../data/blog.json');

/**
 * 确保数据文件存在
 */
function ensureDataFile() {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(BLOG_FILE)) {
        fs.writeFileSync(BLOG_FILE, JSON.stringify({ posts: [], categories: [] }, null, 2));
    }
}

/**
 * 读取博客数据
 */
function readBlog() {
    ensureDataFile();
    const data = fs.readFileSync(BLOG_FILE, 'utf-8');
    return JSON.parse(data);
}

/**
 * 保存博客数据
 */
function writeBlog(data) {
    ensureDataFile();
    fs.writeFileSync(BLOG_FILE, JSON.stringify(data, null, 2));
}

/**
 * GET /api/blog
 * 获取所有文章（公开接口）
 */
router.get('/', (req, res) => {
    try {
        const data = readBlog();
        res.json({
            success: true,
            data: data.posts
        });
    } catch (error) {
        console.error('获取文章失败:', error);
        res.status(500).json({
            success: false,
            message: '获取文章失败'
        });
    }
});

/**
 * GET /api/blog/:id
 * 获取单篇文章（公开接口）
 */
router.get('/:id', (req, res) => {
    try {
        const data = readBlog();
        const post = data.posts.find(p => String(p.id) === String(req.params.id));

        if (!post) {
            return res.status(404).json({
                success: false,
                message: '文章不存在'
            });
        }

        res.json({
            success: true,
            data: post
        });
    } catch (error) {
        console.error('获取文章失败:', error);
        res.status(500).json({
            success: false,
            message: '获取文章失败'
        });
    }
});

/**
 * POST /api/blog
 * 添加新文章（需要登录）
 */
router.post('/', authenticateToken, (req, res) => {
    try {
        const { title, excerpt, content, category, tags, image } = req.body;

        // 验证必填字段
        if (!title || !content) {
            return res.status(400).json({
                success: false,
                message: '标题和内容为必填项'
            });
        }

        const data = readBlog();

        // 创建新文章
        const newPost = {
            id: uuidv4(),
            title,
            excerpt: excerpt || content.substring(0, 150) + '...',
            content,
            category: category || 'thoughts',
            tags: tags || [],
            image: image || '',
            author: 'RipWheeler',
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            published: true
        };

        // 添加到列表
        data.posts.unshift(newPost);
        writeBlog(data);

        res.status(201).json({
            success: true,
            message: '文章添加成功',
            data: newPost
        });

    } catch (error) {
        console.error('添加文章失败:', error);
        res.status(500).json({
            success: false,
            message: '添加文章失败'
        });
    }
});

/**
 * PUT /api/blog/:id
 * 更新文章（需要登录）
 */
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const data = readBlog();
        const index = data.posts.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: '文章不存在'
            });
        }

        // 更新文章信息
        const updatedPost = {
            ...data.posts[index],
            ...req.body,
            id: req.params.id,  // 防止修改 ID
            updatedAt: new Date().toISOString()
        };

        data.posts[index] = updatedPost;
        writeBlog(data);

        res.json({
            success: true,
            message: '文章更新成功',
            data: updatedPost
        });

    } catch (error) {
        console.error('更新文章失败:', error);
        res.status(500).json({
            success: false,
            message: '更新文章失败'
        });
    }
});

/**
 * DELETE /api/blog/:id
 * 删除文章（需要登录）
 */
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const data = readBlog();
        const index = data.posts.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: '文章不存在'
            });
        }

        // 删除文章
        const deletedPost = data.posts.splice(index, 1)[0];
        writeBlog(data);

        res.json({
            success: true,
            message: '文章删除成功',
            data: deletedPost
        });

    } catch (error) {
        console.error('删除文章失败:', error);
        res.status(500).json({
            success: false,
            message: '删除文章失败'
        });
    }
});

/**
 * PUT /api/blog/:id/publish
 * 切换文章发布状态（需要登录）
 */
router.put('/:id/publish', authenticateToken, (req, res) => {
    try {
        const data = readBlog();
        const index = data.posts.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: '文章不存在'
            });
        }

        // 切换发布状态
        data.posts[index].published = !data.posts[index].published;
        data.posts[index].updatedAt = new Date().toISOString();

        writeBlog(data);

        res.json({
            success: true,
            message: `文章已${data.posts[index].published ? '发布' : '下架'}`,
            data: data.posts[index]
        });

    } catch (error) {
        console.error('切换文章状态失败:', error);
        res.status(500).json({
            success: false,
            message: '切换文章状态失败'
        });
    }
});

module.exports = router;
