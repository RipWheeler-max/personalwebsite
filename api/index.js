/**
 * Vercel Serverless Function - MongoDB 版本
 * 赛博朋克博客 API
 */

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();

// ============================================
// 配置
// ============================================

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://roguesky029_db_user:6Dadua6TKM12qPN1@create.3tc2l8d.mongodb.net/lazy-blog?appName=Create';
const JWT_SECRET = process.env.JWT_SECRET || 'lazy-blog-secret-key-2024';

// ============================================
// 中间件
// ============================================

app.use(express.json({ limit: '10mb' }));
app.use(cors());

// ============================================
// MongoDB 连接
// ============================================

let cachedConnection = null;

async function connectDB() {
  if (cachedConnection && mongoose.connection.readyState === 1) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    cachedConnection = conn;
    console.log('MongoDB 连接成功');
    return conn;
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    throw error;
  }
}

// ============================================
// 数据模型
// ============================================

// 项目模型
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  tags: [{ type: String }],
  link: { type: String, default: '' },
  demo: { type: String, default: '' },
  github: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// 评论模型
const CommentSchema = new mongoose.Schema({
  postId: { type: mongoose.Schema.Types.ObjectId, required: true },
  parentId: { type: mongoose.Schema.Types.ObjectId, default: null }, // 回复的评论ID
  nickname: { type: String, required: true },
  email: { type: String, default: '' },
  content: { type: String, required: true },
  avatar: { type: String, default: '' },
  approved: { type: Boolean, default: true }, // 是否审核通过
  createdAt: { type: Date, default: Date.now },
});

const Comment = mongoose.models.Comment || mongoose.model('Comment', CommentSchema);

// 访问记录模型
const ViewLogSchema = new mongoose.Schema({
  path: { type: String, required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, default: null },
  ip: { type: String, default: '' },
  userAgent: { type: String, default: '' },
  referer: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now },
});

const ViewLog = mongoose.models.ViewLog || mongoose.model('ViewLog', ViewLogSchema);

// 博客文章模型
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  image: { type: String, default: '' },
  tags: [{ type: String }],
  category: { type: String, default: '' },
  author: { type: String, default: '懒家伙' },
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  commentCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Post = mongoose.models.Post || mongoose.model('Post', PostSchema);

// 个人信息模型
const ProfileSchema = new mongoose.Schema({
  name: { type: String, required: true },
  title: { type: String, default: '' },
  bio: { type: String, default: '' },
  avatar: { type: String, default: '' },
  email: { type: String, default: '' },
  github: { type: String, default: '' },
  twitter: { type: String, default: '' },
  linkedin: { type: String, default: '' },
  location: { type: String, default: '' },
  skills: [{ type: String }],
  social: {
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    linkedin: { type: String, default: '' },
  },
  updatedAt: { type: Date, default: Date.now },
});

const Profile = mongoose.models.Profile || mongoose.model('Profile', ProfileSchema);

// 管理员模型
const AdminSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Admin = mongoose.models.Admin || mongoose.model('Admin', AdminSchema);

// ============================================
// 默认数据
// ============================================

const defaultProjects = [
  {
    title: '个人博客网站',
    description: '一个现代化的个人博客和作品集网站，使用 Vercel 和 MongoDB 构建。',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
    tags: ['JavaScript', 'Vercel', 'MongoDB'],
    featured: true,
    order: 1,
  },
  {
    title: '任务管理应用',
    description: '一个简洁高效的任务管理工具，支持拖拽排序和标签分类。',
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=500',
    tags: ['React', 'Node.js', 'Express'],
    featured: true,
    order: 2,
  },
  {
    title: '天气预报小程序',
    description: '一个精美的天气预报应用，提供实时天气信息和未来预测。',
    image: 'https://images.unsplash.com/photo-1592210454359-9d19c9c6a040?w=500',
    tags: ['Vue.js', 'API', 'CSS3'],
    featured: false,
    order: 3,
  },
];

const defaultPosts = [
  {
    title: 'Vib Coding: 当代码遇见艺术',
    excerpt: '探索 vib coding 的世界，了解如何将编程与艺术创作结合，创造独特的数字体验。',
    content: '# Vib Coding: 当代码遇见艺术\n\n## 什么是 Vib Coding？\n\nVib coding 是一种将编程与艺术创作结合的创意实践。它不仅仅是写代码，更是一种表达方式。',
    category: 'vib-coding',
    tags: ['Vib Coding', '创意编程', '数字艺术'],
    author: '懒家伙',
    published: true,
    views: 156,
  },
  {
    title: '赛博朋克美学在网页设计中的应用',
    excerpt: '如何将赛博朋克风格融入现代网页设计，创造沉浸式的用户体验。',
    content: '# 赛博朋克美学在网页设计中的应用\n\n## 赛博朋克是什么？\n\n赛博朋克（Cyberpunk）是一种科幻流派。',
    category: 'creative',
    tags: ['赛博朋克', '网页设计', 'UI/UX'],
    author: '懒家伙',
    published: true,
    views: 234,
  },
  {
    title: '使用 p5.js 创建动态艺术作品',
    excerpt: '从零开始学习使用 p5.js 创建交互式动态艺术作品的完整指南。',
    content: '# 使用 p5.js 创建动态艺术作品\n\n## p5.js 简介\n\np5.js 是一个 JavaScript 库。',
    category: 'tutorial',
    tags: ['p5.js', '教程', '创意编程'],
    author: '懒家伙',
    published: true,
    views: 189,
  },
];

const defaultProfile = {
  name: '懒家伙',
  title: '全栈开发工程师',
  bio: '热爱技术，享受编码的乐趣。专注于 Web 开发，喜欢探索新技术和分享学习心得。',
  avatar: '',
  email: 'lazy@example.com',
  github: 'https://github.com/lazydev',
  twitter: 'https://twitter.com/lazydev',
  skills: ['JavaScript', 'TypeScript', 'React', 'Vue.js', 'Node.js', 'MongoDB', 'Python'],
};

// ============================================
// 初始化数据
// ============================================

async function initializeData() {
  try {
    // 检查并初始化管理员
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await Admin.create({ username: 'admin', password: hashedPassword });
      console.log('默认管理员已创建');
    }

    // 检查并初始化项目
    const projectCount = await Project.countDocuments();
    if (projectCount === 0) {
      await Project.insertMany(defaultProjects);
      console.log('默认项目已创建');
    }

    // 检查并初始化博客文章
    const postCount = await Post.countDocuments();
    if (postCount === 0) {
      await Post.insertMany(defaultPosts);
      console.log('默认博客文章已创建');
    }

    // 检查并初始化个人信息
    const profileCount = await Profile.countDocuments();
    if (profileCount === 0) {
      await Profile.create(defaultProfile);
      console.log('默认个人信息已创建');
    }

    console.log('数据初始化完成');
  } catch (error) {
    console.error('数据初始化失败:', error);
  }
}

// ============================================
// 认证中间件
// ============================================

const authMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Token 无效或已过期'
    });
  }
};

// ============================================
// 认证 API
// ============================================

app.post('/api/auth/login', async (req, res) => {
  try {
    await connectDB();
    await initializeData();

    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: '请输入用户名和密码'
      });
    }

    const admin = await Admin.findOne({ username });
    if (!admin) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    // 支持明文密码和bcrypt hash密码
    let isValidPassword = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      // bcrypt hash
      isValidPassword = await bcrypt.compare(password, admin.password);
    } else {
      // 明文密码
      isValidPassword = (admin.password === password);
    }

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
    }

    const token = jwt.sign(
      { id: admin._id, username: admin.username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      message: '登录成功',
      data: { token, username: admin.username }
    });

  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '登录失败，请稍后重试'
    });
  }
});

app.post('/api/auth/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: 'Token 不存在'
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
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

app.post('/api/auth/change-password', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { oldPassword, newPassword } = req.body;

    const admin = await Admin.findById(req.user.id);
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: '管理员不存在'
      });
    }

    // 支持明文密码和bcrypt hash密码
    let isValid = false;
    if (admin.password.startsWith('$2a$') || admin.password.startsWith('$2b$')) {
      // bcrypt hash
      isValid = await bcrypt.compare(oldPassword, admin.password);
    } else {
      // 明文密码
      isValid = (admin.password === oldPassword);
    }

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: '旧密码错误'
      });
    }

    admin.password = await bcrypt.hash(newPassword, 10);
    await admin.save();

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

// ============================================
// 博客 API
// ============================================

app.get('/api/blog', async (req, res) => {
  try {
    await connectDB();
    await initializeData();

    const { tag, limit, page = 1 } = req.query;
    let query = { published: true };

    if (tag) {
      query.tags = tag;
    }

    const pageSize = parseInt(limit) || 50;
    const skip = (parseInt(page) - 1) * pageSize;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      data: posts,
      pagination: {
        page: parseInt(page),
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      }
    });

  } catch (error) {
    console.error('获取博客错误:', error);
    res.status(500).json({
      success: false,
      message: '获取博客失败'
    });
  }
});

app.get('/api/blog/:id', async (req, res) => {
  try {
    await connectDB();

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    // 增加浏览量
    post.views += 1;
    await post.save();

    res.json({
      success: true,
      data: post
    });

  } catch (error) {
    console.error('获取文章错误:', error);
    res.status(500).json({
      success: false,
      message: '获取文章失败'
    });
  }
});

app.post('/api/blog', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { title, content, excerpt, image, tags, category, published } = req.body;

    if (!title || !content) {
      return res.status(400).json({
        success: false,
        message: '标题和内容不能为空'
      });
    }

    const post = await Post.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 200).replace(/[#*`]/g, '') + '...',
      image: image || '',
      tags: tags || [],
      category: category || '',
      author: req.user.username || '懒家伙',
      published: published !== false,
    });

    res.status(201).json({
      success: true,
      message: '文章创建成功',
      data: post
    });

  } catch (error) {
    console.error('创建文章错误:', error);
    res.status(500).json({
      success: false,
      message: '创建文章失败'
    });
  }
});

app.put('/api/blog/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!post) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    res.json({
      success: true,
      message: '文章更新成功',
      data: post
    });

  } catch (error) {
    console.error('更新文章错误:', error);
    res.status(500).json({
      success: false,
      message: '更新文章失败'
    });
  }
});

app.delete('/api/blog/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    res.json({
      success: true,
      message: '文章删除成功'
    });

  } catch (error) {
    console.error('删除文章错误:', error);
    res.status(500).json({
      success: false,
      message: '删除文章失败'
    });
  }
});

// ============================================
// 上传 API
// ============================================

app.post('/api/upload/image', authMiddleware, (req, res) => {
  try {
    const { image } = req.body;
    if (!image) {
      return res.status(400).json({
        success: false,
        message: '没有接收到图片数据'
      });
    }

    // 由于 Vercel Serverless Function 无法写入本地文件系统
    // 我们直接将 Base64 字符串返回，前端会将其保存到 MongoDB 中
    res.json({
      success: true,
      url: image
    });
  } catch (error) {
    console.error('图片处理错误:', error);
    res.status(500).json({
      success: false,
      message: '图片处理失败'
    });
  }
});

// 切换文章发布状态
app.put('/api/blog/:id/publish', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: '文章不存在'
      });
    }

    post.published = !post.published;
    post.updatedAt = Date.now();
    await post.save();

    res.json({
      success: true,
      message: post.published ? '文章已发布' : '文章已下架',
      data: post
    });

  } catch (error) {
    console.error('切换发布状态错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// ============================================
// 项目 API
// ============================================

app.get('/api/projects', async (req, res) => {
  try {
    await connectDB();
    await initializeData();

    const { featured, limit } = req.query;
    let query = {};

    if (featured === 'true') {
      query.featured = true;
    }

    let projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      projects = projects.slice(0, parseInt(limit));
    }

    res.json({
      success: true,
      data: projects
    });

  } catch (error) {
    console.error('获取项目错误:', error);
    res.status(500).json({
      success: false,
      message: '获取项目失败'
    });
  }
});

app.get('/api/projects/:id', async (req, res) => {
  try {
    await connectDB();

    const project = await Project.findById(req.params.id);
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
    console.error('获取项目错误:', error);
    res.status(500).json({
      success: false,
      message: '获取项目失败'
    });
  }
});

app.post('/api/projects', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const project = await Project.create(req.body);

    res.status(201).json({
      success: true,
      message: '项目创建成功',
      data: project
    });

  } catch (error) {
    console.error('创建项目错误:', error);
    res.status(500).json({
      success: false,
      message: '创建项目失败'
    });
  }
});

app.put('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const project = await Project.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    res.json({
      success: true,
      message: '项目更新成功',
      data: project
    });

  } catch (error) {
    console.error('更新项目错误:', error);
    res.status(500).json({
      success: false,
      message: '更新项目失败'
    });
  }
});

app.delete('/api/projects/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    res.json({
      success: true,
      message: '项目删除成功'
    });

  } catch (error) {
    console.error('删除项目错误:', error);
    res.status(500).json({
      success: false,
      message: '删除项目失败'
    });
  }
});

// 切换项目精选状态
app.put('/api/projects/:id/toggle', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({
        success: false,
        message: '项目不存在'
      });
    }

    project.featured = !project.featured;
    project.updatedAt = Date.now();
    await project.save();

    res.json({
      success: true,
      message: project.featured ? '项目已上线' : '项目已下线',
      data: project
    });

  } catch (error) {
    console.error('切换项目状态错误:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
});

// ============================================
// 个人信息 API
// ============================================

app.get('/api/profile', async (req, res) => {
  try {
    await connectDB();
    await initializeData();

    const profile = await Profile.findOne();
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: '个人信息不存在'
      });
    }

    res.json({
      success: true,
      data: profile
    });

  } catch (error) {
    console.error('获取个人信息错误:', error);
    res.status(500).json({
      success: false,
      message: '获取个人信息失败'
    });
  }
});

app.put('/api/profile', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    let profile = await Profile.findOne();

    if (profile) {
      profile = await Profile.findByIdAndUpdate(
        profile._id,
        { ...req.body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
    } else {
      profile = await Profile.create(req.body);
    }

    res.json({
      success: true,
      message: '个人信息更新成功',
      data: profile
    });

  } catch (error) {
    console.error('更新个人信息错误:', error);
    res.status(500).json({
      success: false,
      message: '更新个人信息失败'
    });
  }
});

// ============================================
// 健康检查和统计
// ============================================

app.get('/api/health', async (req, res) => {
  try {
    await connectDB();
    res.json({
      success: true,
      status: 'ok',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.json({
      success: false,
      status: 'error',
      database: 'disconnected',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const [projectCount, postCount, publishedPostCount, commentCount, todayViews] = await Promise.all([
      Project.countDocuments(),
      Post.countDocuments(),
      Post.countDocuments({ published: true }),
      Comment.countDocuments(),
      ViewLog.countDocuments({ createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) } }),
    ]);

    // 最近7天的访问量
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const weeklyViews = await ViewLog.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    // 热门文章（按浏览量排序）
    const popularPosts = await Post.find({ published: true })
      .sort({ views: -1 })
      .limit(5)
      .select('title views');

    // 最近的访问记录
    const recentViews = await ViewLog.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .select('path createdAt');

    res.json({
      success: true,
      data: {
        projects: projectCount,
        posts: postCount,
        publishedPosts: publishedPostCount,
        comments: commentCount,
        todayViews: todayViews,
        weeklyViews: weeklyViews,
        popularPosts: popularPosts,
        recentViews: recentViews,
      }
    });

  } catch (error) {
    console.error('获取统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取统计失败'
    });
  }
});

// ============================================
// 评论 API
// ============================================

// 获取文章的评论
app.get('/api/comments/:postId', async (req, res) => {
  try {
    await connectDB();

    const comments = await Comment.find({
      postId: req.params.postId,
      approved: true
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      data: comments
    });

  } catch (error) {
    console.error('获取评论错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评论失败'
    });
  }
});

// 添加评论
app.post('/api/comments', async (req, res) => {
  try {
    await connectDB();

    const { postId, parentId, nickname, email, content } = req.body;

    if (!postId || !nickname || !content) {
      return res.status(400).json({
        success: false,
        message: '帖子ID、昵称和内容不能为空'
      });
    }

    // 生成随机头像
    const avatarColors = ['#00f5ff', '#ff00ff', '#00ff41', '#ffff00', '#8b5cf6'];
    const randomColor = avatarColors[Math.floor(Math.random() * avatarColors.length)];

    const comment = await Comment.create({
      postId,
      parentId: parentId || null,
      nickname,
      email: email || '',
      content,
      avatar: randomColor,
    });

    // 更新文章评论数
    await Post.findByIdAndUpdate(postId, { $inc: { commentCount: 1 } });

    res.status(201).json({
      success: true,
      message: '评论发表成功',
      data: comment
    });

  } catch (error) {
    console.error('添加评论错误:', error);
    res.status(500).json({
      success: false,
      message: '评论发表失败'
    });
  }
});

// 删除评论（需要认证）
app.delete('/api/comments/:id', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const comment = await Comment.findByIdAndDelete(req.params.id);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: '评论不存在'
      });
    }

    // 更新文章评论数
    await Post.findByIdAndUpdate(comment.postId, { $inc: { commentCount: -1 } });

    res.json({
      success: true,
      message: '评论删除成功'
    });

  } catch (error) {
    console.error('删除评论错误:', error);
    res.status(500).json({
      success: false,
      message: '删除评论失败'
    });
  }
});

// 获取所有评论（管理后台）
app.get('/api/admin/comments', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const comments = await Comment.find()
      .sort({ createdAt: -1 })
      .limit(100);

    res.json({
      success: true,
      data: comments
    });

  } catch (error) {
    console.error('获取评论列表错误:', error);
    res.status(500).json({
      success: false,
      message: '获取评论列表失败'
    });
  }
});

// ============================================
// 访问记录 API
// ============================================

// 记录访问
app.post('/api/view', async (req, res) => {
  try {
    await connectDB();

    const { path, postId } = req.body;

    await ViewLog.create({
      path: path || '/',
      postId: postId || null,
      ip: req.ip || req.headers['x-forwarded-for'] || '',
      userAgent: req.headers['user-agent'] || '',
      referer: req.headers['referer'] || '',
    });

    // 如果是文章页面，增加浏览量
    if (postId) {
      await Post.findByIdAndUpdate(postId, { $inc: { views: 1 } });
    }

    res.json({ success: true });

  } catch (error) {
    // 静默失败，不影响用户体验
    res.json({ success: true });
  }
});

// 获取访问统计（管理后台）
app.get('/api/admin/views', authMiddleware, async (req, res) => {
  try {
    await connectDB();

    const { days = 7 } = req.query;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - parseInt(days));

    // 按日期分组统计
    const dailyViews = await ViewLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // 按页面统计
    const pageViews = await ViewLog.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: '$path',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        dailyViews,
        pageViews
      }
    });

  } catch (error) {
    console.error('获取访问统计错误:', error);
    res.status(500).json({
      success: false,
      message: '获取访问统计失败'
    });
  }
});

// ============================================
// 错误处理
// ============================================

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

app.use((err, req, res, next) => {
  console.error('服务器错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误'
  });
});

// 导出为 Vercel Serverless Function
module.exports = app;
