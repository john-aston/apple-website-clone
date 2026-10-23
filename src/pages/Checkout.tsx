import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart, parsePrice } from '../context/CartContext'
import { createOrder } from '../api/orders'
import '../styles/Orders.css'

// 结算页（受保护）：填写收货信息（前端校验）→ 确认下单写入后端 orders 表
// 只结算"勾选中的商品"；下单成功即清空购物车并跳转订单页

function Checkout() {
  const { user } = useAuth()
  const { selectedItems, total, clear } = useCart()
  const navigate = useNavigate()

  // 收货信息表单
  const [form, setForm] = useState({ name: '', phone: '', addr: '' })
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  // 前端校验：收货人 / 电话（11 位）/ 地址 都必填
  const validate = () => {
    if (!form.name.trim()) return '请填写收货人姓名'
    if (!/^1\d{10}$/.test(form.phone.trim())) return '请填写 11 位手机号'
    if (!form.addr.trim()) return '请填写详细地址'
    return ''
  }

  // 点"确认下单"
  const handleCheckout = async () => {
    if (!user || selectedItems.length === 0) return

    const problem = validate()
    if (problem) { setError(problem); return }

    setBusy(true)
    setError('')
    try {
      await createOrder({
        username: user.username,
        items: selectedItems,              // 订单里存下单时的购物车快照（只带勾选商品），之后购物车变动不影响订单
        total,
        address: {                         // 收货信息
          name: form.name.trim(),
          phone: form.phone.trim(),
          addr: form.addr.trim(),
        },
        status: '待处理',
        createdAt: new Date().toLocaleString('zh-CN'),
      })
      clear()                              // 下单成功 → 清空购物车
      navigate('/orders')                  // 跳去订单页
    } catch (err) {
      setError(err instanceof Error ? err.message : '下单失败，请重试')
    } finally {
      setBusy(false)
    }
  }

  // 没有勾选商品（比如下完单又点回来）→ 引导回购物车
  if (selectedItems.length === 0) {
    return (
      <div className="flow-page">
        <h1>结算</h1>
        <p className="flow-muted">还没有勾选要结算的商品。</p>
        <Link to="/cart" className="flow-link">回购物袋勾选</Link>
      </div>
    )
  }

  return (
    <div className="flow-page">
      <h1>结算</h1>

      {/* 收货信息 */}
      <div className="order-card">
        <h3 className="flow-sec-title">收货信息</h3>
        <label className="flow-label">
          收货人
          <input
            className="flow-input"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            placeholder="姓名"
          />
        </label>
        <label className="flow-label">
          手机号
          <input
            className="flow-input"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            placeholder="11 位手机号"
            inputMode="numeric"
          />
        </label>
        <label className="flow-label">
          详细地址
          <input
            className="flow-input"
            value={form.addr}
            onChange={(e) => setForm({ ...form, addr: e.target.value })}
            placeholder="省 / 市 / 区 / 街道门牌号"
          />
        </label>
        <p className="flow-muted">收货人：{user?.username}</p>
      </div>

      {/* 订单商品清单（只列勾选的） */}
      <div className="order-card">
        <h3 className="flow-sec-title">商品清单</h3>
        <ul className="order-list">
          {selectedItems.map((i) => (
            <li key={`${i.name}|${i.specs ?? ''}`}>
              <span>{i.name}{i.specs ? `（${i.specs}）` : ''} × {i.qty}</span>
              <span>¥{(parsePrice(i.price) * i.qty).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <p className="order-total">应付：¥{total.toLocaleString()}</p>
      </div>

      {/* 错误提示 */}
      {error && <p className="flow-error">{error}</p>}

      {/* 提交按钮 */}
      <button className="flow-btn" onClick={handleCheckout} disabled={busy}>
        {busy ? '提交中…' : '确认下单'}
      </button>
    </div>
  )
}

export default Checkout
