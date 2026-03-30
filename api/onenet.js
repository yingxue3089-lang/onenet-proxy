const PRODUCT_ID = '2GDt7DbZR1';
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
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
        const data = await response.json();
        // 直接返回 OneNET 的原始响应，不再包装成自定义错误
        res.status(200).json(data);
    } catch (error) {
        // 如果 fetch 本身出错（网络问题等），则返回详细错误
        res.status(500).json({
            error: '代理内部错误',
            message: error.message,
            stack: error.stack
        });
    }
};
