/**
 * 赛博朋克博客 - 后端服务器
 * 提供 API 接口和管理员认证
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

// 导入路由
const authRoutes = require('./routes/auth');
const projectRoutes = require('./routes/projects');
const blogRoutes = require('./routes/blog');
const profileRoutes = require('./routes/profile');
const uploadRoutes = require('./routes/upload');

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// 中间件配置
// ============================================

// 解析 JSON 请求体
app.use(express.json());

// 允许跨域（开发环境）
app.use(cors());

// 请求日志
app.use((req, res, next) => {
    const time = new Date().toISOString();
    console.log(`[${time}] ${req.method} ${req.url}`);
    next();
});

// ============================================
// 静态文件服务
// ============================================

// 展示端（普通用户访问）
app.use(express.static(path.join(__dirname, '../public')));

// 管理员后台
app.use('/admin', express.static(path.join(__dirname, '../admin')));

// ============================================
// API 路由
// ============================================

// 认证相关
app.use('/api/auth', authRoutes);

// 项目管理
app.use('/api/projects', projectRoutes);

// 博客管理
app.use('/api/blog', blogRoutes);

// 上传文件
app.use('/api/upload', uploadRoutes);

// 个人信息
app.use('/api/profile', profileRoutes);

// ============================================
// 前端路由（SPA 支持）
// ============================================

// 管理员后台路由
app.get('/admin/*', (req, res) => {
    res.sendFile(path.join(__dirname, '../admin/index.html'));
});

// 展示端路由
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// ============================================
// 错误处理
// ============================================

// 404 错误
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: '接口不存在'
    });
});

// 全局错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({
        success: false,
        message: '服务器内部错误',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// ============================================
// 启动服务器
// ============================================

app.listen(PORT, () => {
    console.log('');
    console.log('╔═══════════════════════════════════════════════════════════╗');
    console.log('║          🚀 赛博朋克博客服务器已启动                      ║');
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log(`║  展示端:     http://localhost:${PORT}                      ║`);
    console.log(`║  管理后台:   http://localhost:${PORT}/admin                ║`);
    console.log('╠═══════════════════════════════════════════════════════════╣');
    console.log('║  管理员账号: admin                                        ║');
    console.log('║  管理员密码: admin123                                     ║');
    console.log('╚═══════════════════════════════════════════════════════════╝');
    console.log('');

    // 初始化管理员账号
    initAdmin();
});

/**
 * 初始化管理员账号
 */
async function initAdmin() {
    const bcrypt = require('bcryptjs');
    const adminFile = path.join(__dirname, '../data/admin.json');

    // 确保 data 目录存在
    const dataDir = path.join(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // 如果管理员文件不存在，创建默认管理员
    if (!fs.existsSync(adminFile)) {
        const defaultAdmin = {
            id: '1',
            username: process.env.ADMIN_USERNAME || 'admin',
            password: await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 10),
            createdAt: new Date().toISOString()
        };

        fs.writeFileSync(adminFile, JSON.stringify(defaultAdmin, null, 2));
        console.log('✅ 默认管理员账号已创建');
    }
}

module.exports = app;
