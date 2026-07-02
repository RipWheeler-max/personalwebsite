/**
 * 认证中间件
 * 验证管理员登录状态
 */

const jwt = require('jsonwebtoken');

/**
 * 验证 JWT Token
 */
function authenticateToken(req, res, next) {
    // 从 Header 获取 token
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
        return res.status(401).json({
            success: false,
            message: '未登录，请先登录'
        });
    }

    try {
        // 验证 token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(403).json({
            success: false,
            message: '登录已过期，请重新登录'
        });
    }
}

module.exports = { authenticateToken };
