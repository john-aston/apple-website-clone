import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { parsePrice } from '../context/CartContext'
import { getOrder, cancelOrder, type Order } from '../api/orders'
import '../styles/Orders.css'

// 订单详情页（受保护）：按路由参数拉取单个订单，展示收货信息 / 商品清单 / 金额 / 状态
// 未完成的订单可在此取消

function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const [order, setOrder] = useState<Order | null>(null)
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // 拉取订单详情（取消订单后重新拉取以刷新状态）
  const load = () => {
    if (!id) return
    setError('')
    getOrder(id)
      .then(setOrder)
      .catch((e) => setError(e instanceof Error ? e.message : '加载失败'))
  }

  useEffect(() => {
    load()
  }, [id])

  // 取消订单：成功后重新拉一遍，界面状态跟着变
  const handleCancel = async () => {
    if (!id) return
    setBusy(true)
    setError('')
    try {
      await cancelOrder(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '取消失败')
    } finally {
      setBusy(false)
    }
  }

  if (error) {
    return (
      <div className="flow-page">
        <h1>订单详情</h1>
        <p className="flow-error">{error}</p>
        <Link to="/orders" className="flow-link">返回订单列表</Link>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="flow-page">
        <h1>订单详情</h1>
        <p className="flow-muted">加载中…</p>
      </div>
    )
  }

  // 防串号：只能查看自己的订单
  if (user && order.username !== user.username) {
    return (
      <div className="flow-page">
        <h1>订单详情</h1>
        <p className="flow-error">这不是你的订单。</p>
        <Link to="/orders" className="flow-link">返回订单列表</Link>
      </div>
    )
  }

  return (
    <div className="flow-page">
      <h1>订单详情</h1>

      <div className="order-card">
        <p className="order-meta">
          订单号 {order.id} · {order.createdAt}
          <span className={`order-status st-${order.status}`}>{order.status}</span>
        </p>

        {/* 收货信息 */}
        {order.address && (
          <div className="order-addr-block">
            <h3 className="flow-sec-title">收货信息</h3>
            <p className="flow-muted">
              {order.address.name} · {order.address.phone}
              <br />
              {order.address.addr}
            </p>
          </div>
        )}

        {/* 商品清单 */}
        <h3 className="flow-sec-title">商品清单</h3>
        <ul className="order-list">
          {order.items.map((i) => (
            <li key={`${i.name}|${i.specs ?? ''}`}>
              <span>{i.name}{i.specs ? `（${i.specs}）` : ''} × {i.qty}</span>
              <span>¥{(parsePrice(i.price) * i.qty).toLocaleString()}</span>
            </li>
          ))}
        </ul>
        <p className="order-total">合计：¥{order.total.toLocaleString()}</p>
      </div>

      {error && <p className="flow-error">{error}</p>}

      <div className="order-actions">
        <Link to="/orders" className="flow-link">返回订单列表</Link>
        {order.status !== '已取消' && (
          <button className="flow-btn flow-btn-sm flow-btn-ghost" onClick={handleCancel} disabled={busy}>
            {busy ? '取消中…' : '取消订单'}
          </button>
        )}
      </div>
    </div>
  )
}

export default OrderDetail
