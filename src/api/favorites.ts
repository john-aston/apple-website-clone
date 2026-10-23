import BASE from './config'
// 收藏接口层：收藏按登录用户存进后端 favorites 表（GET 拉列表、POST 收藏、DELETE 按 id 取消）

// 一条收藏记录：存商品快照 + 所属用户
export type Favorite = {
  id: string
  username: string
  name: string
  price: string
  img: string
  category: string   // 所属分类，如"笔记本电脑"
}

// 新增收藏时 id 由后端分配、此时还不知道，故用 Omit 去掉 id
export type NewFavorite = Omit<Favorite, 'id'>


// 拉取某用户的收藏列表
export async function getFavorites(username: string): Promise<Favorite[]> {
  const res = await fetch(`${BASE}/favorites?username=${encodeURIComponent(username)}`)
  if (!res.ok) throw new Error(`请求失败：${res.status}`)
  return res.json()
}

// 收藏一件商品
export async function addFavorite(fav: NewFavorite): Promise<Favorite> {
  const res = await fetch(`${BASE}/favorites`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(fav),
  })
  if (!res.ok) throw new Error(`收藏失败：${res.status}`)
  return res.json()
}

// 取消收藏（按 id 删除）
export async function removeFavorite(id: string): Promise<void> {
  const res = await fetch(`${BASE}/favorites/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  })
  if (!res.ok) throw new Error(`取消收藏失败：${res.status}`)
}
