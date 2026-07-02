/**
 * 赛博朋克艺术字生成器
 * 为项目卡片生成独特的艺术字标题
 */

const ArtTextGenerator = {
    // 赛博朋克风格的颜色组合
    colorSchemes: [
        { primary: '#00f5ff', secondary: '#ff00ff', glow: 'rgba(0, 245, 255, 0.5)' },
        { primary: '#ff00ff', secondary: '#00f5ff', glow: 'rgba(255, 0, 255, 0.5)' },
        { primary: '#00ff41', secondary: '#ffff00', glow: 'rgba(0, 255, 65, 0.5)' },
        { primary: '#ffff00', secondary: '#ff6b6b', glow: 'rgba(255, 255, 0, 0.5)' },
        { primary: '#8b5cf6', secondary: '#00f5ff', glow: 'rgba(139, 92, 246, 0.5)' },
        { primary: '#ff6b6b', secondary: '#00f5ff', glow: 'rgba(255, 107, 107, 0.5)' },
    ],

    // 背景图案
    patterns: [
        'circuit',
        'matrix',
        'grid',
        'waves',
        'dots',
        'hexagon'
    ],

    /**
     * 为项目生成艺术字卡片
     * @param {string} title - 项目标题
     * @param {number} index - 项目索引（用于确定样式）
     * @returns {string} HTML 字符串
     */
    generate(title, index = 0) {
        const scheme = this.colorSchemes[index % this.colorSchemes.length];
        const pattern = this.patterns[index % this.patterns.length];
        const patternSvg = this.getPattern(pattern, scheme);

        return `
            <div class="art-text-card" style="--primary: ${scheme.primary}; --secondary: ${scheme.secondary}; --glow: ${scheme.glow}">
                <div class="art-text-bg">
                    ${patternSvg}
                </div>
                <div class="art-text-content">
                    <div class="art-text-decorator top">
                        <span class="line"></span>
                        <span class="dot"></span>
                        <span class="line"></span>
                    </div>
                    <h3 class="art-text-title">${this.escapeHtml(title)}</h3>
                    <div class="art-text-decorator bottom">
                        <span class="line"></span>
                        <span class="dot"></span>
                        <span class="line"></span>
                    </div>
                </div>
                <div class="art-text-overlay"></div>
            </div>
        `;
    },

    /**
     * 获取背景图案 SVG
     */
    getPattern(pattern, scheme) {
        const { primary, secondary } = scheme;

        switch (pattern) {
            case 'circuit':
                return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="circuit" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                            <path d="M10 10h30v30H10z" fill="none" stroke="${primary}" stroke-width="0.5" opacity="0.3"/>
                            <circle cx="10" cy="10" r="2" fill="${primary}" opacity="0.5"/>
                            <circle cx="40" cy="40" r="2" fill="${secondary}" opacity="0.5"/>
                            <path d="M10 10L40 40" stroke="${primary}" stroke-width="0.3" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#circuit)"/>
                </svg>`;

            case 'matrix':
                return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="matrix" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <text x="5" y="15" font-family="monospace" font-size="10" fill="${primary}" opacity="0.2">01</text>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#matrix)"/>
                </svg>`;

            case 'grid':
                return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                            <path d="M40 0H0v40" fill="none" stroke="${primary}" stroke-width="0.5" opacity="0.2"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                </svg>`;

            case 'waves':
                return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="waves" x="0" y="0" width="100" height="20" patternUnits="userSpaceOnUse">
                            <path d="M0 10 Q25 0 50 10 Q75 20 100 10" fill="none" stroke="${primary}" stroke-width="1" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#waves)"/>
                </svg>`;

            case 'dots':
                return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                            <circle cx="10" cy="10" r="1.5" fill="${primary}" opacity="0.3"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#dots)"/>
                </svg>`;

            case 'hexagon':
                return `<svg viewBox="0 0 400 200" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="hexagon" x="0" y="0" width="60" height="52" patternUnits="userSpaceOnUse">
                            <polygon points="30,2 55,15 55,37 30,50 5,37 5,15" fill="none" stroke="${primary}" stroke-width="0.5" opacity="0.2"/>
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#hexagon)"/>
                </svg>`;

            default:
                return '';
        }
    },

    /**
     * HTML 转义
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },

    /**
     * 初始化样式
     */
    initStyles() {
        if (document.getElementById('art-text-styles')) return;

        const style = document.createElement('style');
        style.id = 'art-text-styles';
        style.textContent = `
            .art-text-card {
                position: relative;
                width: 100%;
                height: 200px;
                background: linear-gradient(135deg, #0a0a0f, #1a1a2e);
                border-radius: 12px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .art-text-bg {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                opacity: 0.5;
            }

            .art-text-bg svg {
                width: 100%;
                height: 100%;
            }

            .art-text-content {
                position: relative;
                z-index: 2;
                text-align: center;
                padding: 20px;
            }

            .art-text-title {
                font-family: 'Orbitron', sans-serif;
                font-size: 1.4rem;
                font-weight: 700;
                color: var(--primary);
                text-shadow: 0 0 20px var(--glow),
                             0 0 40px var(--glow);
                margin: 10px 0;
                letter-spacing: 2px;
                text-transform: uppercase;
            }

            .art-text-decorator {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
            }

            .art-text-decorator .line {
                width: 60px;
                height: 2px;
                background: linear-gradient(90deg, transparent, var(--primary), transparent);
            }

            .art-text-decorator .dot {
                width: 8px;
                height: 8px;
                background: var(--primary);
                border-radius: 50%;
                box-shadow: 0 0 10px var(--glow);
            }

            .art-text-overlay {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: linear-gradient(
                    135deg,
                    rgba(0, 245, 255, 0.1) 0%,
                    transparent 50%,
                    rgba(255, 0, 255, 0.1) 100%
                );
                pointer-events: none;
            }

            /* 扫描线效果 */
            .art-text-card::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: repeating-linear-gradient(
                    0deg,
                    transparent,
                    transparent 2px,
                    rgba(0, 0, 0, 0.1) 2px,
                    rgba(0, 0, 0, 0.1) 4px
                );
                pointer-events: none;
                z-index: 3;
            }

            /* 悬停效果 */
            .project-card:hover .art-text-title {
                animation: textGlitch 0.3s ease;
            }

            @keyframes textGlitch {
                0%, 100% { transform: translate(0); }
                20% { transform: translate(-2px, 2px); }
                40% { transform: translate(2px, -2px); }
                60% { transform: translate(-1px, -1px); }
                80% { transform: translate(1px, 1px); }
            }
        `;

        document.head.appendChild(style);
    }
};

// 初始化样式
document.addEventListener('DOMContentLoaded', () => {
    ArtTextGenerator.initStyles();
});
