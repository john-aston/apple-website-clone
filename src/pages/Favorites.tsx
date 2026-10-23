import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'
import '../styles/Favorites.css'

// 我的收藏页（受保护）：展示收藏的商品（图 / 名字 / 分类 / 价格）
// 支持取消收藏，也可从列表进入购买页

function Favorites() {
  const { favorites, ready, remove } = useFavorites()

  // 后端数据未拉完 → 加载中
  if (!ready) {
    return (
      <div className="fav-page">
        <h1 className="fav-title">我的收藏</h1>
        <p className="fav-muted">加载中…</p>
      </div>
    )
  }

  // 空收藏
  if (favorites.length === 0) {
    return (
      <div className="fav-page fav-empty">
        <h1>我的收藏</h1>
        <p>还没有收藏任何商品，去分类页点爱心就能收藏。</p>
        <Link to="/store" className="fav-btn">去逛逛</Link>
      </div>
    )
  }

  return (
    <div className="fav-page">
      <h1 className="fav-title">我的收藏</h1>

      <ul className="fav-grid">
        {favorites.map((f) => (
          <li className="fav-card" key={f.id}>
            <div className="fav-media">
              <img src={f.img} alt={f.name} />
            </div>
            <div className="fav-body">
              <span className="fav-cat">{f.category}</span>
              <h3>{f.name}</h3>
              <span className="fav-price">{f.price}</span>
              <div className="fav-actions">
                {/* 从收藏列表进入购买页：只有 MacBook Pro 有真实购买页 */}
                {f.name.includes('MacBook Pro') ? (
                  <Link to="/buy-mac" className="fav-btn">查看购买页</Link>
                ) : (
                  <span className="fav-btn disabled">暂无购买页</span>
                )}
                {/* 取消收藏 */}
                <button className="fav-remove" onClick={() => remove(f.id)}>取消收藏</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default Favorites
