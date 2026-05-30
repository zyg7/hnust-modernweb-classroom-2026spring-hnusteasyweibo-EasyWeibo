const express = require('express');
const fs = require('fs');
const path = require('path');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();
const POSTS = path.join(__dirname, '..', 'data', 'posts.json');
const USERS = path.join(__dirname, '..', 'data', 'users.json');

const readP = () => { try { return JSON.parse(fs.readFileSync(POSTS, 'utf-8')); } catch { return []; } };
const writeP = (d) => fs.writeFileSync(POSTS, JSON.stringify(d, null, 2), 'utf-8');
const readU = () => { try { return JSON.parse(fs.readFileSync(USERS, 'utf-8')); } catch { return []; } };

function withUser(post) {
  const u = readU().find(x => x.id === post.userId);
  return { ...post, likeCount: (post.likes || []).length, commentCount: (post.comments || []).length, user: u ? { id: u.id, username: u.username, nickname: u.nickname, avatar: u.avatar } : null };
}

// 微博列表
router.get('/', (req, res) => {
  const { page = 1, limit = 20 } = req.query;
  let list = readP().sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const total = list.length;
  const start = (parseInt(page) - 1) * parseInt(limit);
  res.json({ posts: list.slice(start, start + parseInt(limit)).map(withUser), pagination: { page: parseInt(page), total, totalPages: Math.ceil(total / parseInt(limit)) } });
});

// 微博详情
router.get('/:id', (req, res) => {
  const p = readP().find(x => x.id === req.params.id);
  if (!p) return res.status(404).json({ message: '微博不存在' });
  res.json(withUser(p));
});

// 用户微博
router.get('/user/:userId', (req, res) => {
  const posts = readP().filter(x => x.userId === req.params.userId).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  const author = readU().find(x => x.id === req.params.userId);
  res.json({ posts: posts.map(withUser), user: author ? { id: author.id, username: author.username, nickname: author.nickname, avatar: author.avatar, bio: author.bio, createdAt: author.createdAt } : null });
});

// 发布
router.post('/', authMiddleware, (req, res) => {
  const { content, images = [] } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: '内容不能为空' });
  const posts = readP();
  const p = { id: Date.now().toString(), userId: req.user.id, content: content.trim(), images, likes: [], comments: [], createdAt: new Date().toISOString() };
  posts.push(p); writeP(posts);
  res.status(201).json({ message: '发布成功', post: withUser(p) });
});

// 删除
router.delete('/:id', authMiddleware, (req, res) => {
  const posts = readP();
  const i = posts.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: '微博不存在' });
  if (posts[i].userId !== req.user.id) return res.status(403).json({ message: '无权删除' });
  posts.splice(i, 1); writeP(posts);
  res.json({ message: '删除成功' });
});

// 点赞
router.post('/:id/like', authMiddleware, (req, res) => {
  const posts = readP();
  const i = posts.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: '微博不存在' });
  if (!posts[i].likes) posts[i].likes = [];
  const idx = posts[i].likes.indexOf(req.user.id);
  if (idx === -1) posts[i].likes.push(req.user.id); else posts[i].likes.splice(idx, 1);
  writeP(posts);
  res.json({ isLiked: idx === -1, likeCount: posts[i].likes.length });
});

// 评论
router.post('/:id/comments', authMiddleware, (req, res) => {
  const { content } = req.body;
  if (!content || !content.trim()) return res.status(400).json({ message: '评论不能为空' });
  const posts = readP();
  const i = posts.findIndex(x => x.id === req.params.id);
  if (i === -1) return res.status(404).json({ message: '微博不存在' });
  if (!posts[i].comments) posts[i].comments = [];
  const u = readU().find(x => x.id === req.user.id);
  const c = { id: Date.now().toString(), userId: req.user.id, content: content.trim(), createdAt: new Date().toISOString(), user: { id: u.id, nickname: u.nickname, avatar: u.avatar } };
  posts[i].comments.push(c); writeP(posts);
  res.status(201).json({ message: '评论成功', comment: c });
});

// 删除评论
router.delete('/:postId/comments/:commentId', authMiddleware, (req, res) => {
  const posts = readP();
  const p = posts.find(x => x.id === req.params.postId);
  if (!p) return res.status(404).json({ message: '微博不存在' });
  const ci = p.comments.findIndex(x => x.id === req.params.commentId);
  if (ci === -1) return res.status(404).json({ message: '评论不存在' });
  if (p.comments[ci].userId !== req.user.id) return res.status(403).json({ message: '无权删除' });
  p.comments.splice(ci, 1); writeP(posts);
  res.json({ message: '删除成功' });
});

module.exports = router;
