/**
 * 认证路由
 * 处理管理员登录相关接口
 */

const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');

const ADMIN_FILE = path.join(__dirname, '../../data/admin.json');

/**
 * POST /api/auth/login
 * 管理员登录
 */
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        // 验证参数
        if (!username || !password) {
            return res.status(400).json({
                success: false,
                message: '请输入用户名和密码'
            });
        }

        // 读取管理员信息
        if (!fs.existsSync(ADMIN_FILE)) {
            return res.status(500).json({
                success: false,
                message: '管理员账号未初始化'
            });
        }

        const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));

        // 验证用户名
        if (admin.username !== username) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 验证密码
        const isValidPassword = await bcrypt.compare(password, admin.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: '用户名或密码错误'
            });
        }

        // 生成 JWT Token
        const token = jwt.sign(
            { id: admin.id, username: admin.username },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
        );

        res.json({
            success: true,
            message: '登录成功',
            data: {
                token,
                username: admin.username
            }
        });

    } catch (error) {
        console.error('登录错误:', error);
        res.status(500).json({
            success: false,
            message: '登录失败，请稍后重试'
        });
    }
});

/**
 * POST /api/auth/verify
 * 验证 Token 是否有效
 */
router.post('/verify', (req, res) => {
    const { token } = req.body;

    if (!token) {
        return res.status(400).json({
            success: false,
            message: 'Token 不存在'
        });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        res.json({
            success: true,
            message: 'Token 有效',
            data: { username: decoded.username }
        });
    } catch (error) {
        res.status(403).json({
            success: false,
            message: 'Token 无效或已过期'
        });
    }
});

/**
 * POST /api/auth/change-password
 * 修改管理员密码
 */
router.post('/change-password', async (req, res) => {
    try {
        const { oldPassword, newPassword } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        // 验证登录状态
        if (!token) {
            return res.status(401).json({
                success: false,
                message: '请先登录'
            });
        }

        // 验证 token
        jwt.verify(token, process.env.JWT_SECRET);

        // 读取管理员信息
        const admin = JSON.parse(fs.readFileSync(ADMIN_FILE, 'utf-8'));

        // 验证旧密码
        const isValid = await bcrypt.compare(oldPassword, admin.password);
        if (!isValid) {
            return res.status(400).json({
                success: false,
                message: '旧密码错误'
            });
        }

        // 更新密码
        admin.password = await bcrypt.hash(newPassword, 10);
        fs.writeFileSync(ADMIN_FILE, JSON.stringify(admin, null, 2));

        res.json({
            success: true,
            message: '密码修改成功'
        });

    } catch (error) {
        console.error('修改密码错误:', error);
        res.status(500).json({
            success: false,
            message: '修改密码失败'
        });
    }
});

module.exports = router;
