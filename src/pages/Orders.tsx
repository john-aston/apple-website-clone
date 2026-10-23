import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { parsePrice } from '../context/CartContext'
import { getOrders, cancelOrder, type Order } from '../api/orders'
import '../styles/Orders.css'

// 我的订单页（受保护）：拉取当前用户的全部历史订单
// 每单可查看详情，未完成的订单可取消

function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState<Order[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cancelling, setCancelling] = useState('')   // 正在取消的订单 id

  // 拉取订单列表（抽成函数，取消订单后重新拉一次）
  const load = () => {
    if (!user) return
    setLoading(true)
    setError('')
    getOrders(user.username)
      .then(setOrders)
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  // 取消订单：调接口成功后重新拉列表
  const handleCancel = async (id: string) => {
    setCancelling(id)
    setError('')
    try {
      await cancelOrder(id)
      load()
    } catch (e) {
      setError(e instanceof Error ? e.message : '取消失败，请重试')
    } finally {
      setCancelling('')
    }
  }

  return (
    <div className="flow-page">
      <h1>我的订单</h1>

      {loading && <p className="flow-muted">加载中…</p>}
      {error && <p className="flow-error">{error}</p>}

      {/* 没有订单 */}
      {orders && orders.length === 0 && (
        <p className="flow-muted">
          还没有订单。<Link to="/store" className="flow-link">去逛逛</Link>
        </p>
      )}

      {/* 历史订单列表 */}
      {orders && orders.map((o) => (
        <div className="order-card" key={o.id}>
          <p className="order-meta">
            订单号 {o.id} · {o.createdAt}
            <span className={`order-status st-${o.status}`}>{o.status}</span>
          </p>
          <ul className="order-list">
            {o.items.map((i) => (
              <li key={`${i.name}|${i.specs ?? ''}`}>
                <span>{i.name}{i.specs ? `（${i.specs}）` : ''} × {i.qty}</span>
                <span>¥{(parsePrice(i.price) * i.qty).toLocaleString()}</span>
              </li>
            ))}
          </ul>
          <p className="order-total">合计：¥{o.total.toLocaleString()}</p>

          {/* 收货信息摘要 */}
          {o.address && (
            <p className="order-addr">
              收货：{o.address.name} · {o.address.phone} · {o.address.addr}
            </p>
          )}

          <div className="order-actions">
            <Link to={`/orders/${o.id}`} className="flow-link">查看详情</Link>
            {o.status !== '已取消' && (
              <button
                className="flow-btn flow-btn-sm flow-btn-ghost"
                onClick={() => handleCancel(o.id)}
                disabled={cancelling === o.id}
              >
                {cancelling === o.id ? '取消中…' : '取消订单'}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default Orders
