// 订单接口层：提交订单（POST /orders，id 由后端自动分配）、按用户拉历史订单（GET /orders?username=）、
// 拉订单详情（GET /orders/:id）、取消订单（PATCH /orders/:id 把状态改为"已取消"）
import type { CartItem } from '../api/cart'
import BASE from './config'

// 收货信息
export type Address = {
  name: string    // 收货人
  phone: string   // 电话
  addr: string    // 详细地址
}

// 一单订单：购买者 + 下单时的商品快照 + 合计 + 收货信息 + 状态 + 时间（items 存快照，订单不受之后改价影响）
export type Order = {
  id: string
  username: string
  items: CartItem[]
  total: number
  address: Address
  status: string   // 待处理 / 已取消
  createdAt: string
}


// 提交订单；id 由后端自动分配，故参数不含 id
export async function createOrder(order: Omit<Order, 'id'>): Promise<Order> {
  const res = await fetch(`${BASE}/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(order),
  })
  if (!res.ok) throw new Error(`下单失败：${res.status}`)
  return res.json()
}

// 拉取某用户的历史订单（按 username 过滤）
export async function getOrders(username: string): Promise<Order[]> {
  const res = await fetch(`${BASE}/orders?username=${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error(`请求失败：${res.status}`)
  return res.json()
}

// 拉取某一单的详情
export async function getOrder(id: string): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${encodeURIComponent(id)}`)
  if (!res.ok) throw new Error(`请求失败：${res.status}`)
  return res.json()
}

// 取消订单：把状态改为"已取消"（仅未完成订单可取消）
export async function cancelOrder(id: string): Promise<Order> {
  const res = await fetch(`${BASE}/orders/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: '已取消' }),
  })
  if (!res.ok) throw new Error(`取消失败：${res.status}`)
  return res.json()
}
