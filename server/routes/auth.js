const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const fs = require('fs');
const path = require('path');
const { authMiddleware, JWT_SECRET } = require('../middleware/auth');

const router = express.Router();
const FILE = path.join(__dirname, '..', 'data', 'users.json');
const read = () => { try { return JSON.parse(fs.readFileSync(FILE, 'utf-8')); } catch { return []; } };
const write = (d) => fs.writeFileSync(FILE, JSON.stringify(d, null, 2), 'utf-8');

router.post('/register', async (req, res) => {
  const { username, password, nickname } = req.body;
  if (!username || !password) return res.status(400).json({ message: '用户名和密码不能为空' });
  if (password.length < 6) return res.status(400).json({ message: '密码至少6位' });
  const users = read();
  if (users.find(u => u.username === username)) return res.status(400).json({ message: '用户名已存在' });
  const u = { id: Date.now().toString(), username, password: await bcrypt.hash(password, 10), nickname: nickname || username, avatar: '', bio: '', createdAt: new Date().toISOString() };
  users.push(u); write(users);
  const token = jwt.sign({ id: u.id, username }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safe } = u;
  res.status(201).json({ message: '注册成功', token, user: safe });
});

router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '用户名和密码不能为空' });
  const u = read().find(x => x.username === username);
  if (!u || !(await bcrypt.compare(password, u.password))) return res.status(401).json({ message: '用户名或密码错误' });
  const token = jwt.sign({ id: u.id, username }, JWT_SECRET, { expiresIn: '7d' });
  const { password: _, ...safe } = u;
  res.json({ message: '登录成功', token, user: safe });
});

router.get('/me', authMiddleware, (req, res) => {
  const u = read().find(x => x.id === req.user.id);
  if (!u) return res.status(404).json({ message: '用户不存在' });
  const { password: _, ...safe } = u;
  res.json({ user: safe });
});

router.put('/profile', authMiddleware, (req, res) => {
  const { nickname, bio, avatar } = req.body;
  const users = read();
  const i = users.findIndex(x => x.id === req.user.id);
  if (i === -1) return res.status(404).json({ message: '用户不存在' });
  if (nickname !== undefined) users[i].nickname = nickname;
  if (bio !== undefined) users[i].bio = bio;
  if (avatar !== undefined) users[i].avatar = avatar;
  write(users);
  const { password: _, ...safe } = users[i];
  res.json({ message: '更新成功', user: safe });
});

module.exports = router;
