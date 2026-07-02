/**
 * API 请求封装
 * 前端展示端使用
 */

// 自动检测 API 基础路径
const API_BASE = window.location.origin;

/**
 * 通用 API 请求
 */
async function fetchAPI(endpoint) {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`);
        const data = await response.json();

        if (data.success) {
            return data.data;
        } else {
            console.error('API 错误:', data.message);
            return null;
        }
    } catch (error) {
        console.error('请求失败:', error);
        return null;
    }
}

/**
 * 获取所有项目
 */
async function getProjects() {
    return await fetchAPI('/api/projects') || [];
}

/**
 * 获取所有文章
 */
async function getBlogPosts() {
    return await fetchAPI('/api/blog') || [];
}

/**
 * 获取个人信息
 */
async function getProfile() {
    return await fetchAPI('/api/profile');
}

/**
 * 获取单个项目
 */
async function getProject(id) {
    return await fetchAPI(`/api/projects/${id}`);
}

/**
 * 获取单篇文章
 */
async function getBlogPost(id) {
    return await fetchAPI(`/api/blog/${id}`);
}

/**
 * 记录页面访问
 */
async function recordView(path, postId = null) {
    try {
        await fetch(`${API_BASE}/api/view`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ path, postId })
        });
    } catch (error) {
        // 静默失败
    }
}

/**
 * 获取文章评论
 */
async function getComments(postId) {
    return await fetchAPI(`/api/comments/${postId}`) || [];
}

/**
 * 添加评论
 */
async function addComment(postId, nickname, email, content, parentId = null) {
    try {
        const response = await fetch(`${API_BASE}/api/comments`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ postId, nickname, email, content, parentId })
        });
        return await response.json();
    } catch (error) {
        console.error('添加评论失败:', error);
        return { success: false, message: '网络错误' };
    }
}
