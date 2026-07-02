# 🚀 赛博朋克个人博客

一个赛博朋克风格的全栈个人博客系统，支持项目展示、博客文章、评论系统和访问统计。

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D14.0.0-green.svg)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-orange.svg)
![Vercel](https://img.shields.io/badge/Vercel-Deployed-black.svg)

## ✨ 功能特性

### 前端展示
- 🎨 赛博朋克风格设计，霓虹灯效果
- 📱 响应式布局，支持移动端
- 🖼️ 艺术字生成器，无需图片
- 📝 Markdown 和 HTML 文档导入
- 💬 评论系统，支持管理员删除
- 📊 访问统计展示

### 管理后台
- 📊 仪表盘统计
- 📁 项目管理（CRUD）
- 📝 博客管理（CRUD + 导入）
- 💬 评论管理
- 📈 访问统计
- 👤 个人信息管理
- 🔐 JWT 认证

### 技术栈
- **前端**: HTML, CSS, JavaScript
- **后端**: Node.js, Express
- **数据库**: MongoDB Atlas
- **部署**: Vercel Serverless Functions
- **认证**: JWT (JSON Web Token)

## 🚀 快速开始

### 1. 克隆项目
```bash
git clone https://github.com/RipWheeler-max/personalwebsite.git
cd personalwebsite
```

### 2. 安装依赖
```bash
npm install
```

### 3. 配置环境变量
创建 `.env` 文件：
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_password
```

### 4. 本地运行
```bash
npm run dev
```

访问 http://localhost:3000

## 📦 部署到 Vercel

### 1. 安装 Vercel CLI
```bash
npm i -g vercel
```

### 2. 登录 Vercel
```bash
vercel login
```

### 3. 部署
```bash
vercel --prod
```

### 4. 添加环境变量
在 Vercel 项目设置中添加环境变量：
- `MONGODB_URI`: MongoDB 连接字符串
- `JWT_SECRET`: JWT 密钥

## 📁 项目结构

```
personalwebsite/
├── api/                    # Vercel Serverless Functions
│   └── index.js           # API 入口
├── public/                 # 前端静态文件
│   ├── admin/             # 管理后台
│   │   ├── css/           # 样式
│   │   ├── js/            # 脚本
│   │   ├── index.html     # 后台首页
│   │   └── login.html     # 登录页
│   ├── css/               # 前端样式
│   ├── js/                # 前端脚本
│   ├── index.html         # 首页
│   ├── projects.html      # 作品集
│   ├── blog.html          # 博客
│   └── about.html         # 关于我
├── server/                 # 本地服务器（开发用）
├── vercel.json            # Vercel 配置
├── package.json           # 项目配置
└── README.md              # 项目说明
```

## 🔑 默认账号

- **用户名**: admin
- **密码**: admin123

> ⚠️ 部署后请立即修改默认密码！

## 📝 API 接口

### 认证
- `POST /api/auth/login` - 登录
- `POST /api/auth/verify` - 验证 Token
- `POST /api/auth/change-password` - 修改密码

### 博客
- `GET /api/blog` - 获取文章列表
- `GET /api/blog/:id` - 获取文章详情
- `POST /api/blog` - 创建文章
- `PUT /api/blog/:id` - 更新文章
- `DELETE /api/blog/:id` - 删除文章
- `PUT /api/blog/:id/publish` - 切换发布状态

### 项目
- `GET /api/projects` - 获取项目列表
- `GET /api/projects/:id` - 获取项目详情
- `POST /api/projects` - 创建项目
- `PUT /api/projects/:id` - 更新项目
- `DELETE /api/projects/:id` - 删除项目
- `PUT /api/projects/:id/toggle` - 切换精选状态

### 评论
- `GET /api/comments/:postId` - 获取文章评论
- `POST /api/comments` - 发表评论
- `DELETE /api/comments/:id` - 删除评论（管理员）

### 统计
- `GET /api/stats` - 获取统计数据
- `POST /api/view` - 记录访问

### 个人信息
- `GET /api/profile` - 获取个人信息
- `PUT /api/profile` - 更新个人信息

## 🎨 自定义

### 修改配色
编辑 `public/css/style.css` 中的 CSS 变量：
```css
:root {
    --neon-blue: #00f5ff;
    --neon-pink: #ff00ff;
    --neon-green: #00ff41;
    --bg-primary: #0a0a0f;
    /* ... */
}
```

### 添加新页面
1. 在 `public/` 目录创建新的 HTML 文件
2. 在导航栏添加链接
3. 创建对应的 CSS 和 JS 文件

## 📄 许可证

本项目采用 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 👨‍💻 作者

**RipWheeler** - [GitHub](https://github.com/RipWheeler-max)

## 🙏 致谢

- 感谢 [MongoDB Atlas](https://www.mongodb.com/atlas) 提供免费数据库
- 感谢 [Vercel](https://vercel.com) 提供免费部署服务
- 感谢 [Font Awesome](https://fontawesome.com) 提供图标
- 感谢 [Google Fonts](https://fonts.google.com) 提供字体

---

⭐ 如果这个项目对你有帮助，请给个 Star 支持一下！
