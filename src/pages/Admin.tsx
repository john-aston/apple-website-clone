import { useEffect, useState } from 'react'
import {
  getProducts, addProduct, updateProduct, removeProduct,
  getCategories, addCategory, removeCategory, orderCategories,
  getAdminOrders, updateOrderStatus,
  type AdminProduct, type Category, type AdminOrder,
} from '../api/admin'
import '../styles/Admin.css'

// ============================================
// 后台管理页（/admin）
// 三个 tab：商品管理 / 分类管理 / 订单管理
// 所有操作直接读写数据库 pages 表 / orders 表，前台页面实时联动
// ============================================

// 页面选择：管理哪个产品页的数据
const PAGES = [
  { id: 'mac', label: 'Mac' },
  { id: 'iphone', label: 'iPhone' },
  { id: 'ipad', label: 'iPad' },
  { id: 'watch', label: 'Watch' },
]

// 订单可选状态（前台只产生"待处理/已取消"，后台可改成其他）
const ORDER_STATUSES = ['待处理', '已发货', '已完成', '已取消']

function Admin() {
  const [tab, setTab] = useState<'products' | 'categories' | 'orders'>('products')
  const [page, setPage] = useState('mac')
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // 商品管理状态
  const [products, setProducts] = useState<AdminProduct[]>([])
  const [editing, setEditing] = useState<AdminProduct | null>(null)   // 正在编辑的商品
  const [showForm, setShowForm] = useState(false)                     // 是否显示新增/编辑表单

  // 分类管理状态
  const [categories, setCategories] = useState<Category[]>([])

  // 订单管理状态
  const [orders, setOrders] = useState<AdminOrder[]>([])
  const [orderFilter, setOrderFilter] = useState('')

  const flash = (ok: boolean, text: string) => {
    setMessage({ ok, text })
    setTimeout(() => setMessage(null), 2500)
  }

  // 切换页面或 tab 时重新拉数据
  useEffect(() => {
    if (tab === 'products') getProducts(page).then(setProducts).catch(() => setProducts([]))
    if (tab === 'categories') getCategories(page).then(setCategories).catch(() => setCategories([]))
  }, [tab, page])

  // 订单数据（切到订单 tab 或筛选变化时拉）
  useEffect(() => {
    if (tab !== 'orders') return
    getAdminOrders(orderFilter || undefined).then(setOrders).catch(() => setOrders([]))
  }, [tab, orderFilter])

  // 上下架：切换 onSale 标记，真实影响前台显示
  const toggleSale = async (p: AdminProduct) => {
    try {
      await updateProduct(p.page, p.categoryId, p.name, { onSale: !(p.onSale === false) })
      flash(true, p.onSale === false ? `已上架：${p.name}` : `已下架：${p.name}`)
      setProducts(await getProducts(page))
    } catch (e) {
      flash(false, e instanceof Error ? e.message : '操作失败')
    }
  }

  // 删除商品
  const delProduct = async (p: AdminProduct) => {
    if (!confirm(`确定删除商品「${p.name}」吗？`)) return
    try {
      await removeProduct(p.page, p.categoryId, p.name)
      flash(true, `已删除：${p.name}`)
      setProducts(await getProducts(page))
    } catch (e) {
      flash(false, e instanceof Error ? e.message : '删除失败')
    }
  }

  // 上移/下移分类（调整排序）
  const moveCategory = async (index: number, dir: -1 | 1) => {
    const next = [...categories]
    const target = index + dir
    if (target < 0 || target >= next.length) return
    ;[next[index], next[target]] = [next[target], next[index]]
    try {
      await orderCategories(page, next.map((c) => c.id))
      setCategories(next)
    } catch (e) {
      flash(false, e instanceof Error ? e.message : '排序失败')
    }
  }

  // 删除分类
  const delCategory = async (id: string) => {
    if (!confirm('删除分类会连同里面的商品一起删除，确定吗？')) return
    try {
      await removeCategory(page, id)
      flash(true, '分类已删除')
      setCategories(await getCategories(page))
    } catch (e) {
      flash(false, e instanceof Error ? e.message : '删除失败')
    }
  }

  // 修改订单状态
  const setStatus = async (id: string, status: string) => {
    try {
      await updateOrderStatus(id, status)
      flash(true, `订单 ${id} 状态已改为「${status}」`)
      setOrders(await getAdminOrders(orderFilter || undefined))
    } catch (e) {
      flash(false, e instanceof Error ? e.message : '修改失败')
    }
  }

  return (
    <main className="admin-page">
      <h1 className="admin-title">后台管理</h1>

      {/* 顶部：tab 切换 + 页面选择 */}
      <div className="admin-top">
        <div className="admin-tabs">
          <button className={tab === 'products' ? 'active' : ''} onClick={() => setTab('products')}>商品管理</button>
          <button className={tab === 'categories' ? 'active' : ''} onClick={() => setTab('categories')}>分类管理</button>
          <button className={tab === 'orders' ? 'active' : ''} onClick={() => setTab('orders')}>订单管理</button>
        </div>

        {tab !== 'orders' && (
          <select className="admin-page-select" value={page} onChange={(e) => setPage(e.target.value)}>
            {PAGES.map((p) => <option key={p.id} value={p.id}>{p.label} 页</option>)}
          </select>
        )}
      </div>

      {message && <p className={`admin-msg ${message.ok ? 'ok' : 'err'}`}>{message.text}</p>}

      {/* ========== Tab 1：商品管理 ========== */}
      {tab === 'products' && (
        <section>
          <div className="admin-row">
            <p className="admin-hint">共 {products.length} 件商品（页面：{PAGES.find((p) => p.id === page)?.label}）</p>
            <button className="admin-btn primary" onClick={() => { setEditing(null); setShowForm(true) }}>＋ 新增商品</button>
          </div>

          <table className="admin-table">
            <thead>
              <tr>
                <th>图片</th><th>名称</th><th>分类</th><th>价格</th><th>库存</th><th>状态</th><th>操作</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={`${p.categoryId}|${p.name}`} className={p.onSale === false ? 'is-off' : ''}>
                  <td>{p.img && <img className="admin-thumb" src={p.img} alt="" />}</td>
                  <td>{p.name}</td>
                  <td>{p.category}</td>
                  <td>{p.price}</td>
                  <td>{p.stock ?? '—'}</td>
                  <td>
                    <span className={`admin-status ${p.onSale === false ? 'off' : 'on'}`}>
                      {p.onSale === false ? '已下架' : '在售'}
                    </span>
                  </td>
                  <td className="admin-actions">
                    <button className="admin-btn sm" onClick={() => { setEditing(p); setShowForm(true) }}>编辑</button>
                    <button className="admin-btn sm" onClick={() => toggleSale(p)}>
                      {p.onSale === false ? '上架' : '下架'}
                    </button>
                    <button className="admin-btn sm danger" onClick={() => delProduct(p)}>删除</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {products.length === 0 && <p className="admin-empty">该页面还没有商品</p>}
        </section>
      )}

      {/* ========== Tab 2：分类管理 ========== */}
      {tab === 'categories' && (
        <CategoryManager
          page={page}
          categories={categories}
          onChanged={(list) => setCategories(list)}
          onMove={moveCategory}
          onDelete={delCategory}
          onFlash={flash}
        />
      )}

      {/* ========== Tab 3：订单管理 ========== */}
      {tab === 'orders' && (
        <section>
          <div className="admin-row">
            <select className="admin-page-select" value={orderFilter} onChange={(e) => setOrderFilter(e.target.value)}>
              <option value="">全部订单</option>
              {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>

          {orders.map((o) => (
            <div className="admin-order-card" key={o.id}>
              <div className="admin-order-head">
                <span>订单 #{o.id}</span>
                <span>{o.username} · {o.createdAt}</span>
                <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)}>
                  {ORDER_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <ul className="admin-order-items">
                {o.items.map((i) => (
                  <li key={`${i.name}|${i.specs ?? ''}`}>
                    {i.name}{i.specs ? `（${i.specs}）` : ''} × {i.qty}
                  </li>
                ))}
              </ul>
              <p className="admin-order-total">
                合计 ¥{o.total.toLocaleString()} · 收货：{o.address?.name} {o.address?.phone} {o.address?.addr}
              </p>
            </div>
          ))}
          {orders.length === 0 && <p className="admin-empty">没有符合条件的订单</p>}
        </section>
      )}

      {/* 新增/编辑商品的弹窗表单 */}
      {showForm && (
        <ProductForm
          page={page}
          categories={categories}
          initial={editing}
          onClose={() => setShowForm(false)}
          onSaved={async () => {
            setShowForm(false)
            flash(true, editing ? '商品已更新' : '商品已新增')
            setProducts(await getProducts(page))
          }}
          onFlash={flash}
        />
      )}
    </main>
  )
}

// ============================================
// 分类管理面板（独立小组件，管理某页面的分类）
// ============================================
function CategoryManager({
  page, categories, onChanged, onMove, onDelete, onFlash,
}: {
  page: string
  categories: Category[]
  onChanged: (list: Category[]) => void
  onMove: (index: number, dir: -1 | 1) => void
  onDelete: (id: string) => void
  onFlash: (ok: boolean, text: string) => void
}) {
  const [newLabel, setNewLabel] = useState('')

  const add = async () => {
    if (!newLabel.trim()) return
    const id = `cat${Date.now()}`
    try {
      await addCategory(page, id, newLabel.trim())
      onFlash(true, '分类已新增')
      setNewLabel('')
      onChanged(await getCategories(page))
    } catch (e) {
      onFlash(false, e instanceof Error ? e.message : '新增失败')
    }
  }

  return (
    <section>
      <div className="admin-row">
        <input
          className="admin-input"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="新分类名称"
        />
        <button className="admin-btn primary" onClick={add}>＋ 新增分类</button>
      </div>

      <table className="admin-table">
        <thead>
          <tr><th>排序</th><th>ID</th><th>名称</th><th>商品数</th><th>操作</th></tr>
        </thead>
        <tbody>
          {categories.map((c, i) => (
            <tr key={c.id}>
              <td>
                <button className="admin-btn sm" onClick={() => onMove(i, -1)} disabled={i === 0}>↑</button>
                <button className="admin-btn sm" onClick={() => onMove(i, 1)} disabled={i === categories.length - 1}>↓</button>
              </td>
              <td>{c.id}</td>
              <td>{c.label}</td>
              <td>—</td>
              <td className="admin-actions">
                <button className="admin-btn sm danger" onClick={() => onDelete(c.id)}>删除</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {categories.length === 0 && <p className="admin-empty">该页面还没有分类</p>}
    </section>
  )
}

// ============================================
// 商品新增/编辑表单（弹窗）
// ============================================
function ProductForm({
  page, categories, initial, onClose, onSaved, onFlash,
}: {
  page: string
  categories: Category[]
  initial: AdminProduct | null
  onClose: () => void
  onSaved: () => void
  onFlash: (ok: boolean, text: string) => void
}) {
  // 表单值：编辑时用原值，新增时用默认值
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    categoryId: initial?.categoryId ?? categories[0]?.id ?? '',
    tag: initial?.tag ?? '',
    desc: initial?.desc ?? '',
    specs: (initial?.specs ?? []).join('，'),
    price: initial?.price ?? '',
    img: initial?.img ?? '',
    stock: initial?.stock ?? '',
  })
  const [busy, setBusy] = useState(false)

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  const save = async () => {
    if (!form.name.trim() || !form.price.trim()) {
      onFlash(false, '名称和价格不能为空')
      return
    }
    setBusy(true)
    const product = {
      name: form.name.trim(),
      tag: form.tag.trim(),
      desc: form.desc.trim(),
      specs: form.specs.split('，').map((s) => s.trim()).filter(Boolean),
      price: form.price.trim(),
      img: form.img.trim(),
      stock: form.stock ? Number(form.stock) : undefined,
    }
    try {
      if (initial) {
        await updateProduct(initial.page, initial.categoryId, initial.name, product)
      } else {
        await addProduct(page, form.categoryId, product)
      }
      onSaved()
    } catch (e) {
      onFlash(false, e instanceof Error ? e.message : '保存失败')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="admin-mask">
      <div className="admin-form">
        <h3>{initial ? '编辑商品' : '新增商品'}</h3>

        <label className="admin-label">名称 *
          <input className="admin-input" value={form.name} onChange={(e) => set('name', e.target.value)} />
        </label>

        <label className="admin-label">分类
          <select className="admin-input" value={form.categoryId} onChange={(e) => set('categoryId', e.target.value)}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.label}</option>)}
          </select>
        </label>

        <label className="admin-label">价格 *（如 ¥7,999 起）
          <input className="admin-input" value={form.price} onChange={(e) => set('price', e.target.value)} />
        </label>

        <label className="admin-label">图片路径（如 /MacBook-img/macneo.png）
          <input className="admin-input" value={form.img} onChange={(e) => set('img', e.target.value)} />
        </label>

        <label className="admin-label">库存数量
          <input className="admin-input" type="number" value={form.stock} onChange={(e) => set('stock', e.target.value)} />
        </label>

        <label className="admin-label">标语（tag）
          <input className="admin-input" value={form.tag} onChange={(e) => set('tag', e.target.value)} />
        </label>

        <label className="admin-label">描述（desc）
          <textarea className="admin-input" value={form.desc} onChange={(e) => set('desc', e.target.value)} />
        </label>

        <label className="admin-label">规格（用中文逗号分隔，如：M系列芯片，15小时续航）
          <input className="admin-input" value={form.specs} onChange={(e) => set('specs', e.target.value)} />
        </label>

        <div className="admin-form-actions">
          <button className="admin-btn" onClick={onClose}>取消</button>
          <button className="admin-btn primary" onClick={save} disabled={busy}>
            {busy ? '保存中…' : '保存'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default Admin
