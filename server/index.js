// ============================================
// server/index.js — 后端主服务（Express + SQLite）
// ------------------------------------------------------------
// 职责：提供商城全部 REST 接口，数据存 SQLite。
// 启动：npm run server（监听 3001 端口）
//
// 接口一览：
//   用户   POST /login  POST /register  POST /change-password
//   购物车 GET /carts?username=  POST /carts  PATCH /carts/:id
//   订单   GET /orders?username=  POST /orders
//          GET /orders/:id  PATCH /orders/:id
//   收藏   GET /favorites?username=  POST /favorites  DELETE /favorites/:id
//   产品   GET /mac /iphone /ipad /watch /store /home
// ============================================

import express from 'express'
import cors from 'cors'
import { createHash } from 'node:crypto'
import { db } from './db.js'

const app = express()
app.use(cors())            // 允许前端跨域访问（5173 → 3001）
app.use(express.json())    // 解析 JSON 请求体

// ---------- 工具 ----------

// SHA-256 哈希：和前端注册时一致，保证旧密码哈希能直接登录
function hash(pw) {
  return createHash('sha256').update(pw).digest('hex')
}

// 读取 JSON 字段（表里以字符串存 JSON）
const parse = (s) => { try { return JSON.parse(s) } catch { return null } }

// 把一行数据库记录转成前端要的形状（id 转字符串，和 json-server 一致）
const row = (r) => (r ? { ...r, id: String(r.id) } : null)

// ---------- 用户：登录 / 注册 / 改密码（密码验证都在后端做） ----------

app.post('/login', (req, res) => {
  const { username, password } = req.body
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username)
  if (!user || user.password !== hash(password)) {
    return res.status(401).json({ error: '用户名或密码错误' })
  }
  res.json({ id: String(user.id), username: user.username })
})

app.post('/register', (req, res) => {
  const { username, password } = req.body
  if (!username || !password) return res.status(400).json({ error: '用户名和密码不能为空' })
  if (password.length < 6) return res.status(400).json({ error: '密码至少 6 位' })

  const exists = db.prepare('SELECT 1 FROM users WHERE username = ?').get(username)
  if (exists) return res.status(409).json({ error: '这个用户名已经被注册了' })

  const info = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    .run(username, hash(password))
  res.json({ id: String(info.lastInsertRowid), username })
})

app.post('/change-password', (req, res) => {
  const { id, oldPassword, newPassword } = req.body
  const user = db.prepare('SELECT * FROM users WHERE id = ?').get(id)
  if (!user || user.password !== hash(oldPassword)) {
    return res.status(400).json({ error: '旧密码不正确' })
  }
  db.prepare('UPDATE users SET password = ? WHERE id = ?').run(hash(newPassword), id)
  res.json({ ok: true })
})

// ---------- 购物车 ----------

// 查某个用户的购物车（无记录返回空数组）
app.get('/carts', (req, res) => {
  const rows = db.prepare('SELECT * FROM carts WHERE username = ?').all(req.query.username || '')
  res.json(rows.map((r) => ({ id: String(r.id), username: r.username, items: parse(r.items) || [] })))
})

// 新增购物车
app.post('/carts', (req, res) => {
  const { username, items } = req.body
  const info = db.prepare('INSERT INTO carts (username, items) VALUES (?, ?)')
    .run(username, JSON.stringify(items || []))
  res.json({ id: String(info.lastInsertRowid), username, items: items || [] })
})

// 更新购物车内容
app.patch('/carts/:id', (req, res) => {
  const { items } = req.body
  db.prepare('UPDATE carts SET items = ? WHERE id = ?').run(JSON.stringify(items || []), req.params.id)
  res.json({ id: req.params.id, items: items || [] })
})

// ---------- 订单 ----------

app.get('/orders', (req, res) => {
  const rows = db.prepare('SELECT * FROM orders WHERE username = ? ORDER BY id DESC').all(req.query.username || '')
  res.json(rows.map((r) => ({
    id: String(r.id), username: r.username,
    items: parse(r.items) || [], total: r.total,
    address: parse(r.address) || {}, status: r.status, createdAt: r.createdAt,
  })))
})

app.get('/orders/:id', (req, res) => {
  const r = db.prepare('SELECT * FROM orders WHERE id = ?').get(req.params.id)
  if (!r) return res.status(404).json({ error: '订单不存在' })
  res.json({
    id: String(r.id), username: r.username,
    items: parse(r.items) || [], total: r.total,
    address: parse(r.address) || {}, status: r.status, createdAt: r.createdAt,
  })
})

app.post('/orders', (req, res) => {
  const { username, items, total, address, status, createdAt } = req.body
  if (!username || !items?.length) return res.status(400).json({ error: '订单数据不完整' })
  const info = db.prepare(
    'INSERT INTO orders (username, items, total, address, status, createdAt) VALUES (?, ?, ?, ?, ?, ?)'
  ).run(username, JSON.stringify(items), total, JSON.stringify(address || {}), status || '待处理', createdAt || '')
  res.json({
    id: String(info.lastInsertRowid), username, items, total,
    address: address || {}, status: status || '待处理', createdAt,
  })
})

// 改订单状态（取消订单）
app.patch('/orders/:id', (req, res) => {
  const { status } = req.body
  db.prepare('UPDATE orders SET status = ? WHERE id = ?').run(status, req.params.id)
  res.json({ id: req.params.id, status })
})

// ---------- 收藏 ----------

app.get('/favorites', (req, res) => {
  const rows = db.prepare('SELECT * FROM favorites WHERE username = ? ORDER BY id DESC').all(req.query.username || '')
  res.json(rows.map((r) => ({
    id: String(r.id), username: r.username,
    name: r.name, price: r.price, img: r.img, category: r.category,
  })))
})

app.post('/favorites', (req, res) => {
  const { username, name, price, img, category } = req.body
  const info = db.prepare(
    'INSERT INTO favorites (username, name, price, img, category) VALUES (?, ?, ?, ?, ?)'
  ).run(username, name, price, img, category)
  res.json({ id: String(info.lastInsertRowid), username, name, price, img, category })
})

app.delete('/favorites/:id', (req, res) => {
  db.prepare('DELETE FROM favorites WHERE id = ?').run(req.params.id)
  res.json({})
})

// ---------- 后台管理：商品 / 分类（直接读写 pages 表，前台实时联动） ----------

// 读取某个页面数据（JSON 解析后的对象）
function getPage(page) {
  const row = db.prepare('SELECT data FROM pages WHERE key = ?').get(page)
  return row ? JSON.parse(row.data) : null
}

// 写回某个页面数据
function setPage(page, data) {
  db.prepare('UPDATE pages SET data = ? WHERE key = ?').run(JSON.stringify(data), page)
}

// 商品列表：平铺所有页面的全部商品（带所属页面和分类），支持 ?page=mac 过滤
app.get('/admin/products', (req, res) => {
  const { page } = req.query
  const keys = page ? [page] : ['mac', 'iphone', 'ipad', 'watch']
  const all = []
  for (const key of keys) {
    const data = getPage(key)
    if (!data || !data.categories) continue
    for (const cat of data.categories) {
      for (const card of cat.cards) {
        all.push({ page: key, categoryId: cat.id, category: cat.label, ...card })
      }
    }
  }
  res.json(all)
})

// 新增商品：指定页面和分类，追加一张卡片
app.post('/admin/products', (req, res) => {
  const { page, categoryId, product } = req.body
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  const cat = data.categories.find((c) => c.id === categoryId)
  if (!cat) return res.status(404).json({ error: '分类不存在' })
  if (cat.cards.some((c) => c.name === product.name)) {
    return res.status(409).json({ error: '同名商品已存在' })
  }
  cat.cards.push(product)
  setPage(page, data)
  res.json(product)
})

// 编辑商品：按 页面+分类+原名 定位，更新卡片字段
app.patch('/admin/products', (req, res) => {
  const { page, categoryId, name, product } = req.body
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  const cat = data.categories.find((c) => c.id === categoryId)
  if (!cat) return res.status(404).json({ error: '分类不存在' })
  const idx = cat.cards.findIndex((c) => c.name === name)
  if (idx < 0) return res.status(404).json({ error: '商品不存在' })
  cat.cards[idx] = { ...cat.cards[idx], ...product }
  setPage(page, data)
  res.json(cat.cards[idx])
})

// 删除商品
app.delete('/admin/products', (req, res) => {
  const { page, categoryId, name } = req.query
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  const cat = data.categories.find((c) => c.id === categoryId)
  if (!cat) return res.status(404).json({ error: '分类不存在' })
  cat.cards = cat.cards.filter((c) => c.name !== name)
  setPage(page, data)
  res.json({ ok: true })
})

// 分类列表：某个页面的全部分类
app.get('/admin/categories', (req, res) => {
  const { page } = req.query
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  res.json(data.categories)
})

// 新增分类
app.post('/admin/categories', (req, res) => {
  const { page, id, label, big } = req.body
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  if (data.categories.some((c) => c.id === id)) {
    return res.status(409).json({ error: '分类 id 已存在' })
  }
  data.categories.push({ id, label, big: !!big, cards: [] })
  setPage(page, data)
  res.json({ ok: true })
})

// 编辑分类（改 label / big）
app.patch('/admin/categories', (req, res) => {
  const { page, id, label, big } = req.body
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  const cat = data.categories.find((c) => c.id === id)
  if (!cat) return res.status(404).json({ error: '分类不存在' })
  if (label !== undefined) cat.label = label
  if (big !== undefined) cat.big = !!big
  setPage(page, data)
  res.json(cat)
})

// 删除分类（连同里面的商品一起删）
app.delete('/admin/categories', (req, res) => {
  const { page, id } = req.query
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  data.categories = data.categories.filter((c) => c.id !== id)
  setPage(page, data)
  res.json({ ok: true })
})

// 分类排序：传有序的 id 数组，按数组顺序重排
app.put('/admin/categories/order', (req, res) => {
  const { page, ids } = req.body
  const data = getPage(page)
  if (!data) return res.status(404).json({ error: '页面不存在' })
  data.categories.sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id))
  setPage(page, data)
  res.json(data.categories)
})

// 订单管理：全部订单，支持 ?status=待处理 筛选
app.get('/admin/orders', (req, res) => {
  const { status } = req.query
  const rows = status
    ? db.prepare('SELECT * FROM orders WHERE status = ? ORDER BY id DESC').all(status)
    : db.prepare('SELECT * FROM orders ORDER BY id DESC').all()
  res.json(rows.map((r) => ({
    id: String(r.id), username: r.username,
    items: parse(r.items) || [], total: r.total,
    address: parse(r.address) || {}, status: r.status, createdAt: r.createdAt,
  })))
})

// ---------- 产品展示数据（只读） ----------

app.get('/:page', (req, res) => {
  const { page } = req.params
  if (!['mac', 'iphone', 'ipad', 'watch', 'store', 'home'].includes(page)) {
    return res.status(404).json({ error: 'Not Found' })
  }
  const row = db.prepare('SELECT data FROM pages WHERE key = ?').get(page)
  if (!row) return res.status(404).json({ error: '数据不存在' })
  res.json(JSON.parse(row.data))
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`✓ 后端已启动: http://localhost:${PORT}`)
  console.log('  数据库: server/data.db (SQLite)')
})
