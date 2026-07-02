/**
 * 个人信息路由
 * 处理个人信息的读取和更新
 */

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { authenticateToken } = require('../middleware/auth');

const PROFILE_FILE = path.join(__dirname, '../../data/profile.json');

// 默认个人信息
const DEFAULT_PROFILE = {
    name: "RipWheeler",
    title: "创意开发者 & Vib Coding 探索者",
    bio: "我是一名热衷于创意编程和技术探索的开发者。专注于 vib coding 领域，将艺术与代码结合，创造独特的数字体验。",
    location: "数字世界",
    email: "",
    social: {
        twitter: "https://x.com/rogue30481577",
        github: "https://github.com/RipWheeler-max"
    },
    skills: [
        { name: "HTML5", level: 95 },
        { name: "CSS3", level: 90 },
        { name: "JavaScript", level: 92 },
        { name: "React", level: 85 },
        { name: "p5.js", level: 88 },
        { name: "Canvas API", level: 82 }
    ],
    highlights: [
        {
            icon: "fas fa-paint-brush",
            title: "创意编程",
            description: "将艺术与代码结合，创造独特的数字体验"
        },
        {
            icon: "fas fa-code",
            title: "技术探索",
            description: "不断学习新技术，探索编程的无限可能"
        },
        {
            icon: "fas fa-lightbulb",
            title: "创新思维",
            description: "用不同的视角看待问题，寻找创新的解决方案"
        }
    ],
    timeline: [
        {
            date: "2026",
            title: "开始 Vib Coding 之旅",
            description: "深入探索 vib coding 领域，将编程与艺术创作结合"
        },
        {
            date: "2025",
            title: "探索创意编程",
            description: "学习 p5.js、Canvas API 等创意编程工具"
        },
        {
            date: "2024",
            title: "深入前端开发",
            description: "专注于前端技术栈，掌握现代框架"
        }
    ]
};

/**
 * 确保数据文件存在
 */
function ensureDataFile() {
    const dataDir = path.join(__dirname, '../../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    if (!fs.existsSync(PROFILE_FILE)) {
        fs.writeFileSync(PROFILE_FILE, JSON.stringify(DEFAULT_PROFILE, null, 2));
    }
}

/**
 * 读取个人信息
 */
function readProfile() {
    ensureDataFile();
    const data = fs.readFileSync(PROFILE_FILE, 'utf-8');
    return JSON.parse(data);
}

/**
 * 保存个人信息
 */
function writeProfile(data) {
    ensureDataFile();
    fs.writeFileSync(PROFILE_FILE, JSON.stringify(data, null, 2));
}

/**
 * GET /api/profile
 * 获取个人信息（公开接口）
 */
router.get('/', (req, res) => {
    try {
        const profile = readProfile();
        res.json({
            success: true,
            data: profile
        });
    } catch (error) {
        console.error('获取个人信息失败:', error);
        res.status(500).json({
            success: false,
            message: '获取个人信息失败'
        });
    }
});

/**
 * PUT /api/profile
 * 更新个人信息（需要登录）
 */
router.put('/', authenticateToken, (req, res) => {
    try {
        const currentProfile = readProfile();

        // 合并更新
        const updatedProfile = {
            ...currentProfile,
            ...req.body,
            updatedAt: new Date().toISOString()
        };

        writeProfile(updatedProfile);

        res.json({
            success: true,
            message: '个人信息更新成功',
            data: updatedProfile
        });

    } catch (error) {
        console.error('更新个人信息失败:', error);
        res.status(500).json({
            success: false,
            message: '更新个人信息失败'
        });
    }
});

/**
 * PUT /api/profile/social
 * 更新社交媒体链接（需要登录）
 */
router.put('/social', authenticateToken, (req, res) => {
    try {
        const profile = readProfile();

        profile.social = {
            ...profile.social,
            ...req.body
        };

        profile.updatedAt = new Date().toISOString();
        writeProfile(profile);

        res.json({
            success: true,
            message: '社交媒体链接更新成功',
            data: profile.social
        });

    } catch (error) {
        console.error('更新社交媒体失败:', error);
        res.status(500).json({
            success: false,
            message: '更新社交媒体失败'
        });
    }
});

/**
 * POST /api/profile/skills
 * 添加技能（需要登录）
 */
router.post('/skills', authenticateToken, (req, res) => {
    try {
        const { name, level } = req.body;

        if (!name || level === undefined) {
            return res.status(400).json({
                success: false,
                message: '技能名称和等级为必填项'
            });
        }

        const profile = readProfile();

        // 检查是否已存在
        const existingIndex = profile.skills.findIndex(s => s.name === name);
        if (existingIndex !== -1) {
            profile.skills[existingIndex].level = level;
        } else {
            profile.skills.push({ name, level });
        }

        profile.updatedAt = new Date().toISOString();
        writeProfile(profile);

        res.json({
            success: true,
            message: '技能更新成功',
            data: profile.skills
        });

    } catch (error) {
        console.error('添加技能失败:', error);
        res.status(500).json({
            success: false,
            message: '添加技能失败'
        });
    }
});

/**
 * DELETE /api/profile/skills/:name
 * 删除技能（需要登录）
 */
router.delete('/skills/:name', authenticateToken, (req, res) => {
    try {
        const profile = readProfile();
        const skillName = decodeURIComponent(req.params.name);

        profile.skills = profile.skills.filter(s => s.name !== skillName);
        profile.updatedAt = new Date().toISOString();

        writeProfile(profile);

        res.json({
            success: true,
            message: '技能删除成功',
            data: profile.skills
        });

    } catch (error) {
        console.error('删除技能失败:', error);
        res.status(500).json({
            success: false,
            message: '删除技能失败'
        });
    }
});

module.exports = router;
