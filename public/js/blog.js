/**
 * 博客页面脚本 - 从 API 获取数据
 */

document.addEventListener('DOMContentLoaded', () => {
    initBlog();
});

async function initBlog() {
    try {
        const posts = await getBlogPosts();

        // 只显示已发布的文章
        const publishedPosts = posts.filter(p => p.published !== false);

        // 渲染文章列表
        renderBlogPosts(publishedPosts);

        // 更新分类计数
        updateCategoryCounts(publishedPosts);

        // 渲染标签云
        renderTagsCloud(publishedPosts);

        // 渲染最新文章
        renderRecentPosts(publishedPosts);

        // 初始化搜索功能
        initBlogSearch(publishedPosts);

        // 初始化分类筛选
        initCategoryFilters(publishedPosts);

    } catch (error) {
        console.error('初始化博客失败:', error);
        showBlogError();
    }
}

function renderBlogPosts(posts) {
    const blogPosts = document.querySelector('.blog-posts');
    if (!blogPosts) return;

    blogPosts.innerHTML = '';

    if (posts.length === 0) {
        blogPosts.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-edit"></i>
                <h3>暂无文章</h3>
                <p>博客文章正在准备中...</p>
            </div>
        `;
        return;
    }

    posts.forEach((post, index) => {
        const postCard = createPostCard(post, index);
        blogPosts.appendChild(postCard);

        setTimeout(() => {
            postCard.classList.add('visible');
        }, index * 100);
    });
}

function createPostCard(post, index) {
    const card = document.createElement('article');
    card.className = 'post-card fade-in';
    card.setAttribute('data-category', post.category);
    card.setAttribute('data-id', post._id);

    const date = new Date(post.date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const readTime = calculateReadTime(post.content);

    const tagsHTML = (post.tags || []).map(tag =>
        `<span class="tag">${escapeHtml(tag)}</span>`
    ).join('');

    // 图片优先：有图片用图片，没图片用艺术字
    let headerHTML;
    if (post.image && post.image !== '#' && !post.image.includes('data:image')) {
        headerHTML = `
            <div class="card-image">
                <img src="${post.image}" alt="${escapeHtml(post.title)}" loading="lazy">
            </div>
        `;
    } else if (typeof ArtTextGenerator !== 'undefined') {
        headerHTML = `<div class="card-header-art">${ArtTextGenerator.generate(post.title, index)}</div>`;
    } else {
        headerHTML = `<div class="card-image-placeholder"><span>${escapeHtml(post.title)}</span></div>`;
    }

    card.innerHTML = `
        ${headerHTML}
        <div class="card-overlay">
            <span class="card-category">${getCategoryName(post.category)}</span>
        </div>
        <div class="card-content">
            <div class="card-meta">
                <span class="card-date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formattedDate}
                </span>
                <span class="read-time">
                    <i class="fas fa-clock"></i>
                    ${readTime} 分钟阅读
                </span>
            </div>
            <h2 class="card-title">${escapeHtml(post.title)}</h2>
            <p class="card-description">${escapeHtml(post.excerpt || post.content?.substring(0, 150) + '...')}</p>
            <div class="card-footer">
                <div class="card-tags">${tagsHTML}</div>
                <span class="read-more">
                    <span>阅读全文</span>
                    <i class="fas fa-arrow-right"></i>
                </span>
            </div>
        </div>
    `;

    // 整个卡片可点击
    card.style.cursor = 'pointer';
    card.addEventListener('click', (e) => {
        // 如果点击的是链接，不处理
        if (e.target.closest('a')) return;
        openPostDetail(post._id);
    });

    return card;
}

function calculateReadTime(content) {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const words = content.split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute) || 1;
}

function getCategoryName(categoryId) {
    const categoryNames = {
        'vib-coding': 'Vib Coding',
        'creative': '创意编程',
        'tutorial': '教程分享',
        'thoughts': '技术思考'
    };
    return categoryNames[categoryId] || categoryId;
}

function updateCategoryCounts(posts) {
    const categoryCounts = {
        'all': posts.length,
        'vib-coding': 0,
        'creative': 0,
        'tutorial': 0,
        'thoughts': 0
    };

    posts.forEach(post => {
        if (categoryCounts.hasOwnProperty(post.category)) {
            categoryCounts[post.category]++;
        }
    });

    document.querySelectorAll('.category-link').forEach(link => {
        const category = link.getAttribute('data-category');
        const countElement = link.querySelector('.category-count');
        if (countElement && categoryCounts.hasOwnProperty(category)) {
            countElement.textContent = categoryCounts[category];
        }
    });
}

function renderTagsCloud(posts) {
    const tagsCloud = document.querySelector('.tags-cloud');
    if (!tagsCloud) return;

    const tagCounts = {};
    posts.forEach(post => {
        (post.tags || []).forEach(tag => {
            tagCounts[tag] = (tagCounts[tag] || 0) + 1;
        });
    });

    const sortedTags = Object.entries(tagCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10);

    const maxCount = Math.max(...sortedTags.map(([, count]) => count), 1);

    tagsCloud.innerHTML = sortedTags.map(([tag, count]) => {
        const sizeClass = count === maxCount ? 'large' :
                         count >= maxCount * 0.7 ? 'medium' : '';
        return `<span class="tag-cloud-item ${sizeClass}" data-tag="${escapeHtml(tag)}">${escapeHtml(tag)}</span>`;
    }).join('');
}

function renderRecentPosts(posts) {
    const recentPosts = document.querySelector('.recent-posts');
    if (!recentPosts) return;

    const recent = [...posts]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    recentPosts.innerHTML = recent.map(post => {
        const date = new Date(post.date);
        const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;

        return `
            <li class="recent-post-item">
                <a href="#" class="recent-post-link" onclick="openPostDetail('${post._id}'); return false;">
                    <div class="recent-post-image">
                        <img src="${post.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 60 60%22><rect fill=%22%231a1a2e%22 width=%2260%22 height=%2260%22/><text fill=%22%2300f5ff%22 font-family=%22monospace%22 font-size=%2210%22 x=%2230%22 y=%2230%22 text-anchor=%22middle%22>Post</text></svg>'}" alt="${escapeHtml(post.title)}">
                    </div>
                    <div class="recent-post-info">
                        <h4 class="recent-post-title">${escapeHtml(post.title)}</h4>
                        <span class="recent-post-date">
                            <i class="fas fa-calendar-alt"></i>
                            ${formattedDate}
                        </span>
                    </div>
                </a>
            </li>
        `;
    }).join('');
}

function initBlogSearch(posts) {
    const searchInput = document.querySelector('.search-input');
    const searchBtn = document.querySelector('.search-btn');

    if (!searchInput || !searchBtn) return;

    let searchTimeout;

    function performSearch() {
        const query = searchInput.value.trim().toLowerCase();

        if (query.length === 0) {
            renderBlogPosts(posts);
            return;
        }

        const results = posts.filter(post => {
            const titleMatch = (post.title || '').toLowerCase().includes(query);
            const excerptMatch = (post.excerpt || '').toLowerCase().includes(query);
            const tagMatch = (post.tags || []).some(tag =>
                tag.toLowerCase().includes(query)
            );
            return titleMatch || excerptMatch || tagMatch;
        });

        renderBlogPosts(results);
    }

    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(performSearch, 300);
    });

    searchBtn.addEventListener('click', performSearch);

    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            performSearch();
        }
    });
}

function initCategoryFilters(posts) {
    const categoryLinks = document.querySelectorAll('.category-link');

    categoryLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();

            categoryLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            const category = link.getAttribute('data-category');

            if (category === 'all') {
                renderBlogPosts(posts);
            } else {
                const filtered = posts.filter(post => post.category === category);
                renderBlogPosts(filtered);
            }
        });
    });
}

function openPostDetail(postId) {
    console.log('打开文章详情:', postId);

    // 记录访问
    recordView(`/blog/${postId}`, postId);

    // 获取文章和评论
    Promise.all([
        getBlogPost(postId),
        getComments(postId)
    ]).then(([post, comments]) => {
        console.log('获取到文章:', post);
        console.log('获取到评论:', comments);
        if (!post) return;

        // 简单的 Markdown 转 HTML
        const formattedContent = formatMarkdown(post.content);
        const dateStr = post.createdAt ? new Date(post.createdAt).toLocaleDateString('zh-CN') : post.date || '';

        const modal = document.createElement('div');
        modal.className = 'post-modal';
        modal.innerHTML = `
            <div class="post-modal-content">
                <button class="post-modal-close" onclick="this.closest('.post-modal').remove()">&times;</button>
                <div class="post-modal-header">
                    <h2>${escapeHtml(post.title)}</h2>
                    <div class="post-modal-meta">
                        <span class="post-category">${getCategoryName(post.category)}</span>
                        <span class="post-date"><i class="fas fa-calendar-alt"></i> ${dateStr}</span>
                        <span class="post-author"><i class="fas fa-user"></i> ${post.author || '懒家伙'}</span>
                        <span class="post-views"><i class="fas fa-eye"></i> ${post.views || 0} 次浏览</span>
                    </div>
                    <div class="post-modal-tags">
                        ${(post.tags || []).map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
                    </div>
                </div>
                <div class="post-modal-body">
                    ${formattedContent}
                </div>
                <div class="post-modal-comments">
                    <h3 class="comments-title"><i class="fas fa-comments"></i> 评论 (${comments.length})</h3>
                    <div class="comment-form" style="background: rgba(0,0,0,0.2); padding: 20px; border-radius: 12px; margin-bottom: 24px;">
                        <div class="comment-form-row" style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 12px;">
                            <input type="text" id="commentNickname" placeholder="昵称 *" required style="width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,245,255,0.2); border-radius: 8px; color: #e0e0e0; font-family: 'Fira Code', monospace; font-size: 14px; outline: none; transition: all 0.3s;">
                            <input type="email" id="commentEmail" placeholder="邮箱（可选）" style="width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,245,255,0.2); border-radius: 8px; color: #e0e0e0; font-family: 'Fira Code', monospace; font-size: 14px; outline: none; transition: all 0.3s;">
                        </div>
                        <textarea id="commentContent" placeholder="写下你的评论..." rows="3" required style="width: 100%; padding: 12px 16px; background: rgba(0,0,0,0.3); border: 1px solid rgba(0,245,255,0.2); border-radius: 8px; color: #e0e0e0; font-family: 'Fira Code', monospace; font-size: 14px; outline: none; transition: all 0.3s; resize: vertical; margin-bottom: 12px;"></textarea>
                        <div style="display: flex; justify-content: flex-end;">
                            <button class="btn btn-primary" onclick="submitComment('${post._id}')" style="padding: 10px 24px; background: linear-gradient(135deg, #00f5ff, #8b5cf6); color: white; border: none; border-radius: 8px; cursor: pointer; font-family: 'Fira Code', monospace; font-weight: 600; transition: all 0.3s;">
                                <i class="fas fa-paper-plane"></i> 发表评论
                            </button>
                        </div>
                    </div>
                    <div class="comments-list" id="commentsList">
                        ${renderComments(comments)}
                    </div>
                </div>
            </div>
        `;

        // 添加样式
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.8);
            backdrop-filter: blur(10px);
            z-index: 2000;
            display: flex;
            align-items: flex-start;
            justify-content: center;
            padding: 20px;
            overflow-y: auto;
        `;

        const content = modal.querySelector('.post-modal-content');
        content.style.cssText = `
            background: #1a1a2e;
            border: 1px solid rgba(0, 245, 255, 0.3);
            border-radius: 16px;
            max-width: 800px;
            width: 100%;
            margin: 40px auto;
            padding: 32px;
            position: relative;
        `;

        const closeBtn = modal.querySelector('.post-modal-close');
        closeBtn.style.cssText = `
            position: absolute;
            top: 16px;
            right: 16px;
            background: none;
            border: none;
            color: #b0b0b0;
            font-size: 24px;
            cursor: pointer;
            z-index: 10;
        `;

        // 评论区样式
        const commentsSection = modal.querySelector('.post-modal-comments');
        commentsSection.style.cssText = `
            margin-top: 40px;
            padding-top: 30px;
            border-top: 1px solid rgba(0, 245, 255, 0.2);
        `;

        const commentsTitle = modal.querySelector('.comments-title');
        commentsTitle.style.cssText = `
            color: #00f5ff;
            font-family: 'Orbitron', sans-serif;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
        `;

        const commentForm = modal.querySelector('.comment-form');
        commentForm.style.cssText = `
            margin-bottom: 30px;
        `;

        const formRow = modal.querySelector('.comment-form-row');
        formRow.style.cssText = `
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            margin-bottom: 12px;
        `;

        // 设置输入框样式
        modal.querySelectorAll('input, textarea').forEach(el => {
            el.style.cssText = `
                width: 100%;
                padding: 12px 16px;
                background: rgba(0, 0, 0, 0.3);
                border: 1px solid rgba(0, 245, 255, 0.2);
                border-radius: 8px;
                color: #e0e0e0;
                font-family: 'Fira Code', monospace;
                font-size: 14px;
                outline: none;
                transition: border-color 0.3s;
            `;
        });

        const submitBtn = modal.querySelector('.comment-form .btn');
        submitBtn.style.cssText = `
            margin-top: 12px;
            padding: 10px 24px;
            background: linear-gradient(135deg, #00f5ff, #8b5cf6);
            color: white;
            border: none;
            border-radius: 8px;
            cursor: pointer;
            font-family: 'Fira Code', monospace;
            font-weight: 600;
        `;

        document.body.appendChild(modal);

        // 关闭按钮事件
        closeBtn.addEventListener('click', () => modal.remove());

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.remove();
            }
        });
    });
}

// 渲染评论列表
function renderComments(comments) {
    if (!comments || comments.length === 0) {
        return '<p style="color: #666; text-align: center; padding: 20px;">暂无评论，快来发表第一条吧！</p>';
    }

    // 检查是否是管理员
    const isAdmin = !!localStorage.getItem('admin_token');

    return comments.map(comment => {
        const date = new Date(comment.createdAt).toLocaleString('zh-CN');
        const initial = comment.nickname.charAt(0).toUpperCase();

        return `
            <div class="comment-item" style="display: flex; gap: 16px; padding: 16px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                <div class="comment-avatar" style="width: 40px; height: 40px; border-radius: 50%; background: ${comment.avatar || '#00f5ff'}; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; flex-shrink: 0;">
                    ${initial}
                </div>
                <div class="comment-body" style="flex: 1;">
                    <div class="comment-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span class="comment-nickname" style="color: #00f5ff; font-weight: 600;">${escapeHtml(comment.nickname)}</span>
                        <div style="display: flex; align-items: center; gap: 12px;">
                            <span class="comment-date" style="color: #666; font-size: 12px;">${date}</span>
                            ${isAdmin ? `<button onclick="deleteComment('${comment._id}', '${comment.postId}')" style="background: rgba(255,0,100,0.2); border: 1px solid rgba(255,0,100,0.5); color: #ff6b6b; padding: 4px 8px; border-radius: 4px; cursor: pointer; font-size: 12px;" title="删除评论"><i class="fas fa-trash"></i></button>` : ''}
                        </div>
                    </div>
                    <div class="comment-content" style="color: #e0e0e0; line-height: 1.6;">
                        ${escapeHtml(comment.content)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// 提交评论
async function submitComment(postId) {
    const nickname = document.getElementById('commentNickname').value.trim();
    const email = document.getElementById('commentEmail').value.trim();
    const content = document.getElementById('commentContent').value.trim();

    if (!nickname || !content) {
        showToast('请填写昵称和评论内容', 'error');
        return;
    }

    const result = await addComment(postId, nickname, email, content);

    if (result.success) {
        showToast('评论发表成功', 'success');
        // 刷新评论列表
        const comments = await getComments(postId);
        document.getElementById('commentsList').innerHTML = renderComments(comments);
        // 清空表单
        document.getElementById('commentContent').value = '';
    } else {
        showToast(result.message || '评论发表失败', 'error');
    }
}

// 删除评论（管理员功能）
async function deleteComment(commentId, postId) {
    if (!confirm('确定要删除这条评论吗？')) return;

    const token = localStorage.getItem('admin_token');
    if (!token) {
        showToast('请先登录管理后台', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/comments/${commentId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (result.success) {
            showToast('评论已删除', 'success');
            // 刷新评论列表
            const comments = await getComments(postId);
            document.getElementById('commentsList').innerHTML = renderComments(comments);
        } else {
            showToast(result.message || '删除失败', 'error');
        }
    } catch (error) {
        showToast('删除失败', 'error');
    }
}

// 显示提示
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: ${type === 'success' ? '#00ff41' : type === 'error' ? '#ff00ff' : '#00f5ff'};
        color: #000;
        border-radius: 8px;
        font-weight: 600;
        z-index: 3000;
        animation: slideIn 0.3s ease;
    `;
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * 简单的 Markdown 转 HTML
 */
function formatMarkdown(text) {
    if (!text) return '';

    let html = escapeHtml(text);

    // 标题
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // 粗体和斜体
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // 代码块
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code class="language-$1">$2</code></pre>');
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // 列表
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // 链接
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');

    // 段落
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';

    // 清理空段落
    html = html.replace(/<p>\s*<\/p>/g, '');
    html = html.replace(/<p>\s*(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)\s*<\/p>/g, '$1');
    html = html.replace(/<p>\s*(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)\s*<\/p>/g, '$1');

    return html;
}

function showBlogError() {
    const blogPosts = document.querySelector('.blog-posts');
    if (!blogPosts) return;

    blogPosts.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>加载失败</h3>
            <p>无法加载博客文章，请稍后重试。</p>
            <button class="cyber-btn primary" onclick="location.reload()">
                <i class="fas fa-refresh"></i>
                <span>重新加载</span>
            </button>
        </div>
    `;
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}
