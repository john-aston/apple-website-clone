// 收藏公共状态：按登录用户从后端读写收藏，商品卡片与收藏页共享同一份列表
import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { useAuth } from './AuthContext'
import { getFavorites, addFavorite, removeFavorite, type Favorite } from '../api/favorites'

// 前端用于收藏/取消的商品信息（不含 id/username，后端会补上）
export type FavoriteItem = {
  name: string
  price: string
  img: string
  category: string
}

// 上下文提供的值
type FavoritesContextType = {
  favorites: Favorite[]
  ready: boolean
  isFav: (name: string) => boolean
  toggle: (item: FavoriteItem) => void
  remove: (id: string) => void
}

// 创建 Context，默认 null
const FavoritesContext = createContext<FavoritesContextType | null>(null)

// Provider
export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [favorites, setFavorites] = useState<Favorite[]>([])
  const [ready, setReady] = useState(false)

  // 登录用户变化时重新拉取该用户的收藏；cancelled 防止卸载后写入 state
  useEffect(() => {
    let cancelled = false
    if (!user) {
      setFavorites([])
      setReady(true)
      return
    }
    setReady(false)
    getFavorites(user.username)
      .then((list) => { if (!cancelled) setFavorites(list) })
      .catch(() => { if (!cancelled) setFavorites([]) })
      .finally(() => { if (!cancelled) setReady(true) })
    return () => { cancelled = true }
  }, [user?.username])

  // 按名字判断某商品是否已收藏
  const isFav = (name: string) => favorites.some((f) => f.name === name)

  // 收藏/取消收藏：已收藏则移除，否则新增
  const toggle = (item: FavoriteItem) => {
    if (!user) return
    const existing = favorites.find((f) => f.name === item.name)
    if (existing) {
      removeFavorite(existing.id).catch(() => {})
      setFavorites((prev) => prev.filter((f) => f.id !== existing.id))
    } else {
      addFavorite({ ...item, username: user.username })
        .then((created) => setFavorites((prev) => [...prev, created]))
        .catch(() => {})
    }
  }

  // 直接删除（收藏页的删除按钮）
  const remove = (id: string) => {
    removeFavorite(id).catch(() => {})
    setFavorites((prev) => prev.filter((f) => f.id !== id))
  }

  return (
    <FavoritesContext.Provider value={{ favorites, ready, isFav, toggle, remove }}>
      {children}
    </FavoritesContext.Provider>
  )
}

// Hook：获取收藏上下文
export function useFavorites() {
  const ctx = useContext(FavoritesContext)
  if (!ctx) throw new Error('useFavorites 必须在 FavoritesProvider 里用')
  return ctx
}
