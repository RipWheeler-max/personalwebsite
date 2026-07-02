/**
 * 项目管理路由
 * 处理项目的增删改查
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const PROJECTS_FILE = path.join(__dirname, '../../data/projects.json');

/**
 * 确保数据文件存在
 */
function ensureDataFile() {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(PROJECTS_FILE)) {
        fs.writeFileSync(PROJECTS_FILE, JSON.stringify({ projects: [] }, null, 2));
    }
}

/**
 * 读取项目数据
 */
function readProjects() {
    ensureDataFile();
    const data = fs.readFileSync(PROJECTS_FILE, 'utf-8');
    return JSON.parse(data);
}

/**
 * 保存项目数据
 */
function writeProjects(data) {
    ensureDataFile();
    fs.writeFileSync(PROJECTS_FILE, JSON.stringify(data, null, 2));
}

/**
 * GET /api/projects
 * 获取所有项目（公开接口）
 */
router.get('/', (req, res) => {
    try {
        const data = readProjects();
        res.json({
            success: true,
            data: data.projects
        });
    } catch (error) {
        console.error('获取项目失败:', error);
        res.status(500).json({
            success: false,
            message: '获取项目失败'
        });
    }
});

/**
 * GET /api/projects/:id
 * 获取单个项目（公开接口）
 */
router.get('/:id', (req, res) => {
    try {
        const data = readProjects();
        const project = data.projects.find(p => String(p.id) === String(req.params.id));

        if (!project) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        res.json({
            success: true,
            data: project
        });
    } catch (error) {
        console.error('获取项目失败:', error);
        res.status(500).json({
            success: false,
            message: '获取项目失败'
        });
    }
});

/**
 * POST /api/projects
 * 添加新项目（需要登录）
 */
router.post('/', authenticateToken, (req, res) => {
    try {
        const { title, description, category, tags, image, github, demo, featured } = req.body;

        // 验证必填字段
        if (!title || !description) {
            return res.status(400).json({
                success: false,
                message: '标题和描述为必填项'
            });
        }

        const data = readProjects();

        // 创建新项目
        const newProject = {
            id: uuidv4(),
            title,
            description,
            category: category || 'creative',
            tags: tags || [],
            image: image || '',
            github: github || '#',
            demo: demo || '#',
            featured: featured || false,
            date: new Date().toISOString().split('T')[0],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 添加到列表
        data.projects.unshift(newProject);
        writeProjects(data);

        res.status(201).json({
            success: true,
            message: '项目添加成功',
            data: newProject
        });

    } catch (error) {
        console.error('添加项目失败:', error);
        res.status(500).json({
            success: false,
            message: '添加项目失败'
        });
    }
});

/**
 * PUT /api/projects/:id
 * 更新项目（需要登录）
 */
router.put('/:id', authenticateToken, (req, res) => {
    try {
        const data = readProjects();
        const index = data.projects.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        // 更新项目信息
        const updatedProject = {
            ...data.projects[index],
            ...req.body,
            id: req.params.id,  // 防止修改 ID
            updatedAt: new Date().toISOString()
        };

        data.projects[index] = updatedProject;
        writeProjects(data);

        res.json({
            success: true,
            message: '项目更新成功',
            data: updatedProject
        });

    } catch (error) {
        console.error('更新项目失败:', error);
        res.status(500).json({
            success: false,
            message: '更新项目失败'
        });
    }
});

/**
 * DELETE /api/projects/:id
 * 删除项目（需要登录）
 */
router.delete('/:id', authenticateToken, (req, res) => {
    try {
        const data = readProjects();
        const index = data.projects.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        // 删除项目
        const deletedProject = data.projects.splice(index, 1)[0];
        writeProjects(data);

        res.json({
            success: true,
            message: '项目删除成功',
            data: deletedProject
        });

    } catch (error) {
        console.error('删除项目失败:', error);
        res.status(500).json({
            success: false,
            message: '删除项目失败'
        });
    }
});

/**
 * PUT /api/projects/:id/toggle
 * 切换项目上下线状态（需要登录）
 */
router.put('/:id/toggle', authenticateToken, (req, res) => {
    try {
        const data = readProjects();
        const index = data.projects.findIndex(p => p.id === req.params.id);

        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: '项目不存在'
            });
        }

        // 切换状态
        data.projects[index].featured = !data.projects[index].featured;
        data.projects[index].updatedAt = new Date().toISOString();

        writeProjects(data);

        res.json({
            success: true,
            message: `项目已${data.projects[index].featured ? '上线' : '下线'}`,
            data: data.projects[index]
        });

    } catch (error) {
        console.error('切换项目状态失败:', error);
        res.status(500).json({
            success: false,
            message: '切换项目状态失败'
        });
    }
});

module.exports = router;
