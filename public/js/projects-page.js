/**
 * 作品集页面脚本 - 从 API 获取数据
 */

document.addEventListener('DOMContentLoaded', () => {
    initProjectsPage();
});

async function initProjectsPage() {
    try {
        initViewToggle();
        await updateProjectStats();
    } catch (error) {
        console.error('初始化作品集页面失败:', error);
    }
}

function initViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const projectsGrid = document.querySelector('.projects-grid');

    if (!viewBtns.length || !projectsGrid) return;

    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            viewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const view = btn.getAttribute('data-view');

            if (view === 'list') {
                projectsGrid.classList.add('list-view');
            } else {
                projectsGrid.classList.remove('list-view');
            }

            localStorage.setItem('projects-view', view);
        });
    });

    const savedView = localStorage.getItem('projects-view');
    if (savedView) {
        const targetBtn = document.querySelector(`[data-view="${savedView}"]`);
        if (targetBtn) {
            targetBtn.click();
        }
    }
}

async function updateProjectStats() {
    try {
        const projects = await getProjects();

        // 更新总项目数
        const totalProjectsEl = document.getElementById('totalProjects');
        if (totalProjectsEl) {
            animateNumber(totalProjectsEl, projects.length);
        }

        // 更新精选项目数
        const featuredProjectsEl = document.getElementById('featuredProjects');
        if (featuredProjectsEl) {
            const featuredCount = projects.filter(p => p.featured).length;
            animateNumber(featuredProjectsEl, featuredCount);
        }

        // 更新技术栈数量
        const totalTechnologiesEl = document.getElementById('totalTechnologies');
        if (totalTechnologiesEl) {
            const allTags = new Set();
            projects.forEach(project => {
                (project.tags || []).forEach(tag => allTags.add(tag));
            });
            animateNumber(totalTechnologiesEl, allTags.size);
        }

        // 更新最近更新时间
        const lastUpdateEl = document.getElementById('lastUpdate');
        if (lastUpdateEl && projects.length > 0) {
            const dates = projects.map(p => new Date(p.date));
            const latestDate = new Date(Math.max(...dates));
            const formattedDate = `${latestDate.getMonth() + 1}/${latestDate.getDate()}`;
            lastUpdateEl.textContent = formattedDate;
        }

    } catch (error) {
        console.error('更新项目统计失败:', error);
    }
}

function animateNumber(element, target) {
    const duration = 1000;
    const start = 0;
    const startTime = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        const current = Math.floor(start + (target - start) * easeOutQuart);

        element.textContent = current;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}
