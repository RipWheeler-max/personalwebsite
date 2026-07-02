const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

// MongoDB 连接字符串
const MONGODB_URI = 'mongodb+srv://roguesky029_db_user:6Dadua6TKM12qPN1@create.3tc2l8d.mongodb.net/lazy-blog?appName=Create';
const JWT_SECRET = 'lazy-blog-secret-key-2024';

// 连接缓存
let cachedConnection = null;

// 连接数据库
async function connectDB() {
  if (cachedConnection) {
    return cachedConnection;
  }

  try {
    const conn = await mongoose.connect(MONGODB_URI);
    cachedConnection = conn;
    console.log('MongoDB 连接成功');
    return conn;
  } catch (error) {
    console.error('MongoDB 连接失败:', error);
    throw error;
  }
}

// ==================== 数据模型 ====================

// 项目模型
const ProjectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  image: { type: String, default: '' },
  tags: [{ type: String }],
  link: { type: String, default: '' },
  github: { type: String, default: '' },
  featured: { type: Boolean, default: false },
  order: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Project = mongoose.models.Project || mongoose.model('Project', ProjectSchema);

// 博客文章模型
const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, default: '' },
  image: { type: String, default: '' },
  tags: [{ type: String }],
  published: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
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
  skills: [{ type: String }],
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

// ==================== 默认数据 ====================

const defaultProjects = [
  {
    title: '个人博客网站',
    description: '一个现代化的个人博客和作品集网站，使用 Netlify Functions 和 MongoDB 构建。',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
    tags: ['JavaScript', 'Netlify', 'MongoDB'],
    link: '',
    github: '',
    featured: true,
    order: 1,
  },
  {
    title: '任务管理应用',
    description: '一个简洁高效的任务管理工具，支持拖拽排序和标签分类。',
    image: 'https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=500',
    tags: ['React', 'Node.js', 'Express'],
    link: '',
    github: '',
    featured: true,
    order: 2,
  },
  {
    title: '天气预报小程序',
    description: '一个精美的天气预报应用，提供实时天气信息和未来预测。',
    image: 'https://images.unsplash.com/photo-1592210454359-9d19c9c6a040?w=500',
    tags: ['Vue.js', 'API', 'CSS3'],
    link: '',
    github: '',
    featured: false,
    order: 3,
  },
  {
    title: '在线聊天室',
    description: '实时聊天应用，支持多人在线聊天和私信功能。',
    image: 'https://images.unsplash.com/photo-1611606063065-ee7946f0787a?w=500',
    tags: ['WebSocket', 'React', 'MongoDB'],
    link: '',
    github: '',
    featured: false,
    order: 4,
  },
  {
    title: '电商后台管理系统',
    description: '完整的电商后台管理系统，包含商品、订单、用户管理等功能。',
    image: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=500',
    tags: ['Vue.js', 'Node.js', 'MySQL'],
    link: '',
    github: '',
    featured: true,
    order: 5,
  },
  {
    title: '音乐播放器',
    description: '一个界面美观的在线音乐播放器，支持播放列表和歌词显示。',
    image: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=500',
    tags: ['HTML5', 'CSS3', 'JavaScript'],
    link: '',
    github: '',
    featured: false,
    order: 6,
  },
];

const defaultPosts = [
  {
    title: '如何开始学习编程',
    content: `# 如开始学习编程

学习编程是现代最有价值的技能之一。无论你是想转行还是想提升自己的技术能力，编程都能为你打开新的大门。

## 选择第一门语言

对于初学者，我推荐从 **Python** 或 **JavaScript** 开始。这两种语言都有：
- 简单易懂的语法
- 庞大的社区支持
- 丰富的学习资源

## 学习资源推荐

1. **在线课程**: Coursera, Udemy, freeCodeCamp
2. **书籍**: 《Python编程：从入门到实践》
3. **实践项目**: 从简单的小项目开始

## 坚持的重要性

学习编程最重要的是坚持。每天花 1-2 小时练习，几个月后你就能看到明显的进步。

> "The only way to learn a new programming language is by writing programs in it." - Dennis Ritchie`,
    excerpt: '学习编程是现代最有价值的技能之一。本文将分享一些入门建议和学习资源。',
    image: 'https://images.unsplash.com/photo-1515879218367-8466d910auj4?w=500',
    tags: ['编程', '入门', '学习'],
    published: true,
    views: 156,
  },
  {
    title: '我的 2024 年度总结',
    content: `# 我的 2024 年度总结

2024 年是充实的一年，让我来回顾一下这一年的收获和成长。

## 技术成长

- 学习了 **React** 和 **Next.js**
- 深入了解了 **TypeScript**
- 掌握了 **MongoDB** 数据库

## 项目完成

1. 个人博客网站
2. 任务管理应用
3. 天气预报小程序

## 阅读清单

今年读了 20 本书，其中最推荐的有：
- 《深度工作》
- 《原子习惯》
- 《人类简史》

## 2025 年展望

新的一年，我希望能够：
- 学习更多后端技术
- 参与开源项目
- 提升英语水平`,
    excerpt: '回顾 2024 年的技术成长、项目完成和阅读收获，以及对 2025 年的展望。',
    image: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?w=500',
    tags: ['年度总结', '成长', '计划'],
    published: true,
    views: 234,
  },
  {
    title: '前端性能优化技巧',
    content: `# 前端性能优化技巧

性能优化是前端开发中非常重要的一环，好的性能能显著提升用户体验。

## 1. 图片优化

- 使用 **WebP** 格式
- 实现懒加载
- 使用适当的图片尺寸

## 2. 代码分割

使用动态 import 实现代码分割：

\`\`\`javascript
const LazyComponent = React.lazy(() => import('./LazyComponent'));
\`\`\`

## 3. 缓存策略

- 使用 Service Worker
- 设置合理的 HTTP 缓存头
- 使用 localStorage 存储静态数据

## 4. 减少重绘重排

- 使用 transform 代替 top/left
- 批量修改 DOM
- 使用 requestAnimationFrame

## 总结

性能优化是一个持续的过程，需要在开发的每个环节都注意。`,
    excerpt: '分享一些实用的前端性能优化技巧，包括图片优化、代码分割和缓存策略。',
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=500',
    tags: ['前端', '性能优化', 'JavaScript'],
    published: true,
    views: 189,
  },
  {
    title: '为什么选择 MongoDB',
    content: `# 为什么选择 MongoDB

MongoDB 是一个流行的 NoSQL 数据库，让我来解释为什么它是一个很好的选择。

## 灵活的数据模型

MongoDB 使用 BSON 格式存储数据，这意味着：
- 不需要固定的表结构
- 可以存储复杂的嵌套数据
- 更容易适应需求变化

## 优秀的性能

- 支持水平扩展
- 内置复制和分片
- 高效的查询优化器

## 丰富的生态系统

- **Mongoose**: 优雅的 MongoDB 对象建模
- **MongoDB Atlas**: 云数据库服务
- **Compass**: 可视化管理工具

## 适用场景

- 内容管理系统
- 实时分析
- 物联网应用
- 移动应用后端

## 总结

MongoDB 是现代应用开发的理想选择，特别是对于需要灵活数据模型的项目。`,
    excerpt: '探讨 MongoDB 的优势和适用场景，解释为什么它是现代应用开发的理想选择。',
    image: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=500',
    tags: ['MongoDB', '数据库', '后端'],
    published: true,
    views: 145,
  },
  {
    title: 'Git 工作流最佳实践',
    content: `# Git 工作流最佳实践

良好的 Git 工作流能提高团队协作效率，本文将介绍一些最佳实践。

## 分支策略

### Git Flow
- **main**: 生产环境代码
- **develop**: 开发分支
- **feature/**: 功能分支
- **release/**: 发布分支
- **hotfix/**: 紧急修复分支

## 提交规范

使用约定式提交格式：

\`\`\`
<type>(<scope>): <subject>

feat(auth): add user login
fix(api): resolve CORS issue
docs(readme): update installation guide
\`\`\`

## 代码审查

- 每个 PR 至少需要一人审查
- 关注代码质量而非个人风格
- 及时提供反馈

## 常用命令

\`\`\`bash
# 创建并切换到新分支
git checkout -b feature/new-feature

# 暂存更改
git add -p

# 交互式变基
git rebase -i HEAD~3
\`\`\`

## 总结

好的 Git 实践能让团队协作更加顺畅，减少冲突和问题。`,
    excerpt: '介绍 Git 工作流的最佳实践，包括分支策略、提交规范和代码审查。',
    image: 'https://images.unsplash.com/photo-1556075798-4825dfaaf498?w=500',
    tags: ['Git', '工作流', '团队协作'],
    published: true,
    views: 178,
  },
  {
    title: '懒家伙的第一篇博客',
    content: `# 欢迎来到我的博客

大家好，我是懒家伙！这是我的第一篇博客文章。

## 关于我

我是一个热爱技术的开发者，喜欢探索新技术和分享学习心得。

## 博客计划

我计划在这个博客上分享：
- 技术教程和经验
- 项目开发心得
- 学习资源推荐
- 生活感悟

## 为什么要写博客

1. **整理知识**: 写作是最好的学习方式
2. **帮助他人**: 分享经验可以帮助其他人
3. **记录成长**: 留下学习的足迹

## 联系我

如果你有任何问题或建议，欢迎通过以下方式联系我：
- GitHub
- Email

期待与大家一起交流学习！`,
    excerpt: '欢迎来到我的博客！这是第一篇文章，介绍博客计划和我的想法。',
    image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?w=500',
    tags: ['博客', '介绍', '开始'],
    published: true,
    views: 312,
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

const defaultAdmin = {
  username: 'admin',
  password: 'admin123',
};

// ==================== 初始化数据 ====================

async function initializeData() {
  try {
    // 检查并初始化管理员
    const adminCount = await Admin.countDocuments();
    if (adminCount === 0) {
      await Admin.create(defaultAdmin);
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

// ==================== 工具函数 ====================

// 生成 JWT Token
function generateToken(admin) {
  return jwt.sign(
    { id: admin._id, username: admin.username },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

// 验证 JWT Token
function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// 认证中间件
function authenticate(event) {
  const authHeader = event.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }

  const token = authHeader.substring(7);
  return verifyToken(token);
}

// 解析请求体
function parseBody(event) {
  try {
    return event.body ? JSON.parse(event.body) : {};
  } catch (error) {
    return {};
  }
}

// 获取查询参数
function getQueryParams(event) {
  return event.queryStringParameters || {};
}

// 获取路径参数
function getPathParams(event) {
  const path = event.path.replace('/.netlify/functions/api-mongo', '');
  return path.split('/').filter(Boolean);
}

// 响应格式
function response(statusCode, body, headers = {}) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      ...headers,
    },
    body: JSON.stringify(body),
  };
}

// ==================== 路由处理 ====================

// 处理认证相关路由
async function handleAuthRoutes(method, pathSegments, body, queryParams) {
  // POST /auth/login - 登录
  if (method === 'POST' && pathSegments[0] === 'login') {
    const { username, password } = body;

    if (!username || !password) {
      return response(400, { error: '用户名和密码不能为空' });
    }

    const admin = await Admin.findOne({ username });
    if (!admin || admin.password !== password) {
      return response(401, { error: '用户名或密码错误' });
    }

    const token = generateToken(admin);
    return response(200, {
      message: '登录成功',
      token,
      user: { id: admin._id, username: admin.username },
    });
  }

  // GET /auth/verify - 验证 token
  if (method === 'GET' && pathSegments[0] === 'verify') {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '无效的 token' });
    }
    return response(200, { valid: true, user: decoded });
  }

  // PUT /auth/password - 修改密码
  if (method === 'PUT' && pathSegments[0] === 'password') {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    const { oldPassword, newPassword } = body;
    if (!oldPassword || !newPassword) {
      return response(400, { error: '请提供旧密码和新密码' });
    }

    const admin = await Admin.findById(decoded.id);
    if (!admin || admin.password !== oldPassword) {
      return response(401, { error: '旧密码错误' });
    }

    admin.password = newPassword;
    await admin.save();

    return response(200, { message: '密码修改成功' });
  }

  return response(404, { error: '未找到认证路由' });
}

// 处理项目相关路由
async function handleProjectRoutes(method, pathSegments, body, queryParams, event) {
  // GET /projects - 获取所有项目
  if (method === 'GET' && pathSegments.length === 0) {
    const { featured, limit } = queryParams;
    let query = {};

    if (featured === 'true') {
      query.featured = true;
    }

    let projects = await Project.find(query).sort({ order: 1, createdAt: -1 });

    if (limit) {
      projects = projects.slice(0, parseInt(limit));
    }

    return response(200, projects);
  }

  // GET /projects/:id - 获取单个项目
  if (method === 'GET' && pathSegments.length === 1) {
    const project = await Project.findById(pathSegments[0]);
    if (!project) {
      return response(404, { error: '项目不存在' });
    }
    return response(200, project);
  }

  // POST /projects - 创建项目（需要认证）
  if (method === 'POST' && pathSegments.length === 0) {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    const project = await Project.create(body);
    return response(201, project);
  }

  // PUT /projects/:id - 更新项目（需要认证）
  if (method === 'PUT' && pathSegments.length === 1) {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    const project = await Project.findByIdAndUpdate(
      pathSegments[0],
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!project) {
      return response(404, { error: '项目不存在' });
    }

    return response(200, project);
  }

  // DELETE /projects/:id - 删除项目（需要认证）
  if (method === 'DELETE' && pathSegments.length === 1) {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    const project = await Project.findByIdAndDelete(pathSegments[0]);
    if (!project) {
      return response(404, { error: '项目不存在' });
    }

    return response(200, { message: '项目已删除' });
  }

  return response(404, { error: '未找到项目路由' });
}

// 处理博客文章相关路由
async function handlePostRoutes(method, pathSegments, body, queryParams, event) {
  // GET /posts - 获取所有文章
  if (method === 'GET' && pathSegments.length === 0) {
    const { published, tag, limit, page = 1 } = queryParams;
    let query = {};

    if (published === 'true') {
      query.published = true;
    }

    if (tag) {
      query.tags = tag;
    }

    const pageSize = parseInt(limit) || 10;
    const skip = (parseInt(page) - 1) * pageSize;

    const total = await Post.countDocuments(query);
    const posts = await Post.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(pageSize);

    return response(200, {
      posts,
      pagination: {
        page: parseInt(page),
        pageSize,
        total,
        pages: Math.ceil(total / pageSize),
      },
    });
  }

  // GET /posts/:id - 获取单篇文章
  if (method === 'GET' && pathSegments.length === 1) {
    const post = await Post.findById(pathSegments[0]);
    if (!post) {
      return response(404, { error: '文章不存在' });
    }

    // 增加浏览量
    post.views += 1;
    await post.save();

    return response(200, post);
  }

  // POST /posts - 创建文章（需要认证）
  if (method === 'POST' && pathSegments.length === 0) {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    // 自动生成摘要
    if (!body.excerpt && body.content) {
      body.excerpt = body.content.substring(0, 200).replace(/[#*`]/g, '') + '...';
    }

    const post = await Post.create(body);
    return response(201, post);
  }

  // PUT /posts/:id - 更新文章（需要认证）
  if (method === 'PUT' && pathSegments.length === 1) {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    const post = await Post.findByIdAndUpdate(
      pathSegments[0],
      { ...body, updatedAt: Date.now() },
      { new: true, runValidators: true }
    );

    if (!post) {
      return response(404, { error: '文章不存在' });
    }

    return response(200, post);
  }

  // DELETE /posts/:id - 删除文章（需要认证）
  if (method === 'DELETE' && pathSegments.length === 1) {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    const post = await Post.findByIdAndDelete(pathSegments[0]);
    if (!post) {
      return response(404, { error: '文章不存在' });
    }

    return response(200, { message: '文章已删除' });
  }

  return response(404, { error: '未找到文章路由' });
}

// 处理个人信息相关路由
async function handleProfileRoutes(method, pathSegments, body, queryParams, event) {
  // GET /profile - 获取个人信息
  if (method === 'GET' && pathSegments.length === 0) {
    const profile = await Profile.findOne();
    if (!profile) {
      return response(404, { error: '个人信息不存在' });
    }
    return response(200, profile);
  }

  // PUT /profile - 更新个人信息（需要认证）
  if (method === 'PUT' && pathSegments.length === 0) {
    const decoded = authenticate(event);
    if (!decoded) {
      return response(401, { error: '请先登录' });
    }

    let profile = await Profile.findOne();

    if (profile) {
      profile = await Profile.findByIdAndUpdate(
        profile._id,
        { ...body, updatedAt: Date.now() },
        { new: true, runValidators: true }
      );
    } else {
      profile = await Profile.create(body);
    }

    return response(200, profile);
  }

  return response(404, { error: '未找到个人信息路由' });
}

// ==================== 主处理函数 ====================

exports.handler = async (event, context) => {
  // 处理 CORS 预检请求
  if (event.httpMethod === 'OPTIONS') {
    return response(200, {}, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    });
  }

  try {
    // 连接数据库
    await connectDB();

    // 初始化数据
    await initializeData();

    // 解析请求信息
    const method = event.httpMethod;
    const body = parseBody(event);
    const queryParams = getQueryParams(event);
    const pathSegments = getPathParams(event);

    console.log(`[${method}] ${event.path}`, { pathSegments, queryParams });

    // 路由分发
    if (pathSegments[0] === 'auth') {
      return await handleAuthRoutes(method, pathSegments.slice(1), body, queryParams);
    }

    if (pathSegments[0] === 'projects') {
      return await handleProjectRoutes(method, pathSegments.slice(1), body, queryParams, event);
    }

    if (pathSegments[0] === 'posts') {
      return await handlePostRoutes(method, pathSegments.slice(1), body, queryParams, event);
    }

    if (pathSegments[0] === 'profile') {
      return await handleProfileRoutes(method, pathSegments.slice(1), body, queryParams, event);
    }

    // 健康检查
    if (pathSegments[0] === 'health') {
      return response(200, {
        status: 'ok',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString(),
      });
    }

    // 获取统计信息
    if (pathSegments[0] === 'stats') {
      const decoded = authenticate(event);
      if (!decoded) {
        return response(401, { error: '请先登录' });
      }

      const [projectCount, postCount, publishedPostCount] = await Promise.all([
        Project.countDocuments(),
        Post.countDocuments(),
        Post.countDocuments({ published: true }),
      ]);

      return response(200, {
        projects: projectCount,
        posts: postCount,
        publishedPosts: publishedPostCount,
      });
    }

    // 404 处理
    return response(404, { error: '未找到请求的资源' });
  } catch (error) {
    console.error('API 错误:', error);
    return response(500, {
      error: '服务器内部错误',
      message: error.message,
    });
  }
};
