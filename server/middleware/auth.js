const jwt = require('jsonwebtoken');
const JWT_SECRET = 'easyweibo_lite_secret';

function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: '未登录' });
  }
  try {
    req.user = jwt.verify(authHeader.split(' ')[1], JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ message: '登录已过期' });
  }
}

module.exports = { authMiddleware, JWT_SECRET };
