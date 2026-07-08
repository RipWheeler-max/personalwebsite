const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const { authenticateToken } = require('../middleware/auth');

const UPLOADS_DIR = path.join(__dirname, '../../public/uploads');

// 单独为上传路由设置较大的 JSON 限制
router.use(express.json({ limit: '50mb' }));

/**
 * POST /api/upload/image
 * 上传 Base64 图片
 */
router.post('/image', authenticateToken, (req, res) => {
    try {
        const { image } = req.body;
        
        if (!image || !image.startsWith('data:image/')) {
            return res.status(400).json({ success: false, message: '无效的图片数据' });
        }

        if (!fs.existsSync(UPLOADS_DIR)) {
            fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        }

        const matches = image.match(/^data:image\/([A-Za-z-+\/]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
            return res.status(400).json({ success: false, message: '无效的图片格式' });
        }

        let ext = matches[1];
        if (ext === 'jpeg') ext = 'jpg';
        if (ext === 'svg+xml') ext = 'svg';

        const data = matches[2];
        const buffer = Buffer.from(data, 'base64');
        const filename = `${uuidv4()}.${ext}`;
        const filepath = path.join(UPLOADS_DIR, filename);

        fs.writeFileSync(filepath, buffer);

        res.json({
            success: true,
            url: `/uploads/${filename}`
        });
    } catch (error) {
        console.error('上传图片失败:', error);
        res.status(500).json({ success: false, message: '上传失败' });
    }
});

module.exports = router;
