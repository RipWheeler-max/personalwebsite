/**
 * 管理员后台脚本
 * 处理所有管理功能
 */

const API_BASE = window.location.origin;
let currentToken = localStorage.getItem('admin_token');

// ============================================
// 初始化
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // 检查登录状态
    if (!currentToken) {
        window.location.href = '/admin/login.html';
        return;
    }

    // 初始化界面
    initNavigation();
    initEventListeners();
    loadDashboard();

    // 显示用户名
    const username = localStorage.getItem('admin_username');
    if (username) {
        document.getElementById('adminUsername').textContent = username;
    }
});

// ============================================
// API 请求封装
// ============================================

async function apiRequest(endpoint, options = {}) {
    const config = {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${currentToken}`
        },
        ...options
    };

    try {
        const response = await fetch(`${API_BASE}${endpoint}`, config);
        const data = await response.json();

        if (response.status === 401 || response.status === 403) {
            // Token 过期，跳转登录
            localStorage.removeItem('admin_token');
            localStorage.removeItem('admin_username');
            window.location.href = '/admin/login.html';
            return null;
        }

        return data;
    } catch (error) {
        console.error('API 请求失败:', error);
        showToast('网络请求失败', 'error');
        return null;
    }
}

// ============================================
// 导航功能
// ============================================

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item[data-section]');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const section = item.dataset.section;
            switchSection(section);

            // 更新活动状态
            navItems.forEach(i => i.classList.remove('active'));
            item.classList.add('active');
        });
    });
}

function switchSection(sectionName) {
    // 隐藏所有区域
    document.querySelectorAll('.content-section').forEach(section => {
        section.classList.remove('active');
    });

    // 显示目标区域
    const targetSection = document.getElementById(`section-${sectionName}`);
    if (targetSection) {
        targetSection.classList.add('active');
    }

    // 加载对应数据
    switch (sectionName) {
        case 'dashboard':
            loadDashboard();
            break;
        case 'projects':
            loadProjects();
            break;
        case 'blog':
            loadBlog();
            break;
        case 'analytics':
            loadAnalytics();
            break;
        case 'profile':
            loadProfile();
            break;
    }
}

// ============================================
// 事件监听
// ============================================

function initEventListeners() {
    // 移动端菜单
    document.getElementById('menuToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('active');
    });

    document.getElementById('sidebarToggle')?.addEventListener('click', () => {
        document.getElementById('sidebar').classList.remove('active');
    });

    // 退出登录
    document.getElementById('logoutBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('admin_token');
        localStorage.removeItem('admin_username');
        window.location.href = '/admin/login.html';
    });

    // 添加项目按钮
    document.getElementById('addProjectBtn')?.addEventListener('click', () => {
        openProjectModal();
    });

    // 添加文章按钮
    document.getElementById('addPostBtn')?.addEventListener('click', () => {
        openPostModal();
    });

    // 个人信息表单
    document.getElementById('profileForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProfile();
    });

    // 密码表单
    document.getElementById('passwordForm')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        await changePassword();
    });

    // 模态框关闭
    document.getElementById('modalClose')?.addEventListener('click', closeModal);
    document.getElementById('modalOverlay')?.addEventListener('click', (e) => {
        if (e.target === e.currentTarget) closeModal();
    });
}

// ============================================
// 仪表盘
// ============================================

async function loadDashboard() {
    const [projectsRes, blogRes] = await Promise.all([
        apiRequest('/api/projects'),
        apiRequest('/api/blog')
    ]);

    if (projectsRes?.success) {
        const projects = projectsRes.data;
        document.getElementById('totalProjects').textContent = projects.length;
        document.getElementById('featuredProjects').textContent = projects.filter(p => p.featured).length;
    }

    if (blogRes?.success) {
        const posts = blogRes.data;
        document.getElementById('totalPosts').textContent = posts.length;
        document.getElementById('publishedPosts').textContent = posts.filter(p => p.published !== false).length;
    }

    // 加载最近活动
    loadRecentActivity();
}

// ============================================
// 访问统计
// ============================================

async function loadAnalytics() {
    const result = await apiRequest('/api/stats');

    if (!result?.success) {
        showToast('加载统计数据失败', 'error');
        return;
    }

    const data = result.data;

    // 更新统计卡片
    document.getElementById('todayViews').textContent = data.todayViews || 0;
    document.getElementById('weeklyViews').textContent = data.weeklyViews || 0;
    document.getElementById('totalComments').textContent = data.comments || 0;

    // 渲染热门文章
    const popularPosts = document.getElementById('popularPosts');
    if (data.popularPosts && data.popularPosts.length > 0) {
        popularPosts.innerHTML = data.popularPosts.map((post, index) => `
            <div class="popular-item">
                <span class="popular-rank">${index + 1}</span>
                <span class="popular-title">${escapeHtml(post.title)}</span>
                <span class="popular-views">${post.views} 次</span>
            </div>
        `).join('');
    } else {
        popularPosts.innerHTML = '<p style="color: #666; text-align: center;">暂无数据</p>';
    }

    // 渲染最近访问
    const recentViews = document.getElementById('recentViews');
    if (data.recentViews && data.recentViews.length > 0) {
        recentViews.innerHTML = data.recentViews.map(view => `
            <div class="recent-item">
                <span class="recent-path">${escapeHtml(view.path)}</span>
                <span class="recent-time">${new Date(view.createdAt).toLocaleString('zh-CN')}</span>
            </div>
        `).join('');
    } else {
        recentViews.innerHTML = '<p style="color: #666; text-align: center;">暂无数据</p>';
    }
}

async function loadRecentActivity() {
    const activityList = document.getElementById('recentActivity');
    if (!activityList) return;

    // 获取最近的项目和文章
    const [projectsRes, blogRes] = await Promise.all([
        apiRequest('/api/projects'),
        apiRequest('/api/blog')
    ]);

    const activities = [];

    if (projectsRes?.success) {
        projectsRes.data.slice(0, 3).forEach(p => {
            activities.push({
                type: 'project',
                icon: 'fas fa-project-diagram',
                text: `项目: ${p.title}`,
                date: p.date || p.createdAt
            });
        });
    }

    if (blogRes?.success) {
        blogRes.data.slice(0, 3).forEach(p => {
            activities.push({
                type: 'blog',
                icon: 'fas fa-blog',
                text: `文章: ${p.title}`,
                date: p.date || p.createdAt
            });
        });
    }

    // 按日期排序
    activities.sort((a, b) => new Date(b.date) - new Date(a.date));

    activityList.innerHTML = activities.slice(0, 5).map(activity => `
        <div class="activity-item">
            <div class="activity-icon edit">
                <i class="${activity.icon}"></i>
            </div>
            <span>${activity.text}</span>
            <span style="margin-left: auto; color: var(--text-muted); font-size: 0.8rem;">
                ${activity.date}
            </span>
        </div>
    `).join('');
}

// ============================================
// 项目管理
// ============================================

async function loadProjects() {
    const result = await apiRequest('/api/projects');

    if (!result?.success) {
        showToast('加载项目失败', 'error');
        return;
    }

    const tbody = document.getElementById('projectsTableBody');
    tbody.innerHTML = result.data.map(project => `
        <tr>
            <td>
                <strong>${escapeHtml(project.title)}</strong>
            </td>
            <td>
                <span class="badge badge-${getCategoryBadge(project.category)}">
                    ${getCategoryName(project.category)}
                </span>
            </td>
            <td>
                ${(project.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
            </td>
            <td>
                <span class="badge ${project.featured ? 'badge-success' : 'badge-warning'}">
                    ${project.featured ? '已上线' : '已下线'}
                </span>
            </td>
            <td>${project.date || new Date(project.createdAt).toLocaleDateString('zh-CN')}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon toggle" onclick="toggleProject('${project._id}')" title="${project.featured ? '下线' : '上线'}">
                        <i class="fas fa-${project.featured ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn-icon edit" onclick="openProjectModal('${project._id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deleteProject('${project._id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openProjectModal(projectId = null) {
    const isEdit = projectId !== null;
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? '编辑项目' : '添加项目';

    modalBody.innerHTML = `
        <form id="projectForm">
            <div class="form-group">
                <label for="projectTitle">项目名称 *</label>
                <input type="text" id="projectTitle" required placeholder="输入项目名称">
            </div>
            <div class="form-group">
                <label for="projectCategory">分类</label>
                <select id="projectCategory">
                    <option value="creative">创意编程</option>
                    <option value="web">网站项目</option>
                    <option value="tool">工具应用</option>
                    <option value="component">UI组件</option>
                </select>
            </div>
            <div class="form-group full-width">
                <label for="projectDescription">项目描述 *</label>
                <textarea id="projectDescription" rows="3" required placeholder="描述一下这个项目..."></textarea>
            </div>
            <div class="form-group">
                <label for="projectTags">标签（逗号分隔）</label>
                <input type="text" id="projectTags" placeholder="HTML, CSS, JavaScript">
            </div>
            <div class="form-group">
                <label for="projectImage">图片链接</label>
                <input type="text" id="projectImage" placeholder="图片URL">
            </div>
            <div class="form-group">
                <label for="projectGithub">GitHub 链接</label>
                <input type="url" id="projectGithub" placeholder="https://github.com/...">
            </div>
            <div class="form-group">
                <label for="projectDemo">演示链接</label>
                <input type="url" id="projectDemo" placeholder="https://...">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="projectFeatured"> 设为精选（上线展示）
                </label>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> ${isEdit ? '保存修改' : '添加项目'}
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            </div>
        </form>
    `;

    // 如果是编辑，加载数据
    if (isEdit) {
        loadProjectData(projectId);
    }

    // 表单提交
    document.getElementById('projectForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await saveProject(projectId);
    });

    openModal();
}

async function loadProjectData(projectId) {
    const result = await apiRequest(`/api/projects/${projectId}`);
    if (!result?.success) return;

    const project = result.data;
    document.getElementById('projectTitle').value = project.title || '';
    document.getElementById('projectCategory').value = project.category || 'creative';
    document.getElementById('projectDescription').value = project.description || '';
    document.getElementById('projectTags').value = (project.tags || []).join(', ');
    document.getElementById('projectImage').value = project.image || '';
    document.getElementById('projectGithub').value = project.github || '';
    document.getElementById('projectDemo').value = project.demo || '';
    document.getElementById('projectFeatured').checked = project.featured || false;
}

async function saveProject(projectId) {
    const data = {
        title: document.getElementById('projectTitle').value,
        category: document.getElementById('projectCategory').value,
        description: document.getElementById('projectDescription').value,
        tags: document.getElementById('projectTags').value.split(',').map(t => t.trim()).filter(t => t),
        image: document.getElementById('projectImage').value,
        github: document.getElementById('projectGithub').value,
        demo: document.getElementById('projectDemo').value,
        featured: document.getElementById('projectFeatured').checked
    };

    const isEdit = projectId !== null;
    const endpoint = isEdit ? `/api/projects/${projectId}` : '/api/projects';
    const method = isEdit ? 'PUT' : 'POST';

    const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(data)
    });

    if (result?.success) {
        showToast(isEdit ? '项目更新成功' : '项目添加成功', 'success');
        closeModal();
        loadProjects();
    } else {
        showToast(result?.message || '操作失败', 'error');
    }
}

async function toggleProject(projectId) {
    const result = await apiRequest(`/api/projects/${projectId}/toggle`, {
        method: 'PUT'
    });

    if (result?.success) {
        showToast(result.message, 'success');
        loadProjects();
    } else {
        showToast('操作失败', 'error');
    }
}

async function deleteProject(projectId) {
    if (!confirm('确定要删除这个项目吗？此操作不可恢复。')) return;

    const result = await apiRequest(`/api/projects/${projectId}`, {
        method: 'DELETE'
    });

    if (result?.success) {
        showToast('项目已删除', 'success');
        loadProjects();
    } else {
        showToast('删除失败', 'error');
    }
}

// ============================================
// 博客管理
// ============================================

async function loadBlog() {
    const result = await apiRequest('/api/blog');

    if (!result?.success) {
        showToast('加载文章失败', 'error');
        return;
    }

    const tbody = document.getElementById('blogTableBody');
    tbody.innerHTML = result.data.map(post => `
        <tr>
            <td>
                <strong>${escapeHtml(post.title)}</strong>
            </td>
            <td>
                <span class="badge badge-${getCategoryBadge(post.category)}">
                    ${getCategoryName(post.category)}
                </span>
            </td>
            <td>
                <span class="badge ${post.published !== false ? 'badge-success' : 'badge-warning'}">
                    ${post.published !== false ? '已发布' : '草稿'}
                </span>
            </td>
            <td>${post.date || new Date(post.createdAt).toLocaleDateString('zh-CN')}</td>
            <td>
                <div class="action-btns">
                    <button class="btn-icon toggle" onclick="togglePost('${post._id}')" title="${post.published !== false ? '下架' : '发布'}">
                        <i class="fas fa-${post.published !== false ? 'eye-slash' : 'eye'}"></i>
                    </button>
                    <button class="btn-icon edit" onclick="openPostModal('${post._id}')" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-icon delete" onclick="deletePost('${post._id}')" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

function openPostModal(postId = null) {
    const isEdit = postId !== null;
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = isEdit ? '编辑文章' : '添加文章';

    modalBody.innerHTML = `
        ${!isEdit ? `
        <div class="import-section" style="margin-bottom: 20px; padding: 16px; background: rgba(0, 245, 255, 0.05); border: 1px dashed rgba(0, 245, 255, 0.3); border-radius: 8px;">
            <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 12px;">
                <i class="fas fa-file-import" style="color: var(--neon-blue); font-size: 1.2rem;"></i>
                <span style="color: var(--neon-blue); font-weight: 600;">导入文档</span>
            </div>
            <div style="display: flex; gap: 12px; flex-wrap: wrap;">
                <label class="btn btn-secondary" style="cursor: pointer; margin: 0;">
                    <i class="fab fa-markdown"></i> 导入 MD 文件
                    <input type="file" accept=".md,.markdown" onchange="importMarkdown(this)" style="display: none;">
                </label>
                <label class="btn btn-secondary" style="cursor: pointer; margin: 0;">
                    <i class="fab fa-html5"></i> 导入 HTML 文件
                    <input type="file" accept=".html,.htm" onchange="importHTML(this)" style="display: none;">
                </label>
            </div>
            <p style="margin-top: 8px; font-size: 0.85rem; color: var(--text-muted);">支持 Markdown 和 HTML 格式，自动识别标题、摘要和内容</p>
        </div>
        ` : ''}
        <form id="postForm">
            <div class="form-group">
                <label for="postTitle">文章标题 *</label>
                <input type="text" id="postTitle" required placeholder="输入文章标题">
            </div>
            <div class="form-group">
                <label for="postCategory">分类</label>
                <select id="postCategory">
                    <option value="vib-coding">Vib Coding</option>
                    <option value="creative">创意编程</option>
                    <option value="tutorial">教程分享</option>
                    <option value="thoughts">技术思考</option>
                </select>
            </div>
            <div class="form-group full-width">
                <label for="postExcerpt">摘要</label>
                <textarea id="postExcerpt" rows="2" placeholder="文章摘要..."></textarea>
            </div>
            <div class="form-group full-width">
                <label for="postContent">内容 *</label>
                <textarea id="postContent" rows="8" required placeholder="文章内容..."></textarea>
            </div>
            <div class="form-group">
                <label for="postTags">标签（逗号分隔）</label>
                <input type="text" id="postTags" placeholder="Vib Coding, 创意">
            </div>
            <div class="form-group">
                <label for="postImage">封面图片链接</label>
                <input type="text" id="postImage" placeholder="图片URL">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="postPublished" checked> 立即发布
                </label>
            </div>
            <div class="form-actions">
                <button type="submit" class="btn btn-primary">
                    <i class="fas fa-save"></i> ${isEdit ? '保存修改' : '发布文章'}
                </button>
                <button type="button" class="btn btn-secondary" onclick="closeModal()">取消</button>
            </div>
        </form>
    `;

    // 如果是编辑，加载数据
    if (isEdit) {
        loadPostData(postId);
    }

    // 表单提交
    document.getElementById('postForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        await savePost(postId);
    });

    openModal();

    // 初始化拖拽导入（仅新增模式）
    if (!isEdit) {
        initDragDropImport();
    }
}

async function loadPostData(postId) {
    const result = await apiRequest(`/api/blog/${postId}`);
    if (!result?.success) return;

    const post = result.data;
    document.getElementById('postTitle').value = post.title || '';
    document.getElementById('postCategory').value = post.category || 'thoughts';
    document.getElementById('postExcerpt').value = post.excerpt || '';
    document.getElementById('postContent').value = post.content || '';
    document.getElementById('postTags').value = (post.tags || []).join(', ');
    document.getElementById('postImage').value = post.image || '';
    document.getElementById('postPublished').checked = post.published !== false;
}

async function savePost(postId) {
    const data = {
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        excerpt: document.getElementById('postExcerpt').value,
        content: document.getElementById('postContent').value,
        tags: document.getElementById('postTags').value.split(',').map(t => t.trim()).filter(t => t),
        image: document.getElementById('postImage').value,
        published: document.getElementById('postPublished').checked
    };

    const isEdit = postId !== null;
    const endpoint = isEdit ? `/api/blog/${postId}` : '/api/blog';
    const method = isEdit ? 'PUT' : 'POST';

    const result = await apiRequest(endpoint, {
        method,
        body: JSON.stringify(data)
    });

    if (result?.success) {
        showToast(isEdit ? '文章更新成功' : '文章发布成功', 'success');
        closeModal();
        loadBlog();
    } else {
        showToast(result?.message || '操作失败', 'error');
    }
}

async function togglePost(postId) {
    const result = await apiRequest(`/api/blog/${postId}/publish`, {
        method: 'PUT'
    });

    if (result?.success) {
        showToast(result.message, 'success');
        loadBlog();
    } else {
        showToast('操作失败', 'error');
    }
}

async function deletePost(postId) {
    if (!confirm('确定要删除这篇文章吗？此操作不可恢复。')) return;

    const result = await apiRequest(`/api/blog/${postId}`, {
        method: 'DELETE'
    });

    if (result?.success) {
        showToast('文章已删除', 'success');
        loadBlog();
    } else {
        showToast('删除失败', 'error');
    }
}

// ============================================
// 个人信息
// ============================================

async function loadProfile() {
    const result = await apiRequest('/api/profile');

    if (!result?.success) {
        showToast('加载个人信息失败', 'error');
        return;
    }

    const profile = result.data;
    document.getElementById('profileName').value = profile.name || '';
    document.getElementById('profileTitle').value = profile.title || '';
    document.getElementById('profileBio').value = profile.bio || '';
    document.getElementById('profileLocation').value = profile.location || '';
    document.getElementById('profileEmail').value = profile.email || '';
    document.getElementById('profileTwitter').value = profile.social?.twitter || profile.twitter || '';
    document.getElementById('profileGithub').value = profile.social?.github || profile.github || '';
    document.getElementById('profileLinkedin').value = profile.social?.linkedin || profile.linkedin || '';
    document.getElementById('profileSkills').value = (profile.skills || []).join(', ');
}

async function saveProfile() {
    const data = {
        name: document.getElementById('profileName').value,
        title: document.getElementById('profileTitle').value,
        bio: document.getElementById('profileBio').value,
        location: document.getElementById('profileLocation').value,
        email: document.getElementById('profileEmail').value,
        twitter: document.getElementById('profileTwitter').value,
        github: document.getElementById('profileGithub').value,
        linkedin: document.getElementById('profileLinkedin').value,
        skills: document.getElementById('profileSkills').value.split(',').map(s => s.trim()).filter(s => s),
        social: {
            twitter: document.getElementById('profileTwitter').value,
            github: document.getElementById('profileGithub').value,
            linkedin: document.getElementById('profileLinkedin').value
        }
    };

    const result = await apiRequest('/api/profile', {
        method: 'PUT',
        body: JSON.stringify(data)
    });

    if (result?.success) {
        showToast('个人信息已更新', 'success');
    } else {
        showToast('更新失败', 'error');
    }
}

// ============================================
// 修改密码
// ============================================

async function changePassword() {
    const oldPassword = document.getElementById('oldPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
        showToast('两次输入的密码不一致', 'error');
        return;
    }

    if (newPassword.length < 6) {
        showToast('密码长度不能少于6位', 'error');
        return;
    }

    const result = await apiRequest('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword })
    });

    if (result?.success) {
        showToast('密码修改成功', 'success');
        document.getElementById('passwordForm').reset();
    } else {
        showToast(result?.message || '修改失败', 'error');
    }
}

// ============================================
// 模态框
// ============================================

function openModal() {
    document.getElementById('modalOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    document.getElementById('modalOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

// ============================================
// 提示消息
// ============================================

function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    const icon = type === 'success' ? 'fa-check-circle' :
                 type === 'error' ? 'fa-exclamation-circle' :
                 'fa-exclamation-triangle';

    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // 3秒后自动移除
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// ============================================
// 工具函数
// ============================================

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function getCategoryName(category) {
    const names = {
        'web': '网站项目',
        'creative': '创意编程',
        'tool': '工具应用',
        'component': 'UI组件',
        'vib-coding': 'Vib Coding',
        'tutorial': '教程分享',
        'thoughts': '技术思考'
    };
    return names[category] || category;
}

function getCategoryBadge(category) {
    const badges = {
        'web': 'success',
        'creative': 'warning',
        'tool': 'success',
        'component': 'warning',
        'vib-coding': 'success',
        'tutorial': 'warning',
        'thoughts': 'success'
    };
    return badges[category] || 'success';
}

// ============================================
// 文档导入功能
// ============================================

/**
 * 导入 Markdown 文件
 */
function importMarkdown(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const parsed = parseMarkdown(content);

        // 填充表单
        document.getElementById('postTitle').value = parsed.title;
        document.getElementById('postContent').value = parsed.content;
        document.getElementById('postExcerpt').value = parsed.excerpt;
        document.getElementById('postTags').value = parsed.tags.join(', ');

        // 尝试匹配分类
        const category = detectCategory(parsed.title, parsed.content, parsed.tags);
        document.getElementById('postCategory').value = category;

        showToast('Markdown 文件导入成功', 'success');
    };
    reader.readAsText(file);
    input.value = ''; // 清空input
}

/**
 * 导入 HTML 文件
 */
function importHTML(input) {
    const file = input.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        const htmlContent = e.target.result;
        const parsed = parseHTML(htmlContent);

        // 填充表单
        document.getElementById('postTitle').value = parsed.title;
        document.getElementById('postContent').value = parsed.content;
        document.getElementById('postExcerpt').value = parsed.excerpt;
        document.getElementById('postTags').value = parsed.tags.join(', ');

        // 尝试匹配分类
        const category = detectCategory(parsed.title, parsed.content, parsed.tags);
        document.getElementById('postCategory').value = category;

        showToast('HTML 文件导入成功', 'success');
    };
    reader.readAsText(file);
    input.value = ''; // 清空input
}

/**
 * 解析 Markdown 内容
 */
function parseMarkdown(content) {
    let title = '';
    let excerpt = '';
    let tags = [];
    let bodyContent = content;

    // 提取标题（第一个 # 标题）
    const titleMatch = content.match(/^#\s+(.+)$/m);
    if (titleMatch) {
        title = titleMatch[1].trim();
    }

    // 提取 YAML front matter（如果存在）
    const frontMatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
    if (frontMatterMatch) {
        const frontMatter = frontMatterMatch[1];

        // 提取 title
        const fmTitle = frontMatter.match(/title:\s*["']?(.+?)["']?\s*$/m);
        if (fmTitle) title = fmTitle[1].trim();

        // 提取 tags
        const fmTags = frontMatter.match(/tags:\s*\n((?:\s*-\s*.+\n?)+)/);
        if (fmTags) {
            tags = fmTags[1].match(/-\s*(.+)/g).map(t => t.replace(/-\s*/, '').trim());
        }

        // 提取 description/excerpt
        const fmExcerpt = frontMatter.match(/(?:description|excerpt|summary):\s*["']?(.+?)["']?\s*$/m);
        if (fmExcerpt) excerpt = fmExcerpt[1].trim();

        // 移除 front matter
        bodyContent = content.replace(frontMatterMatch[0], '').trim();
    }

    // 如果没有从 front matter 提取到标题，使用第一个标题
    if (!title) {
        const h1Match = bodyContent.match(/^#\s+(.+)$/m);
        if (h1Match) {
            title = h1Match[1].trim();
        }
    }

    // 自动生成摘要（如果没有）
    if (!excerpt) {
        // 移除 Markdown 标记，取前200个字符
        const plainText = bodyContent
            .replace(/^#{1,6}\s+.+$/gm, '') // 移除标题
            .replace(/[*_~`]/g, '') // 移除格式标记
            .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // 提取链接文字
            .replace(/!\[([^\]]*)\]\([^)]+\)/g, '') // 移除图片
            .replace(/\n+/g, ' ') // 换行变空格
            .trim();

        excerpt = plainText.substring(0, 200);
        if (plainText.length > 200) excerpt += '...';
    }

    // 自动提取标签（从内容中的代码块标记、技术关键词）
    if (tags.length === 0) {
        const techKeywords = [
            'JavaScript', 'TypeScript', 'Python', 'React', 'Vue', 'Angular',
            'Node.js', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL',
            'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind',
            'Git', 'Docker', 'AWS', 'Linux', 'API',
            '前端', '后端', '全栈', '数据库', '教程'
        ];

        const contentLower = (title + ' ' + bodyContent).toLowerCase();
        techKeywords.forEach(keyword => {
            if (contentLower.includes(keyword.toLowerCase())) {
                tags.push(keyword);
            }
        });

        // 限制标签数量
        tags = tags.slice(0, 5);
    }

    return {
        title: title,
        content: bodyContent,
        excerpt: excerpt,
        tags: tags
    };
}

/**
 * 解析 HTML 内容
 */
function parseHTML(htmlContent) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, 'text/html');

    let title = '';
    let excerpt = '';
    let tags = [];

    // 提取标题
    const h1 = doc.querySelector('h1');
    if (h1) {
        title = h1.textContent.trim();
    } else {
        const titleTag = doc.querySelector('title');
        if (titleTag) title = titleTag.textContent.trim();
    }

    // 提取 meta description
    const metaDesc = doc.querySelector('meta[name="description"]');
    if (metaDesc) {
        excerpt = metaDesc.getAttribute('content') || '';
    }

    // 提取正文内容
    const article = doc.querySelector('article') || doc.querySelector('.content') || doc.querySelector('.post') || doc.body;

    // 转换为 Markdown 格式
    let content = htmlToMarkdown(article);

    // 如果没有摘要，从内容生成
    if (!excerpt) {
        const plainText = article.textContent.trim();
        excerpt = plainText.substring(0, 200);
        if (plainText.length > 200) excerpt += '...';
    }

    // 提取标签（从 keywords meta 或文章中的技术词汇）
    const metaKeywords = doc.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
        tags = metaKeywords.getAttribute('content').split(',').map(t => t.trim()).filter(t => t);
    }

    if (tags.length === 0) {
        const techKeywords = [
            'JavaScript', 'TypeScript', 'Python', 'React', 'Vue', 'Angular',
            'Node.js', 'Express', 'MongoDB', 'MySQL', 'PostgreSQL',
            'HTML', 'CSS', 'SASS', 'LESS', 'Tailwind',
            'Git', 'Docker', 'AWS', 'Linux', 'API',
            '前端', '后端', '全栈', '数据库', '教程'
        ];

        const contentLower = (title + ' ' + article.textContent).toLowerCase();
        techKeywords.forEach(keyword => {
            if (contentLower.includes(keyword.toLowerCase())) {
                tags.push(keyword);
            }
        });

        tags = tags.slice(0, 5);
    }

    return {
        title: title,
        content: content,
        excerpt: excerpt,
        tags: tags
    };
}

/**
 * 简单的 HTML 转 Markdown
 */
function htmlToMarkdown(element) {
    let markdown = '';

    function processNode(node) {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.textContent;
        }

        if (node.nodeType !== Node.ELEMENT_NODE) return '';

        const tag = node.tagName.toLowerCase();
        let content = '';

        // 处理子节点
        for (const child of node.childNodes) {
            content += processNode(child);
        }

        switch (tag) {
            case 'h1': return `\n# ${content.trim()}\n\n`;
            case 'h2': return `\n## ${content.trim()}\n\n`;
            case 'h3': return `\n### ${content.trim()}\n\n`;
            case 'h4': return `\n#### ${content.trim()}\n\n`;
            case 'h5': return `\n##### ${content.trim()}\n\n`;
            case 'h6': return `\n###### ${content.trim()}\n\n`;
            case 'p': return `\n${content.trim()}\n\n`;
            case 'br': return '\n';
            case 'strong':
            case 'b': return `**${content.trim()}**`;
            case 'em':
            case 'i': return `*${content.trim()}*`;
            case 'code': return `\`${content.trim()}\``;
            case 'pre':
                const code = node.querySelector('code');
                const lang = code ? code.className.replace('language-', '') : '';
                return `\n\`\`\`${lang}\n${content.trim()}\n\`\`\`\n\n`;
            case 'a':
                const href = node.getAttribute('href') || '';
                return `[${content.trim()}](${href})`;
            case 'img':
                const src = node.getAttribute('src') || '';
                const alt = node.getAttribute('alt') || '';
                return `![${alt}](${src})`;
            case 'ul':
                return '\n' + Array.from(node.querySelectorAll(':scope > li')).map(li => `- ${li.textContent.trim()}`).join('\n') + '\n\n';
            case 'ol':
                return '\n' + Array.from(node.querySelectorAll(':scope > li')).map((li, i) => `${i + 1}. ${li.textContent.trim()}`).join('\n') + '\n\n';
            case 'li': return content;
            case 'blockquote': return `\n> ${content.trim()}\n\n`;
            case 'hr': return '\n---\n\n';
            case 'div':
            case 'section':
            case 'article': return content;
            default: return content;
        }
    }

    markdown = processNode(element);

    // 清理多余的空行
    markdown = markdown.replace(/\n{3,}/g, '\n\n').trim();

    return markdown;
}

/**
 * 根据内容自动检测分类
 */
function detectCategory(title, content, tags) {
    const text = (title + ' ' + content + ' ' + tags.join(' ')).toLowerCase();

    // 教程类关键词
    if (text.includes('教程') || text.includes('入门') || text.includes('指南') ||
        text.includes('tutorial') || text.includes('guide') || text.includes('学习') ||
        text.includes('如何') || text.includes('怎么')) {
        return 'tutorial';
    }

    // 创意编程关键词
    if (text.includes('创意') || text.includes('艺术') || text.includes('动画') ||
        text.includes('creative') || text.includes('art') || text.includes('animation') ||
        text.includes('canvas') || text.includes('webgl') || text.includes('p5.js')) {
        return 'creative';
    }

    // Vib Coding 关键词
    if (text.includes('vib') || text.includes('赛博朋克') || text.includes('cyberpunk') ||
        text.includes('霓虹') || text.includes('故障艺术')) {
        return 'vib-coding';
    }

    // 默认技术思考
    return 'thoughts';
}

// ============================================
// 拖拽导入功能
// ============================================

/**
 * 初始化拖拽导入
 */
function initDragDropImport() {
    const importSection = document.querySelector('.import-section');
    if (!importSection) return;

    // 阻止默认行为
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        importSection.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // 高亮效果
    ['dragenter', 'dragover'].forEach(eventName => {
        importSection.addEventListener(eventName, () => {
            importSection.style.borderColor = 'var(--neon-blue)';
            importSection.style.background = 'rgba(0, 245, 255, 0.1)';
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        importSection.addEventListener(eventName, () => {
            importSection.style.borderColor = 'rgba(0, 245, 255, 0.3)';
            importSection.style.background = 'rgba(0, 245, 255, 0.05)';
        }, false);
    });

    // 处理拖拽文件
    importSection.addEventListener('drop', handleDrop, false);

    function handleDrop(e) {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    }

    // 处理文件
    function handleFile(file) {
        const ext = file.name.split('.').pop().toLowerCase();

        if (['md', 'markdown'].includes(ext)) {
            // Markdown 文件
            const reader = new FileReader();
            reader.onload = function(e) {
                const content = e.target.result;
                const parsed = parseMarkdown(content);
                fillForm(parsed);
                showToast('Markdown 文件导入成功', 'success');
            };
            reader.readAsText(file);
        } else if (['html', 'htm'].includes(ext)) {
            // HTML 文件
            const reader = new FileReader();
            reader.onload = function(e) {
                const htmlContent = e.target.result;
                const parsed = parseHTML(htmlContent);
                fillForm(parsed);
                showToast('HTML 文件导入成功', 'success');
            };
            reader.readAsText(file);
        } else {
            showToast('不支持的文件格式，请使用 .md 或 .html 文件', 'error');
        }
    }

    // 填充表单
    function fillForm(parsed) {
        document.getElementById('postTitle').value = parsed.title;
        document.getElementById('postContent').value = parsed.content;
        document.getElementById('postExcerpt').value = parsed.excerpt;
        document.getElementById('postTags').value = parsed.tags.join(', ');

        const category = detectCategory(parsed.title, parsed.content, parsed.tags);
        document.getElementById('postCategory').value = category;
    }
}
