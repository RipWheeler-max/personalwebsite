/**
 * 主脚本文件 - 赛博朋克个人博客
 * 处理导航、主题切换、动画初始化等
 */

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    initNavigation();
    initThemeToggle();
    initScrollAnimations();
    initTypewriterEffect();
    initParticleEffect();
    initMobileMenu();
});

/**
 * 初始化导航功能
 */
function initNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';

    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage) {
            link.classList.add('active');
        }

        // 平滑滚动到锚点
        link.addEventListener('click', (e) => {
            if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });

    // 滚动时更新导航状态
    window.addEventListener('scroll', () => {
        const scrollPosition = window.scrollY;
        const header = document.querySelector('.cyber-nav');

        if (scrollPosition > 50) {
            header.style.background = 'rgba(10, 10, 15, 0.95)';
            header.style.boxShadow = '0 0 20px rgba(0, 245, 255, 0.2)';
        } else {
            header.style.background = 'rgba(10, 10, 15, 0.9)';
            header.style.boxShadow = 'var(--shadow-neon)';
        }
    });
}

/**
 * 初始化主题切换
 */
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    if (!themeToggle) return;

    // 检查本地存储的主题偏好
    const savedTheme = localStorage.getItem('cyberpunk-theme');
    if (savedTheme) {
        document.documentElement.setAttribute('data-theme', savedTheme);
    }

    themeToggle.addEventListener('click', () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';

        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('cyberpunk-theme', newTheme);

        // 添加切换动画
        themeToggle.style.transform = 'rotate(180deg)';
        setTimeout(() => {
            themeToggle.style.transform = 'rotate(0deg)';
        }, 300);
    });
}

/**
 * 初始化滚动动画
 */
function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');

                // 为子元素添加延迟动画
                const children = entry.target.querySelectorAll('.fade-in');
                children.forEach((child, index) => {
                    child.style.transitionDelay = `${index * 0.1}s`;
                    child.classList.add('visible');
                });
            }
        });
    }, observerOptions);

    // 观察所有需要动画的元素
    document.querySelectorAll('.fade-in, .hero-text, .hero-visual, .social-card, .project-card, .tech-item').forEach(el => {
        el.classList.add('fade-in');
        observer.observe(el);
    });
}

/**
 * 初始化打字机效果
 */
function initTypewriterEffect() {
    const typewriterElements = document.querySelectorAll('.typewriter');

    typewriterElements.forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.width = '0';

        let i = 0;
        const speed = 50; // 打字速度（毫秒）

        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            } else {
                // 添加闪烁光标
                element.style.borderRight = '2px solid var(--neon-blue)';
                setInterval(() => {
                    element.style.borderRight = element.style.borderRight === '2px solid transparent'
                        ? '2px solid var(--neon-blue)'
                        : '2px solid transparent';
                }, 530);
            }
        }

        // 延迟开始打字
        setTimeout(type, 1000);
    });
}

/**
 * 初始化粒子效果
 */
function initParticleEffect() {
    const container = document.querySelector('.particles-container');
    if (!container) return;

    // 创建粒子
    function createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // 随机位置和属性
        const x = Math.random() * 100;
        const delay = Math.random() * 10;
        const duration = 10 + Math.random() * 20;
        const size = 1 + Math.random() * 3;

        particle.style.left = `${x}%`;
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.animationDelay = `${delay}s`;
        particle.style.animationDuration = `${duration}s`;

        // 随机颜色
        const colors = ['var(--neon-blue)', 'var(--neon-pink)', 'var(--neon-green)'];
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];

        container.appendChild(particle);

        // 动画结束后移除粒子
        particle.addEventListener('animationend', () => {
            particle.remove();
        });
    }

    // 初始创建粒子
    for (let i = 0; i < 20; i++) {
        createParticle();
    }

    // 持续创建粒子
    setInterval(createParticle, 2000);
}

/**
 * 初始化移动端菜单
 */
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenu');
    const navLinks = document.querySelector('.nav-links');

    if (!mobileMenuBtn || !navLinks) return;

    mobileMenuBtn.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        mobileMenuBtn.classList.toggle('active');

        // 更新按钮图标
        const icon = mobileMenuBtn.querySelector('i');
        if (navLinks.classList.contains('active')) {
            icon.className = 'fas fa-times';
        } else {
            icon.className = 'fas fa-bars';
        }
    });

    // 点击链接后关闭菜单
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('active');
            mobileMenuBtn.classList.remove('active');
            const icon = mobileMenuBtn.querySelector('i');
            icon.className = 'fas fa-bars';
        });
    });
}

/**
 * 添加赛博朋克效果到元素
 * @param {HTMLElement} element - 要添加效果的元素
 * @param {string} effect - 效果类型
 */
function addCyberEffect(element, effect) {
    switch (effect) {
        case 'glitch':
            element.classList.add('glitch');
            element.setAttribute('data-text', element.textContent);
            break;
        case 'neon':
            element.classList.add('neon-border');
            break;
        case 'pulse':
            element.classList.add('pulse');
            break;
        case 'hologram':
            element.classList.add('hologram');
            break;
        case 'flicker':
            element.classList.add('neon-flicker');
            break;
    }
}

/**
 * 创建霓虹灯边框效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function createNeonBorder(element) {
    const border = document.createElement('div');
    border.className = 'neon-border-effect';
    border.style.cssText = `
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        background: linear-gradient(45deg, var(--neon-blue), var(--neon-pink), var(--neon-green));
        border-radius: inherit;
        z-index: -1;
        opacity: 0;
        transition: opacity 0.3s ease;
        filter: blur(5px);
    `;

    element.style.position = 'relative';
    element.appendChild(border);

    element.addEventListener('mouseenter', () => {
        border.style.opacity = '1';
    });

    element.addEventListener('mouseleave', () => {
        border.style.opacity = '0';
    });
}

/**
 * 初始化矩阵雨效果
 */
function initMatrixRain() {
    const container = document.querySelector('.matrix-rain');
    if (!container) return;

    const characters = '01アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン';
    const columns = Math.floor(window.innerWidth / 20);

    for (let i = 0; i < columns; i++) {
        const column = document.createElement('div');
        column.className = 'matrix-column';
        column.style.left = `${(i / columns) * 100}%`;
        column.style.animationDuration = `${5 + Math.random() * 10}s`;
        column.style.animationDelay = `${Math.random() * 5}s`;

        // 生成随机字符
        let text = '';
        const length = 10 + Math.floor(Math.random() * 20);
        for (let j = 0; j < length; j++) {
            text += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        column.textContent = text;

        container.appendChild(column);
    }
}

/**
 * 添加故障艺术效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function addGlitchEffect(element) {
    element.classList.add('glitch');
    element.setAttribute('data-text', element.textContent);

    // 随机触发故障效果
    setInterval(() => {
        if (Math.random() > 0.95) {
            element.style.transform = `translate(${Math.random() * 10 - 5}px, ${Math.random() * 10 - 5}px)`;
            setTimeout(() => {
                element.style.transform = 'translate(0, 0)';
            }, 50);
        }
    }, 100);
}

/**
 * 创建能量条效果
 * @param {HTMLElement} container - 容器元素
 * @param {number} value - 能量值 (0-100)
 */
function createEnergyBar(container, value) {
    const bar = document.createElement('div');
    bar.className = 'energy-bar';
    bar.style.width = `${value}%`;

    const glow = document.createElement('div');
    glow.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: ${value}%;
        background: linear-gradient(90deg, var(--neon-blue), var(--neon-pink));
        border-radius: 2px;
        box-shadow: var(--shadow-neon);
    `;

    container.appendChild(bar);
    container.appendChild(glow);
}

/**
 * 添加数据流动效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function addDataFlowEffect(element) {
    element.classList.add('data-flow');

    const flow = document.createElement('div');
    flow.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.1), transparent);
        animation: data-flow 3s infinite;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(flow);
}

/**
 * 初始化全息投影效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function initHologramEffect(element) {
    element.classList.add('hologram');

    const scan = document.createElement('div');
    scan.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(45deg, transparent 30%, rgba(0, 245, 255, 0.05) 50%, transparent 70%);
        animation: hologram-scan 3s linear infinite;
    `;

    element.appendChild(scan);
}

// 导出函数供其他脚本使用
window.CyberEffects = {
    addCyberEffect,
    createNeonBorder,
    addGlitchEffect,
    createEnergyBar,
    addDataFlowEffect,
    initHologramEffect
};
