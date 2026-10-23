import BASE from './config'
// 后台管理接口层：商品 / 分类 / 订单的管理请求
// 所有接口路径都是 /admin/*，数据真实写入数据库 pages 表


// 商品类型（比前台卡片多 page/categoryId/category/onSale 管理字段）
export type AdminProduct = {
  page: string
  categoryId: string
  category: string
  name: string
  tag?: string
  desc?: string
  specs?: string[]
  price: string
  img?: string
  stock?: number
  onSale?: boolean   // 下架标记：false 时前台不显示
}

// 分类类型
export type Category = {
  id: string
  label: string
  big?: boolean
}

// 订单类型（复用后台视图）
export type AdminOrder = {
  id: string
  username: string
  items: { name: string; price: string; qty: number; specs?: string }[]
  total: number
  address: { name: string; phone: string; addr: string }
  status: string
  createdAt: string
}

// 通用错误处理：后端返回 { error } 就抛出来
async function handle(res: Response): Promise<any> {
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `请求失败：${res.status}`)
  }
  return res.json()
}

// ---------- 商品 ----------

// 商品列表（可指定页面）
export async function getProducts(page?: string): Promise<AdminProduct[]> {
  const qs = page ? `?page=${page}` : ''
  return handle(await fetch(`${BASE}/admin/products${qs}`))
}

// 新增商品
export async function addProduct(page: string, categoryId: string, product: Partial<AdminProduct>) {
  return handle(await fetch(`${BASE}/admin/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, categoryId, product }),
  }))
}

// 编辑商品（按 页面+分类+原名 定位）
export async function updateProduct(page: string, categoryId: string, name: string, product: Partial<AdminProduct>) {
  return handle(await fetch(`${BASE}/admin/products`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, categoryId, name, product }),
  }))
}

// 删除商品
export async function removeProduct(page: string, categoryId: string, name: string) {
  return handle(await fetch(
    `${BASE}/admin/products?page=${page}&categoryId=${categoryId}&name=${encodeURIComponent(name)}`,
    { method: 'DELETE' },
  ))
}

// ---------- 分类 ----------

export async function getCategories(page: string): Promise<Category[]> {
  return handle(await fetch(`${BASE}/admin/categories?page=${page}`))
}

export async function addCategory(page: string, id: string, label: string) {
  return handle(await fetch(`${BASE}/admin/categories`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, id, label }),
  }))
}

export async function updateCategory(page: string, id: string, label: string) {
  return handle(await fetch(`${BASE}/admin/categories`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, id, label }),
  }))
}

export async function removeCategory(page: string, id: string) {
  return handle(await fetch(`${BASE}/admin/categories?page=${page}&id=${id}`, { method: 'DELETE' }))
}

// 分类排序：传有序 id 数组
export async function orderCategories(page: string, ids: string[]) {
  return handle(await fetch(`${BASE}/admin/categories/order`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ page, ids }),
  }))
}

// ---------- 订单 ----------

export async function getAdminOrders(status?: string): Promise<AdminOrder[]> {
  const qs = status ? `?status=${encodeURIComponent(status)}` : ''
  return handle(await fetch(`${BASE}/admin/orders${qs}`))
}

export async function updateOrderStatus(id: string, status: string) {
  return handle(await fetch(`${BASE}/orders/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  }))
}
