// ============================================
// server/db.js — SQLite 数据库初始化
// ------------------------------------------------------------
// 用 Node 内置的 node:sqlite（真正的 SQL 关系型数据库，无需安装）。
// 职责：① 建表 ② 首次启动时把 db.json 的旧数据迁移进 SQLite。
// 数据文件：server/data.db
// ============================================

import { DatabaseSync } from 'node:sqlite'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DB_PATH = join(__dirname, 'data.db')

// 打开数据库（不存在会自动创建文件）
export const db = new DatabaseSync(DB_PATH)

// ---------- 建表 ----------
export function initDb() {
  // 用户表：密码只存 SHA-256 哈希，不存明文
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL
    )
  `)

  // 购物车表：每个用户一行，items 存商品数组的 JSON 字符串
  db.exec(`
    CREATE TABLE IF NOT EXISTS carts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      items TEXT NOT NULL DEFAULT '[]'
    )
  `)

  // 订单表：items / address 存 JSON；status 为订单状态
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      items TEXT NOT NULL,
      total REAL NOT NULL,
      address TEXT NOT NULL,
      status TEXT NOT NULL,
      createdAt TEXT NOT NULL
    )
  `)

  // 收藏表：每个用户可收藏多个商品（商品信息存快照）
  db.exec(`
    CREATE TABLE IF NOT EXISTS favorites (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT NOT NULL,
      name TEXT NOT NULL,
      price TEXT NOT NULL,
      img TEXT NOT NULL,
      category TEXT NOT NULL
    )
  `)

  // 产品展示数据表：key 是页面标识（mac/iphone/home/...），data 存整个页面数据的 JSON
  db.exec(`
    CREATE TABLE IF NOT EXISTS pages (
      key TEXT PRIMARY KEY,
      data TEXT NOT NULL
    )
  `)

  migrateFromDbJson()
}

// ---------- 迁移 db.json 的旧数据 ----------
// 只在表为空时导入一次：users 保留原哈希，页面展示数据搬进 pages 表。
function migrateFromDbJson() {
  const old = JSON.parse(readFileSync(join(__dirname, '..', 'db.json'), 'utf8'))

  // 用户：users 表为空才导入
  const userCount = db.prepare('SELECT COUNT(*) AS n FROM users').get().n
  if (userCount === 0 && Array.isArray(old.users)) {
    const ins = db.prepare('INSERT INTO users (username, password) VALUES (?, ?)')
    for (const u of old.users) {
      try { ins.run(u.username, u.password) } catch { /* 重名跳过 */ }
    }
  }

  // 页面展示数据：mac/iphone/ipad/watch/store/home 各存一行
  const pageCount = db.prepare('SELECT COUNT(*) AS n FROM pages').get().n
  if (pageCount === 0) {
    const ins = db.prepare('INSERT INTO pages (key, data) VALUES (?, ?)')
    for (const key of ['mac', 'iphone', 'ipad', 'watch', 'store', 'home']) {
      if (old[key]) ins.run(key, JSON.stringify(old[key]))
    }
  }

  console.log('✓ 数据库就绪，数据已迁移（users / pages）')
}

// 启动时自动建表
initDb()
