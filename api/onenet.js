const PRODUCT_ID = '2GDT7DbZR1';
const DEVICE_NAME = 'creal_qwq';
const ACCESS_KEY = 'CbeZW6PdYaP9B9XTTS9h1f870fWDN2HN0elLiXfVD5M=';

const ONENET_API_URL = 'https://open.iot.10086.cn/iotstudio/device/thing/property/query';

function generateToken() {
    const version = '2018-10-31';
    const res = `products/${PRODUCT_ID}/devices/${DEVICE_NAME}`;
    const et = Math.floor(Date.now() / 1000) + 3600; // 可改为 2000000000 排除时效
    const method = 'sha1';
    const stringToSign = `${et}\n${method}\n${res}\n${version}`;
    const crypto = require('crypto');
    const key = Buffer.from(ACCESS_KEY, 'base64');
    const hmac = crypto.createHmac('sha1', key);
    const sign = hmac.update(stringToSign).digest('base64');
    return `version=${version}&res=${encodeURIComponent(res)}&et=${et}&method=${method}&sign=${encodeURIComponent(sign)}`;
}

module.exports = async (req, res) => {
    // 设置 CORS 头
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
        // 直接返回 OneNET 的原始响应（状态码、头、正文）
        const text = await response.text();
        res.status(response.status).setHeader('Content-Type', response.headers.get('content-type'));
        res.send(text);
    } catch (error) {
        res.status(500).send(`代理内部错误: ${error.message}`);
    }
};
