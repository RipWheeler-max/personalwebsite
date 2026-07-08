/**
 * 项目展示脚本 - 从 API 获取数据
 */

document.addEventListener('DOMContentLoaded', () => {
    initProjects();
});

async function initProjects() {
    try {
        const projects = await getProjects();

        // 渲染项目卡片
        renderProjects(projects);

        // 初始化筛选功能
        initFilters();

        // 初始化项目详情
        initProjectDetails();

    } catch (error) {
        console.error('加载项目失败:', error);
        showErrorState();
    }
}

function renderProjects(projects) {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = '';

    if (projects.length === 0) {
        projectsGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-folder-open"></i>
                <h3>暂无项目</h3>
                <p>项目正在加载中...</p>
            </div>
        `;
        return;
    }

    projects.forEach((project, index) => {
        const card = createProjectCard(project, index);
        projectsGrid.appendChild(card);

        setTimeout(() => {
            card.classList.add('visible');
        }, index * 100);
    });
}

function createProjectCard(project, index) {
    const card = document.createElement('div');
    card.className = `project-card fade-in ${project.featured ? 'featured' : ''}`;
    card.setAttribute('data-category', project.category);
    card.setAttribute('data-id', project._id);

    const date = new Date(project.createdAt || project.date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const tagsHTML = (project.tags || []).map(tag =>
        `<span class="tag">${escapeHtml(tag)}</span>`
    ).join('');

    // 图片优先：有图片用图片，没图片用艺术字
    let headerHTML;
    if (project.image && project.image !== '#') {
        headerHTML = `
            <div class="card-image">
                <img src="${project.image}" alt="${escapeHtml(project.title)}" loading="lazy">
            </div>
        `;
    } else if (typeof ArtTextGenerator !== 'undefined') {
        headerHTML = `<div class="card-header-art">${ArtTextGenerator.generate(project.title, index)}</div>`;
    } else {
        headerHTML = `<div class="card-image-placeholder"><span>${escapeHtml(project.title)}</span></div>`;
    }

    card.innerHTML = `
        ${headerHTML}
        <div class="card-overlay">
            <span class="category-badge">${getCategoryName(project.category)}</span>
            ${project.featured ? '<span class="featured-badge">精选</span>' : ''}
        </div>
        <div class="card-content">
            <h3 class="card-title">${escapeHtml(project.title)}</h3>
            <p class="card-description">${escapeHtml(project.description)}</p>
            <div class="card-tags">${tagsHTML}</div>
            <div class="card-meta">
                <span class="date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formattedDate}
                </span>
                <div class="card-links">
                    ${project.github && project.github !== '#' ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="card-link github" title="GitHub">
                        <i class="fab fa-github"></i>
                    </a>` : ''}
                    ${project.demo && project.demo !== '#' ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="card-link demo" title="在线演示">
                        <i class="fas fa-external-link-alt"></i>
                    </a>` : ''}
                </div>
            </div>
        </div>
    `;

    card.addEventListener('click', (e) => {
        if (e.target.closest('.card-link')) return;
        openProjectDetails(project);
    });

    return card;
}

function getCategoryName(categoryId) {
    const categoryNames = {
        'web': '网站项目',
        'creative': '创意编程',
        'tool': '工具应用',
        'component': 'UI组件'
    };
    return categoryNames[categoryId] || categoryId;
}

function initFilters() {
    const filterContainer = document.querySelector('.project-filters');
    if (!filterContainer) return;

    const categories = [
        { id: 'all', name: '全部', icon: '' },
        { id: 'web', name: '网站项目', icon: 'fas fa-globe' },
        { id: 'creative', name: '创意编程', icon: 'fas fa-paint-brush' },
        { id: 'tool', name: '工具应用', icon: 'fas fa-tools' },
        { id: 'component', name: 'UI组件', icon: 'fas fa-puzzle-piece' }
    ];

    filterContainer.innerHTML = categories.map(cat => `
        <button class="filter-btn ${cat.id === 'all' ? 'active' : ''}" data-filter="${cat.id}">
            ${cat.icon ? `<i class="${cat.icon}"></i>` : ''}
            <span>${cat.name}</span>
        </button>
    `).join('');

    filterContainer.addEventListener('click', (e) => {
        const filterBtn = e.target.closest('.filter-btn');
        if (!filterBtn) return;

        filterContainer.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        filterBtn.classList.add('active');

        const filter = filterBtn.getAttribute('data-filter');
        filterProjects(filter);
    });
}

function filterProjects(filter) {
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        const category = card.getAttribute('data-category');

        if (filter === 'all' || category === filter) {
            card.style.display = 'block';
            setTimeout(() => {
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.display = 'none';
            }, 300);
        }
    });
}

function initProjectDetails() {
    const modal = document.querySelector('.project-modal');
    if (!modal) return;

    modal.querySelector('.modal-close')?.addEventListener('click', () => {
        closeModal();
    });

    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeModal();
        }
    });
}

function openProjectDetails(project) {
    const modal = document.querySelector('.project-modal');
    if (!modal) return;

    const modalBody = modal.querySelector('.modal-body');

    const date = new Date(project.createdAt || project.date);
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    const tagsHTML = (project.tags || []).map(tag =>
        `<span class="tag">${escapeHtml(tag)}</span>`
    ).join('');

    modalBody.innerHTML = `
        <div class="modal-header">
            <h2 class="modal-title">${escapeHtml(project.title)}</h2>
            <div class="modal-meta">
                <span class="category-badge">${getCategoryName(project.category)}</span>
                <span class="date">
                    <i class="fas fa-calendar-alt"></i>
                    ${formattedDate}
                </span>
                ${project.featured ? '<span class="featured-badge">精选项目</span>' : ''}
            </div>
        </div>
        <div class="modal-image">
            <img src="${project.image || 'data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 800 400%22><rect fill=%22%231a1a2e%22 width=%22800%22 height=%22400%22/><text fill=%22%2300f5ff%22 font-family=%22monospace%22 font-size=%2230%22 x=%22400%22 y=%22200%22 text-anchor=%22middle%22>Project Preview</text></svg>'}" alt="${escapeHtml(project.title)}">
        </div>
        <div class="modal-description">
            <h3>项目描述</h3>
            <p>${escapeHtml(project.description)}</p>
        </div>
        <div class="modal-tags">
            <h3>技术栈</h3>
            <div class="tags-container">${tagsHTML}</div>
        </div>
        <div class="modal-actions">
            ${project.github && project.github !== '#' ? `<a href="${project.github}" target="_blank" rel="noopener noreferrer" class="cyber-btn primary">
                <i class="fab fa-github"></i>
                <span>查看源码</span>
            </a>` : ''}
            ${project.demo && project.demo !== '#' ? `<a href="${project.demo}" target="_blank" rel="noopener noreferrer" class="cyber-btn secondary">
                <i class="fas fa-external-link-alt"></i>
                <span>在线演示</span>
            </a>` : ''}
        </div>
    `;

    // 重新绑定关闭按钮事件
    const closeBtn = modal.querySelector('.modal-close');
    if (closeBtn) {
        closeBtn.onclick = () => closeModal();
    }

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.querySelector('.project-modal');
    if (modal) {
        modal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

function showErrorState() {
    const projectsGrid = document.querySelector('.projects-grid');
    if (!projectsGrid) return;

    projectsGrid.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>加载失败</h3>
            <p>无法加载项目数据，请稍后重试。</p>
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
