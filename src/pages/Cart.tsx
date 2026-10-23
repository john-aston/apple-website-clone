import { Link } from 'react-router-dom'
import { useCart, parsePrice, type CartItem } from '../context/CartContext'
import '../styles/Cart.css'

// 购物袋页（受保护）：展示每行商品，可勾选、改数量、删除
// 合计与结算都只算"勾选中的商品"

// 商品行 key：名字 + 规格，与 CartContext 保持一致
function keyOf(i: Pick<CartItem, 'name' | 'specs'>): string {
  return `${i.name}|${i.specs ?? ''}`
}

function Cart() {
  const { items, ready, changeQty, toggleSelected, removeFromCart, count, total } = useCart()

  // 后端数据未拉完 → 加载中
  if (!ready) {
    return (
      <div className="cart-page">
        <h1 className="cart-title">购物袋</h1>
        <p className="cart-note">加载中…</p>
      </div>
    )
  }

  // 空购物车：给个引导
  if (items.length === 0) {
    return (
      <div className="cart-page cart-empty">
        <h1>购物袋</h1>
        <p>你的购物袋还是空的。</p>
        <Link to="/store" className="cart-cta-btn">去选购</Link>
      </div>
    )
  }

  return (
    <div className="cart-page">
      <h1 className="cart-title">购物袋</h1>

      <div className="cart-layout">
        {/* 左侧：商品列表 */}
        <ul className="cart-list">
          {items.map((i) => {
            const key = keyOf(i)
            return (
              <li className={`cart-item${i.selected ? '' : ' is-off'}`} key={key}>
                {/* 勾选框：选中的才参与结算 */}
                <input
                  className="cart-check"
                  type="checkbox"
                  checked={i.selected}
                  onChange={() => toggleSelected(key)}
                  aria-label={`选择 ${i.name}`}
                />

                <img className="cart-img" src={i.img} alt={i.name} />

                <div className="cart-info">
                  <h3>{i.name}</h3>
                  {/* 有规格就显示（购买页选的配置） */}
                  {i.specs && <span className="cart-specs">{i.specs}</span>}
                  <span className="cart-price">{i.price}</span>
                </div>

                {/* 数量步进：− / 数字 / ＋ */}
                <div className="cart-qty">
                  <button onClick={() => changeQty(key, -1)} disabled={i.qty <= 1} aria-label="减少">−</button>
                  <span>{i.qty}</span>
                  <button onClick={() => changeQty(key, 1)} aria-label="增加">＋</button>
                </div>

                {/* 行小计 = 单价 × 数量 */}
                <span className="cart-line-total">¥{(parsePrice(i.price) * i.qty).toLocaleString()}</span>

                <button className="cart-remove" onClick={() => removeFromCart(key)}>删除</button>
              </li>
            )
          })}
        </ul>

        {/* 右侧：订单摘要（只算勾选的） */}
        <aside className="cart-summary">
          <h3>订单摘要</h3>
          <div className="cart-sum-row">
            <span>已选 {count} 件</span>
            <strong>¥{total.toLocaleString()}</strong>
          </div>
          {count === 0 ? (
            <p className="cart-note">勾选要结算的商品</p>
          ) : (
            <Link to="/checkout" className="cart-cta-btn">去结算</Link>
          )}
        </aside>
      </div>
    </div>
  )
}

export default Cart
