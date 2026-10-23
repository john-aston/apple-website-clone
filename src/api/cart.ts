import BASE from './config'
// 购物车接口层：购物车按登录用户存进后端 carts 表（GET 拉取；无记录 POST 新增、有记录 PATCH 更新 items），
// 实现账号间隔离，并持久化到数据库、换设备不丢失

// 购物车里的一项（含勾选状态和规格）
export type CartItem = {
  name: string
  price: string
  img: string
  qty: number
  selected: boolean   // 结算时是否勾选
  specs?: string      // 规格描述，如 "14 英寸 MacBook Pro / M5 Pro / 纳米纹理 / 深空黑色"
}

// 后端 carts 表的一行记录
type CartRow = {
  id: string
  username: string
  items: CartItem[]
}


// 从价格字符串中提取数字，如 "¥7,999 起" → 7999
export function parsePrice(price: string): number {
  return parseInt(price.replace(/[^\d]/g, ''), 10) || 0
}

// 拉取某用户的购物车；无记录时返回空数组
export async function getCart(username: string): Promise<CartItem[]> {
  const res = await fetch(`${BASE}/carts?username=${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error(`请求失败：${res.status}`)
  const list = await res.json() as CartRow[]
  return list.length > 0 ? list[0].items : []
}

// 把整个购物车写回后端：有记录则 PATCH 更新，无记录则 POST 新增
export async function saveCart(username: string, items: CartItem[]): Promise<void> {
  const res = await fetch(`${BASE}/carts?username=${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error(`请求失败：${res.status}`)
  const list = await res.json() as CartRow[]

  if (list.length > 0) {
    await fetch(`${BASE}/carts/${list[0].id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items }),
    })
  } else {
    await fetch(`${BASE}/carts`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, items }),
    })
  }
}
