/**
 * Netlify Functions - API 入口
 * 将 Express 后端转换为 Serverless Functions
 */

const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// 中间件
app.use(cors());
app.use(express.json());

// 环境变量
const JWT_SECRET = process.env.JWT_SECRET || 'lazy-dev-secret-key-2026';

// ============================================
// 内存数据存储（Netlify 不支持文件系统持久化）
// ============================================

let projectsData = {
  projects: [
    {
      id: "1",
      title: "赛博朋克个人博客",
      description: "一个具有赛博朋克风格的个人博客网站，使用纯HTML/CSS/JS构建，包含霓虹灯效果、故障艺术、矩阵雨等视觉效果。",
      category: "web",
      tags: ["HTML", "CSS", "JavaScript", "赛博朋克"],
      image: "",
      github: "https://github.com/RipWheeler-max/personalwebsite",
      demo: "#",
      featured: true,
      date: "2026-06-25"
    },
    {
      id: "2",
      title: "Vib Coding 艺术生成器",
      description: "基于p5.js的创意编程工具，可以生成各种动态艺术作品，支持实时参数调整和导出功能。",
      category: "creative",
      tags: ["p5.js", "Creative Coding", "生成艺术"],
      image: "",
      github: "https://github.com/RipWheeler-max",
      demo: "#",
      featured: true,
      date: "2026-06-20"
    },
    {
      id: "3",
      title: "终端模拟器",
      description: "一个具有复古风格的网页终端模拟器，支持基本命令和自定义主题。",
      category: "tool",
      tags: ["JavaScript", "终端", "复古风格"],
      image: "",
      github: "https://github.com/RipWheeler-max",
      demo: "#",
      featured: false,
      date: "2026-06-15"
    },
    {
      id: "4",
      title: "粒子系统可视化",
      description: "使用Canvas API创建的粒子系统，支持多种物理效果和交互方式。",
      category: "creative",
      tags: ["Canvas", "物理引擎", "可视化"],
      image: "",
      github: "https://github.com/RipWheeler-max",
      demo: "#",
      featured: false,
      date: "2026-06-10"
    },
    {
      id: "5",
      title: "代码雨动画",
      description: "经典的矩阵代码雨效果实现，支持自定义字符集和颜色方案。",
      category: "creative",
      tags: ["CSS动画", "JavaScript", "视觉效果"],
      image: "",
      github: "https://github.com/RipWheeler-max",
      demo: "#",
      featured: false,
      date: "2026-06-05"
    },
    {
      id: "6",
      title: "响应式导航栏",
      description: "一个具有赛博朋克风格的响应式导航栏组件，支持多种交互效果。",
      category: "component",
      tags: ["CSS", "响应式", "UI组件"],
      image: "",
      github: "https://github.com/RipWheeler-max",
      demo: "#",
      featured: false,
      date: "2026-06-01"
    }
  ]
};

let blogData = {
  posts: [
    {
      id: "1",
      title: "Vib Coding: 当代码遇见艺术",
      excerpt: "探索 vib coding 的世界，了解如何将编程与艺术创作结合，创造独特的数字体验。",
      content: "# Vib Coding: 当代码遇见艺术\n\n## 什么是 Vib Coding？\n\nVib coding 是一种将编程与艺术创作结合的创意实践...",
      category: "vib-coding",
      tags: ["Vib Coding", "创意编程", "数字艺术"],
      image: "",
      date: "2026-06-25",
      author: "懒家伙",
      published: true
    },
    {
      id: "2",
      title: "赛博朋克美学在网页设计中的应用",
      excerpt: "如何将赛博朋克风格融入现代网页设计，创造沉浸式的用户体验。",
      content: "# 赛博朋克美学在网页设计中的应用\n\n赛博朋克美学以其独特的视觉风格和未来感吸引了无数设计师和开发者...",
      category: "creative",
      tags: ["赛博朋克", "网页设计", "UI/UX"],
      image: "",
      date: "2026-06-20",
      author: "懒家伙",
      published: true
    },
    {
      id: "3",
      title: "使用 p5.js 创建动态艺术作品",
      excerpt: "从零开始学习使用 p5.js 创建交互式动态艺术作品的完整指南。",
      content: "# 使用 p5.js 创建动态艺术作品\n\np5.js 是一个强大的创意编程库...",
      category: "tutorial",
      tags: ["p5.js", "教程", "创意编程"],
      image: "",
      date: "2026-06-15",
      author: "懒家伙",
      published: true
    },
    {
      id: "4",
      title: "代码中的美学：论优雅编程",
      excerpt: "探讨代码美学的重要性，以及如何写出既实用又优雅的代码。",
      content: "# 代码中的美学\n\n优雅的代码不仅仅是能运行的代码...",
      category: "thoughts",
      tags: ["代码美学", "编程哲学", "最佳实践"],
      image: "",
      date: "2026-06-10",
      author: "懒家伙",
      published: true
    },
    {
      id: "5",
      title: "Canvas 动画：从基础到高级",
      excerpt: "深入学习 Canvas API，创建复杂的动画效果和交互体验。",
      content: "# Canvas 动画\n\nHTML5 Canvas 是一个强大的绘图 API...",
      category: "tutorial",
      tags: ["Canvas", "动画", "JavaScript"],
      image: "",
      date: "2026-06-05",
      author: "懒家伙",
      published: true
    },
    {
      id: "6",
      title: "我的 Vib Coding 工具箱",
      excerpt: "分享我日常 vib coding 中使用的工具、库和资源。",
      content: "# 我的 Vib Coding 工具箱\n\n工欲善其事，必先利其器...",
      category: "vib-coding",
      tags: ["工具", "资源", "Vib Coding"],
      image: "",
      date: "2026-06-01",
      author: "懒家伙",
      published: true
    }
  ]
};

let profileData = {
  name: "懒家伙",
  title: "创意开发者 & Vib Coding 探索者",
  bio: "我是「懒家伙」，一名热衷于创意编程和技术探索的开发者。专注于 vib coding 领域，善于利用 AI 工具提升开发效率，将艺术与代码结合，创造独特的数字体验。",
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
    { name: "Canvas API", level: 82 },
    { name: "Claude Code", level: 95 },
    { name: "CodeX", level: 90 },
    { name: "Cursor", level: 88 },
    { name: "GitHub Copilot", level: 85 },
    { name: "Midjourney", level: 75 }
  ]
};

// 默认管理员
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || 'admin';
const ADMIN_PASSWORD_HASH = bcrypt.hashSync(process.env.ADMIN_PASSWORD || 'admin123', 10);

// ============================================
// 认证中间件
// ============================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ success: false, message: '未登录' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ success: false, message: '登录已过期' });
  }
}

// ============================================
// 认证路由
// ============================================

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (username !== ADMIN_USERNAME) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const isValid = await bcrypt.compare(password, ADMIN_PASSWORD_HASH);
  if (!isValid) {
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  }

  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, data: { token, username } });
});

app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;
  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ success: true });
  } catch {
    res.status(403).json({ success: false });
  }
});

// ============================================
// 项目路由
// ============================================

app.get('/api/projects', (req, res) => {
  res.json({ success: true, data: projectsData.projects });
});

app.get('/api/projects/:id', (req, res) => {
  const project = projectsData.projects.find(p => String(p.id) === String(req.params.id));
  if (!project) return res.status(404).json({ success: false, message: '项目不存在' });
  res.json({ success: true, data: project });
});

app.post('/api/projects', authenticateToken, (req, res) => {
  const newProject = {
    id: String(Date.now()),
    ...req.body,
    date: new Date().toISOString().split('T')[0]
  };
  projectsData.projects.unshift(newProject);
  res.json({ success: true, data: newProject });
});

app.put('/api/projects/:id', authenticateToken, (req, res) => {
  const index = projectsData.projects.findIndex(p => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: '项目不存在' });
  projectsData.projects[index] = { ...projectsData.projects[index], ...req.body };
  res.json({ success: true, data: projectsData.projects[index] });
});

app.delete('/api/projects/:id', authenticateToken, (req, res) => {
  const index = projectsData.projects.findIndex(p => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: '项目不存在' });
  const deleted = projectsData.projects.splice(index, 1)[0];
  res.json({ success: true, data: deleted });
});

app.put('/api/projects/:id/toggle', authenticateToken, (req, res) => {
  const project = projectsData.projects.find(p => String(p.id) === String(req.params.id));
  if (!project) return res.status(404).json({ success: false, message: '项目不存在' });
  project.featured = !project.featured;
  res.json({ success: true, data: project });
});

// ============================================
// 博客路由
// ============================================

app.get('/api/blog', (req, res) => {
  res.json({ success: true, data: blogData.posts });
});

app.get('/api/blog/:id', (req, res) => {
  const post = blogData.posts.find(p => String(p.id) === String(req.params.id));
  if (!post) return res.status(404).json({ success: false, message: '文章不存在' });
  res.json({ success: true, data: post });
});

app.post('/api/blog', authenticateToken, (req, res) => {
  const newPost = {
    id: String(Date.now()),
    ...req.body,
    author: "懒家伙",
    date: new Date().toISOString().split('T')[0],
    published: true
  };
  blogData.posts.unshift(newPost);
  res.json({ success: true, data: newPost });
});

app.put('/api/blog/:id', authenticateToken, (req, res) => {
  const index = blogData.posts.findIndex(p => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: '文章不存在' });
  blogData.posts[index] = { ...blogData.posts[index], ...req.body };
  res.json({ success: true, data: blogData.posts[index] });
});

app.delete('/api/blog/:id', authenticateToken, (req, res) => {
  const index = blogData.posts.findIndex(p => String(p.id) === String(req.params.id));
  if (index === -1) return res.status(404).json({ success: false, message: '文章不存在' });
  const deleted = blogData.posts.splice(index, 1)[0];
  res.json({ success: true, data: deleted });
});

app.put('/api/blog/:id/publish', authenticateToken, (req, res) => {
  const post = blogData.posts.find(p => String(p.id) === String(req.params.id));
  if (!post) return res.status(404).json({ success: false, message: '文章不存在' });
  post.published = !post.published;
  res.json({ success: true, data: post });
});

// ============================================
// 个人信息路由
// ============================================

app.get('/api/profile', (req, res) => {
  res.json({ success: true, data: profileData });
});

app.put('/api/profile', authenticateToken, (req, res) => {
  profileData = { ...profileData, ...req.body };
  res.json({ success: true, data: profileData });
});

// ============================================
// 导出为 Netlify Function
// ============================================

module.exports.handler = serverless(app);
