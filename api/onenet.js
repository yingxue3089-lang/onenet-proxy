const PRODUCT_ID = '2GDT7DbZR1';
const DEVICE_NAME = 'creal_qwq';          // 已修正为正确的设备名称
const ACCESS_KEY = 'CbeZW6PdYaP9B9XTTS9h1f870fWDN2HN0elLiXfVD5M=';  // 请确保与 OneNET 控制台一致

const ONENET_API_URL = 'https://open.iot.10086.cn/iotstudio/device/thing/property/query';  // 修正路径

function generateToken() {
    const version = '2018-10-31';
    const res = `products/${PRODUCT_ID}/devices/${DEVICE_NAME}`;
    const et = 2000000000;   // 永不过期（2033年）
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
        const text = await response.text();
        res.status(200).json({
            statusCode: response.status,
            body: text.substring(0, 1500)   // 显示错误信息
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
