# 赛博朋克个人博客

一个具有赛博朋克风格的个人博客网站，用于展示 vib coding 作品、技术分享和个人介绍。

## 特性

- 🎨 **赛博朋克风格** - 霓虹灯效果、故障艺术、矩阵雨
- 📱 **响应式设计** - 完美适配各种设备
- ⚡ **纯前端实现** - HTML/CSS/JavaScript，无需后端
- 🎯 **易于扩展** - 模块化设计，方便添加新内容
- 🚀 **快速加载** - 优化性能，流畅体验

## 页面结构

- **首页** - 个人介绍、社交媒体链接、最新作品预览
- **作品集** - vib coding 作品展示，支持分类筛选
- **博客** - 技术文章和心得分享
- **关于我** - 详细介绍、技能树、经历时间线

## 技术栈

- HTML5
- CSS3 (CSS Variables, Animations, Grid, Flexbox)
- JavaScript (ES6+)
- Font Awesome (图标)
- Google Fonts (字体)

## 快速开始

1. 克隆或下载项目
2. 在项目目录中打开终端
3. 启动本地服务器：
   ```bash
   # 使用 Python
   python3 -m http.server 8000

   # 或使用 Node.js
   npx serve .

   # 或使用 PHP
   php -S localhost:8000
   ```
4. 在浏览器中访问 `http://localhost:8000`

## 自定义

### 修改个人信息

编辑以下文件来更新个人信息：

- `index.html` - 首页内容
- `about.html` - 关于我页面
- `data/projects.json` - 项目数据
- `data/blog.json` - 博客文章数据

### 添加新项目

在 `data/projects.json` 中添加新的项目对象：

```json
{
  "id": 7,
  "title": "项目名称",
  "description": "项目描述",
  "category": "creative",
  "tags": ["标签1", "标签2"],
  "image": "assets/images/projects/your-image.jpg",
  "github": "https://github.com/your-repo",
  "demo": "https://your-demo.com",
  "featured": false,
  "date": "2026-06-26"
}
```

### 添加新博客文章

在 `data/blog.json` 中添加新的文章对象：

```json
{
  "id": 7,
  "title": "文章标题",
  "excerpt": "文章摘要",
  "content": "文章内容...",
  "category": "vib-coding",
  "tags": ["标签1", "标签2"],
  "image": "assets/images/blog/your-image.jpg",
  "date": "2026-06-26",
  "author": "RipWheeler"
}
```

### 修改样式

编辑 CSS 文件来自定义样式：

- `css/style.css` - 主样式和变量
- `css/cyberpunk.css` - 赛博朋克特效
- `css/responsive.css` - 响应式样式

## 社交媒体链接

- Twitter: [@rogue30481577](https://x.com/rogue30481577)
- GitHub: [RipWheeler-max](https://github.com/RipWheeler-max)

## 许可证

© 2026 RipWheeler. 保留所有权利。

## 联系方式

如有问题或建议，欢迎通过 Twitter 或 GitHub 联系我。
