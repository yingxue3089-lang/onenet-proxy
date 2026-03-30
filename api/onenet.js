const PRODUCT_ID = '2GDT7DbZR1';
const DEVICE_NAME = 'creal_qwq';
const ACCESS_KEY = 'CbeZW6PdYaP9B9XTTS9h1f870fWDN2HN0elLiXfVD5M=';

const ONENET_API_URL = 'https://open.iot.10086.cn/iotstudio/device/thing/property/query';

function generateToken() {
    const version = '2018-10-31';
    const res = `products/${PRODUCT_ID}/devices/${DEVICE_NAME}`;
    const et = Math.floor(Date.now() / 1000) + 3600;
    const method = 'sha1';
    const stringToSign = `${et}\n${method}\n${res}\n${version}`;
    const crypto = require('crypto');
    const key = Buffer.from(ACCESS_KEY, 'base64');
    const hmac = crypto.createHmac('sha1', key);
    const sign = hmac.update(stringToSign).digest('base64');
    return `version=${version}&res=${encodeURIComponent(res)}&et=${et}&method=${method}&sign=${encodeURIComponent(sign)}`;
}

module.exports = async (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }
    if (req.method !== 'GET') {
        res.status(405).json({ error: 'Method not allowed' });
        return;
    }
    try {
        const token = generateToken();
        const url = `${ONENET_API_URL}?productId=${PRODUCT_ID}&deviceName=${DEVICE_NAME}`;
        const response = await fetch(url, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        // 直接返回原始文本（HTML 或 JSON），方便查看错误
        const text = await response.text();
        res.status(200).json({
            debug: true,
            status: response.status,
            statusText: response.statusText,
            headers: Object.fromEntries(response.headers.entries()),
            body: text.substring(0, 1000) // 限制长度，避免过大
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
