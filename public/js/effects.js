/**
 * 视觉效果脚本 - 赛博朋克特效
 * 包含粒子系统、矩阵雨、故障效果等
 */

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    initCyberEffects();
    initAdvancedAnimations();
    initInteractiveEffects();
});

/**
 * 初始化赛博朋克效果
 */
function initCyberEffects() {
    // 初始化矩阵雨
    initMatrixRain();

    // 初始化故障效果
    initGlitchEffects();

    // 初始化霓虹灯效果
    initNeonEffects();

    // 初始化能量条
    initEnergyBars();

    // 初始化全息效果
    initHologramEffects();
}

/**
 * 初始化矩阵雨效果
 */
function initMatrixRain() {
    const matrixContainer = document.createElement('div');
    matrixContainer.className = 'matrix-rain';
    document.body.appendChild(matrixContainer);

    const characters = '01硪僾祢寔恏緈湢鍩埘堠沵説啲迗镸哋怺逺卐兲煋暒忈槑烎巭孬嫑靐玊嘂';
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

        matrixContainer.appendChild(column);
    }
}

/**
 * 初始化故障效果
 */
function initGlitchEffects() {
    // 为标题添加故障效果
    document.querySelectorAll('.glitch').forEach(element => {
        element.setAttribute('data-text', element.textContent);

        // 随机触发故障效果
        setInterval(() => {
            if (Math.random() > 0.95) {
                const translateX = Math.random() * 10 - 5;
                const translateY = Math.random() * 10 - 5;
                element.style.transform = `translate(${translateX}px, ${translateY}px)`;

                setTimeout(() => {
                    element.style.transform = 'translate(0, 0)';
                }, 50);
            }
        }, 100);
    });
}

/**
 * 初始化霓虹灯效果
 */
function initNeonEffects() {
    // 为卡片添加霓虹边框
    document.querySelectorAll('.cyber-card, .social-card, .project-card, .tech-item').forEach(card => {
        createNeonBorder(card);
    });

    // 为按钮添加霓虹效果
    document.querySelectorAll('.cyber-btn').forEach(btn => {
        btn.addEventListener('mouseenter', () => {
            btn.style.boxShadow = 'var(--shadow-neon)';
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.boxShadow = 'none';
        });
    });
}

/**
 * 创建霓虹边框效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function createNeonBorder(element) {
    const border = document.createElement('div');
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
 * 初始化能量条
 */
function initEnergyBars() {
    document.querySelectorAll('.energy-bar').forEach(bar => {
        const value = bar.getAttribute('data-value') || 75;
        bar.style.width = `${value}%`;

        // 添加发光效果
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
            animation: energy-flow 2s linear infinite;
        `;

        bar.style.position = 'relative';
        bar.appendChild(glow);
    });
}

/**
 * 初始化全息效果
 */
function initHologramEffects() {
    document.querySelectorAll('.hologram').forEach(element => {
        const scan = document.createElement('div');
        scan.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: linear-gradient(45deg, transparent 30%, rgba(0, 245, 255, 0.05) 50%, transparent 70%);
            animation: hologram-scan 3s linear infinite;
            pointer-events: none;
        `;

        element.appendChild(scan);
    });
}

/**
 * 初始化高级动画
 */
function initAdvancedAnimations() {
    // 初始化打字机效果
    initTypewriterEffects();

    // 初始化视差效果
    initParallaxEffects();

    // 初始化滚动触发动画
    initScrollAnimations();
}

/**
 * 初始化打字机效果
 */
function initTypewriterEffects() {
    document.querySelectorAll('.typewriter').forEach(element => {
        const text = element.textContent;
        element.textContent = '';
        element.style.width = '0';

        let i = 0;
        const speed = 50;

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
 * 初始化视差效果
 */
function initParallaxEffects() {
    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;

        // 背景网格视差
        const gridBg = document.querySelector('.grid-bg');
        if (gridBg) {
            gridBg.style.transform = `translateY(${scrollY * 0.5}px)`;
        }

        // 粒子容器视差
        const particles = document.querySelector('.particles-container');
        if (particles) {
            particles.style.transform = `translateY(${scrollY * 0.3}px)`;
        }
    });
}

/**
 * 初始化滚动触发动画
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
 * 初始化交互效果
 */
function initInteractiveEffects() {
    // 初始化鼠标跟随效果
    initMouseFollowEffect();

    // 初始化点击波纹效果
    initRippleEffects();

    // 初始化悬停发光效果
    initHoverGlowEffects();
}

/**
 * 初始化鼠标跟随效果
 */
function initMouseFollowEffect() {
    const cursor = document.createElement('div');
    cursor.className = 'cyber-cursor';
    cursor.style.cssText = `
        position: fixed;
        width: 20px;
        height: 20px;
        border: 2px solid var(--neon-blue);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        transition: transform 0.1s ease;
        mix-blend-mode: difference;
    `;
    document.body.appendChild(cursor);

    const cursorDot = document.createElement('div');
    cursorDot.className = 'cyber-cursor-dot';
    cursorDot.style.cssText = `
        position: fixed;
        width: 4px;
        height: 4px;
        background: var(--neon-blue);
        border-radius: 50%;
        pointer-events: none;
        z-index: 9999;
        box-shadow: var(--shadow-neon);
    `;
    document.body.appendChild(cursorDot);

    document.addEventListener('mousemove', (e) => {
        cursor.style.left = `${e.clientX - 10}px`;
        cursor.style.top = `${e.clientY - 10}px`;
        cursorDot.style.left = `${e.clientX - 2}px`;
        cursorDot.style.top = `${e.clientY - 2}px`;
    });

    // 悬停时放大光标
    document.querySelectorAll('a, button, .cyber-btn, .social-card, .project-card').forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            cursor.style.borderColor = 'var(--neon-pink)';
        });

        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            cursor.style.borderColor = 'var(--neon-blue)';
        });
    });
}

/**
 * 初始化点击波纹效果
 */
function initRippleEffects() {
    document.querySelectorAll('.cyber-btn, .social-card, .project-card, .tech-item').forEach(el => {
        el.addEventListener('click', (e) => {
            const ripple = document.createElement('div');
            const rect = el.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            const x = e.clientX - rect.left - size / 2;
            const y = e.clientY - rect.top - size / 2;

            ripple.style.cssText = `
                position: absolute;
                width: ${size}px;
                height: ${size}px;
                left: ${x}px;
                top: ${y}px;
                background: radial-gradient(circle, rgba(0, 245, 255, 0.3) 0%, transparent 70%);
                border-radius: 50%;
                transform: scale(0);
                animation: ripple-effect 0.6s ease-out;
                pointer-events: none;
            `;

            el.style.position = 'relative';
            el.style.overflow = 'hidden';
            el.appendChild(ripple);

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });

    // 添加波纹动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes ripple-effect {
            to {
                transform: scale(4);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
}

/**
 * 初始化悬停发光效果
 */
function initHoverGlowEffects() {
    document.querySelectorAll('.cyber-card, .social-card, .project-card').forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;

            card.style.background = `
                radial-gradient(circle at ${x}px ${y}px, rgba(0, 245, 255, 0.1), transparent 50%),
                var(--bg-card)
            `;
        });

        card.addEventListener('mouseleave', () => {
            card.style.background = 'var(--bg-card)';
        });
    });
}

/**
 * 创建粒子爆炸效果
 * @param {number} x - X 坐标
 * @param {number} y - Y 坐标
 * @param {string} color - 粒子颜色
 */
function createParticleExplosion(x, y, color = 'var(--neon-blue)') {
    const particleCount = 20;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        const angle = (i / particleCount) * Math.PI * 2;
        const velocity = 2 + Math.random() * 3;
        const size = 2 + Math.random() * 4;

        particle.style.cssText = `
            position: fixed;
            width: ${size}px;
            height: ${size}px;
            background: ${color};
            border-radius: 50%;
            left: ${x}px;
            top: ${y}px;
            pointer-events: none;
            z-index: 9999;
            box-shadow: 0 0 ${size * 2}px ${color};
        `;

        document.body.appendChild(particle);

        let posX = x;
        let posY = y;
        let opacity = 1;

        function animate() {
            posX += Math.cos(angle) * velocity;
            posY += Math.sin(angle) * velocity;
            opacity -= 0.02;

            particle.style.left = `${posX}px`;
            particle.style.top = `${posY}px`;
            particle.style.opacity = opacity;

            if (opacity > 0) {
                requestAnimationFrame(animate);
            } else {
                particle.remove();
            }
        }

        requestAnimationFrame(animate);
    }
}

/**
 * 创建数据流动效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function createDataFlow(element) {
    const flow = document.createElement('div');
    flow.style.cssText = `
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(0, 245, 255, 0.1), transparent);
        animation: data-flow 3s infinite;
        pointer-events: none;
    `;

    element.style.position = 'relative';
    element.style.overflow = 'hidden';
    element.appendChild(flow);
}

/**
 * 创建扫描线效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function createScanlineEffect(element) {
    const scanline = document.createElement('div');
    scanline.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(transparent 50%, rgba(0, 245, 255, 0.05) 50%);
        background-size: 100% 4px;
        animation: scanline 8s linear infinite;
        pointer-events: none;
    `;

    element.style.position = 'relative';
    element.appendChild(scanline);
}

/**
 * 创建干扰效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function createInterferenceEffect(element) {
    const interference = document.createElement('div');
    interference.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: repeating-linear-gradient(
            0deg,
            transparent,
            transparent 2px,
            rgba(0, 245, 255, 0.03) 2px,
            rgba(0, 245, 255, 0.03) 4px
        );
        animation: interference-move 0.5s linear infinite;
        pointer-events: none;
    `;

    element.style.position = 'relative';
    element.appendChild(interference);
}

/**
 * 创建能量护盾效果
 * @param {HTMLElement} element - 要添加效果的元素
 */
function createEnergyShield(element) {
    const shield = document.createElement('div');
    shield.style.cssText = `
        position: absolute;
        top: -5px;
        left: -5px;
        right: -5px;
        bottom: -5px;
        border: 2px solid transparent;
        border-radius: inherit;
        background: linear-gradient(45deg, var(--neon-blue), var(--neon-pink)) border-box;
        -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
        -webkit-mask-composite: xor;
        mask-composite: exclude;
        animation: shield-pulse 2s ease-in-out infinite;
        pointer-events: none;
    `;

    element.style.position = 'relative';
    element.appendChild(shield);
}

// 导出效果函数
window.CyberEffects = {
    createNeonBorder,
    createParticleExplosion,
    createDataFlow,
    createScanlineEffect,
    createInterferenceEffect,
    createEnergyShield
};
