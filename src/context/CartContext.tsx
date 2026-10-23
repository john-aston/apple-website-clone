// 购物车公共状态：按登录用户从后端读取并写回购物车，每个账号各一份
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getCart, saveCart, parsePrice, type CartItem } from '../api/cart'

// 转发 api 的类型与工具，保持调用方统一从 CartContext 导入的用法
export { parsePrice }
export type { CartItem }

// 上下文提供的值
type CartContextType = {
  items: CartItem[]
  ready: boolean                // 是否已从后端拉取完成（页面据此显示"加载中"）
  addToCart: (p: { name: string; price: string; img: string; specs?: string }) => void
  changeQty: (key: string, delta: number) => void
  toggleSelected: (key: string) => void
  removeFromCart: (key: string) => void
  clear: () => void
  selectedItems: CartItem[]     // 勾选中的项（结算只算这些）
  count: number                 // 勾选项总件数（角标）
  total: number                 // 勾选项合计金额
}

// 创建 Context，默认 null
const CartContext = createContext<CartContextType | null>(null)

// 一行购物车的唯一 key = 名字 + 规格（同款不同配置各算一行）
function itemKey(i: Pick<CartItem, 'name' | 'specs'>): string {
  return `${i.name}|${i.specs ?? ''}`
}

// Provider
export function CartProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [ready, setReady] = useState(false)

  // 登录用户变化（登录/退出/换账号）时重新拉取该用户的购物车；cancelled 防止卸载后写入 state
  useEffect(() => {
    let cancelled = false
    if (!user) {
      setItems([])
      setReady(true)
      return
    }
    setReady(false)
    getCart(user.username)
      .then((list) => { if (!cancelled) setItems(list) })
      .catch(() => { if (!cancelled) setItems([]) })
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [user?.username])

  // 内部工具：改完列表后同步到后端（未登录则只改本地）
  const persist = (next: CartItem[]) => {
    setItems(next)
    if (user) saveCart(user.username, next).catch(() => {})
  }

  // 加购：同 key（名字+规格）数量 +1，否则新加一行（默认勾选）
  const addToCart = (p: { name: string; price: string; img: string; specs?: string }) => {
    const key = itemKey({ name: p.name, specs: p.specs })
    const found = items.find((i) => itemKey(i) === key)
    const next = found
      ? items.map((i) => (itemKey(i) === key ? { ...i, qty: i.qty + 1 } : i))
      : [...items, { ...p, qty: 1, selected: true }]
    persist(next)
  }

  // 改数量：delta 为 +1/-1，最少为 1（删整行走删除按钮）
  const changeQty = (key: string, delta: number) => {
    const next = items.map((i) =>
      itemKey(i) === key ? { ...i, qty: Math.max(1, i.qty + delta) } : i,
    )
    persist(next)
  }

  // 勾选 / 取消勾选
  const toggleSelected = (key: string) => {
    const next = items.map((i) =>
      itemKey(i) === key ? { ...i, selected: !i.selected } : i,
    )
    persist(next)
  }

  // 删除一行
  const removeFromCart = (key: string) => {
    persist(items.filter((i) => itemKey(i) !== key))
  }

  // 清空（下单成功后调用）
  const clear = () => persist([])

  // 派生数据：只统计勾选中的项
  const selectedItems = items.filter((i) => i.selected)
  const count = selectedItems.reduce((s, i) => s + i.qty, 0)
  const total = selectedItems.reduce((s, i) => s + parsePrice(i.price) * i.qty, 0)

  return (
    <CartContext.Provider
      value={{ items, ready, addToCart, changeQty, toggleSelected, removeFromCart, clear, selectedItems, count, total }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Hook：获取购物车上下文
export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart 必须在 CartProvider 里用')
  return ctx
}
