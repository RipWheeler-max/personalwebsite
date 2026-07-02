/**
 * 关于我页面脚本 - 处理技能树动画和交互
 */

// 等待 DOM 加载完成
document.addEventListener('DOMContentLoaded', () => {
    initAboutPage();
    loadProfileForAbout();
});

/**
 * 初始化关于我页面
 */
function initAboutPage() {
    initSkillBars();
    initTimelineAnimations();
    initCodeBlockEffects();
}

/**
 * 加载个人信息并更新代码框和联系方式
 */
async function loadProfileForAbout() {
    try {
        const profile = await getProfile();
        if (!profile) return;

        // 更新代码框中的社交信息
        const codeBlock = document.querySelector('.code-block code');
        if (codeBlock) {
            const twitterLine = codeBlock.querySelector('.property.twitter');
            const githubLine = codeBlock.querySelector('.property.github');

            // 更新twitter行
            if (twitterLine && profile.twitter) {
                const twitterValue = twitterLine.parentElement.querySelector('.string');
                if (twitterValue) {
                    const twitterMatch = profile.twitter.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/);
                    twitterValue.textContent = twitterMatch ? `@${twitterMatch[1]}` : profile.twitter;
                }
            }

            // 更新github行
            if (githubLine && profile.github) {
                const githubValue = githubLine.parentElement.querySelector('.string');
                if (githubValue) {
                    const githubMatch = profile.github.match(/github\.com\/([a-zA-Z0-9_-]+)/);
                    githubValue.textContent = githubMatch ? githubMatch[1] : profile.github;
                }
            }
        }

        // 动态加载联系方式
        const contactMethods = document.getElementById('contactMethods');
        if (contactMethods) {
            const methods = [];

            if (profile.twitter) {
                const twitterMatch = profile.twitter.match(/(?:x\.com|twitter\.com)\/([a-zA-Z0-9_]+)/);
                const displayName = twitterMatch ? `@${twitterMatch[1]}` : profile.twitter;
                methods.push(`
                    <div class="contact-method">
                        <div class="method-icon">
                            <i class="x-icon"></i>
                        </div>
                        <div class="method-info">
                            <h3>X</h3>
                            <a href="${profile.twitter}" target="_blank" rel="noopener noreferrer">
                                ${displayName}
                            </a>
                        </div>
                    </div>
                `);
            }

            if (profile.github) {
                const githubMatch = profile.github.match(/github\.com\/([a-zA-Z0-9_-]+)/);
                const displayName = githubMatch ? githubMatch[1] : profile.github;
                methods.push(`
                    <div class="contact-method">
                        <div class="method-icon">
                            <i class="fab fa-github"></i>
                        </div>
                        <div class="method-info">
                            <h3>GitHub</h3>
                            <a href="${profile.github}" target="_blank" rel="noopener noreferrer">
                                ${displayName}
                            </a>
                        </div>
                    </div>
                `);
            }

            if (profile.linkedin) {
                methods.push(`
                    <div class="contact-method">
                        <div class="method-icon">
                            <i class="fab fa-linkedin"></i>
                        </div>
                        <div class="method-info">
                            <h3>LinkedIn</h3>
                            <a href="${profile.linkedin}" target="_blank" rel="noopener noreferrer">
                                查看资料
                            </a>
                        </div>
                    </div>
                `);
            }

            if (profile.email) {
                methods.push(`
                    <div class="contact-method">
                        <div class="method-icon">
                            <i class="fas fa-envelope"></i>
                        </div>
                        <div class="method-info">
                            <h3>Email</h3>
                            <a href="mailto:${profile.email}">
                                ${profile.email}
                            </a>
                        </div>
                    </div>
                `);
            }

            contactMethods.innerHTML = methods.join('') || '<p style="color: #666;">暂无联系方式</p>';
        }
    } catch (error) {
        console.error('加载个人信息失败:', error);
    }
}

/**
 * 初始化技能进度条
 */
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-progress');

    // 使用 Intersection Observer 触发动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const value = bar.getAttribute('data-value');
                bar.style.width = `${value}%`;
                observer.unobserve(bar);
            }
        });
    }, {
        threshold: 0.5
    });

    skillBars.forEach(bar => {
        observer.observe(bar);
    });
}

/**
 * 初始化时间线动画
 */
function initTimelineAnimations() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.3
    });

    timelineItems.forEach(item => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        item.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(item);
    });

    // 添加可见状态的样式
    const style = document.createElement('style');
    style.textContent = `
        .timeline-item.visible {
            opacity: 1 !important;
            transform: translateX(0) !important;
        }
    `;
    document.head.appendChild(style);
}

/**
 * 初始化代码块效果
 */
function initCodeBlockEffects() {
    const codeBlocks = document.querySelectorAll('.code-block');

    codeBlocks.forEach(block => {
        // 添加打字机效果
        const codeElement = block.querySelector('code');
        if (codeElement) {
            const originalHTML = codeElement.innerHTML;
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = originalHTML;
            const textContent = tempDiv.textContent;

            // 清空内容
            codeElement.innerHTML = '';

            // 逐字显示
            let i = 0;
            const speed = 20;

            function typeWriter() {
                if (i < textContent.length) {
                    // 保持HTML结构，只更新文本内容
                    const currentText = textContent.substring(0, i + 1);
                    const tempDiv2 = document.createElement('div');
                    tempDiv2.innerHTML = originalHTML;

                    // 简化处理：直接恢复原始HTML
                    codeElement.innerHTML = originalHTML;
                    i = textContent.length;

                    // 添加闪烁光标
                    const cursor = document.createElement('span');
                    cursor.className = 'terminal-cursor';
                    cursor.textContent = '_';
                    codeElement.appendChild(cursor);
                }
            }

            // 延迟开始打字效果
            setTimeout(typeWriter, 500);
        }
    });
}

/**
 * 添加技能项悬停效果
 */
function initSkillHoverEffects() {
    const skillItems = document.querySelectorAll('.skill-item');

    skillItems.forEach(item => {
        item.addEventListener('mouseenter', () => {
            const progressBar = item.querySelector('.skill-progress');
            if (progressBar) {
                progressBar.style.boxShadow = 'var(--shadow-neon)';
            }
        });

        item.addEventListener('mouseleave', () => {
            const progressBar = item.querySelector('.skill-progress');
            if (progressBar) {
                progressBar.style.boxShadow = 'none';
            }
        });
    });
}

/**
 * 添加时间线项目悬停效果
 */
function initTimelineHoverEffects() {
    const timelineItems = document.querySelectorAll('.timeline-item');

    timelineItems.forEach(item => {
        const dot = item.querySelector('.timeline-dot');
        const content = item.querySelector('.timeline-content');

        item.addEventListener('mouseenter', () => {
            if (dot) {
                dot.style.transform = 'scale(1.5)';
                dot.style.boxShadow = 'var(--shadow-neon)';
            }
            if (content) {
                content.style.borderColor = 'var(--neon-blue)';
                content.style.boxShadow = 'var(--shadow-neon)';
            }
        });

        item.addEventListener('mouseleave', () => {
            if (dot) {
                dot.style.transform = 'scale(1)';
                dot.style.boxShadow = 'var(--shadow-neon)';
            }
            if (content) {
                content.style.borderColor = 'var(--border-color)';
                content.style.boxShadow = 'none';
            }
        });
    });
}

/**
 * 添加联系方法悬停效果
 */
function initContactHoverEffects() {
    const contactMethods = document.querySelectorAll('.contact-method');

    contactMethods.forEach(method => {
        const icon = method.querySelector('.method-icon');

        method.addEventListener('mouseenter', () => {
            if (icon) {
                icon.style.background = 'var(--neon-blue)';
                icon.style.color = 'var(--bg-primary)';
                icon.style.boxShadow = 'var(--shadow-neon)';
            }
        });

        method.addEventListener('mouseleave', () => {
            if (icon) {
                icon.style.background = 'rgba(0, 245, 255, 0.1)';
                icon.style.color = 'var(--neon-blue)';
                icon.style.boxShadow = 'none';
            }
        });
    });
}

/**
 * 初始化所有交互效果
 */
function initInteractiveEffects() {
    initSkillHoverEffects();
    initTimelineHoverEffects();
    initContactHoverEffects();
}

// 调用交互效果初始化
document.addEventListener('DOMContentLoaded', () => {
    initInteractiveEffects();
});

/**
 * 添加粒子背景效果
 */
function initParticleBackground() {
    const canvas = document.createElement('canvas');
    canvas.className = 'particle-canvas';
    canvas.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: -1;
        opacity: 0.3;
    `;
    document.body.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    let particles = [];
    let animationId;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function createParticle() {
        return {
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            size: Math.random() * 2 + 1,
            speedX: (Math.random() - 0.5) * 0.5,
            speedY: (Math.random() - 0.5) * 0.5,
            color: `rgba(0, 245, 255, ${Math.random() * 0.5 + 0.1})`
        };
    }

    function initParticles() {
        particles = [];
        const particleCount = Math.floor((canvas.width * canvas.height) / 10000);
        for (let i = 0; i < particleCount; i++) {
            particles.push(createParticle());
        }
    }

    function drawParticles() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(particle => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = particle.color;
            ctx.fill();

            // 更新位置
            particle.x += particle.speedX;
            particle.y += particle.speedY;

            // 边界检查
            if (particle.x < 0 || particle.x > canvas.width) {
                particle.speedX *= -1;
            }
            if (particle.y < 0 || particle.y > canvas.height) {
                particle.speedY *= -1;
            }
        });

        animationId = requestAnimationFrame(drawParticles);
    }

    // 初始化
    resizeCanvas();
    initParticles();
    drawParticles();

    // 窗口大小改变时重新初始化
    window.addEventListener('resize', () => {
        resizeCanvas();
        initParticles();
    });
}

// 初始化粒子背景
document.addEventListener('DOMContentLoaded', () => {
    initParticleBackground();
});

/**
 * 添加平滑滚动效果
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// 初始化平滑滚动
document.addEventListener('DOMContentLoaded', () => {
    initSmoothScroll();
});

/**
 * 添加页面加载动画
 */
function initPageLoadAnimation() {
    // 页面加载完成后移除加载状态
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');

        // 添加淡入动画
        const fadeElements = document.querySelectorAll('.fade-in');
        fadeElements.forEach((element, index) => {
            setTimeout(() => {
                element.classList.add('visible');
            }, index * 100);
        });
    });
}

// 初始化页面加载动画
initPageLoadAnimation();
