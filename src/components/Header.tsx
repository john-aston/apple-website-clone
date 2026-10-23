import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'

// 顶部导航栏：产品入口、登录状态区、购物袋角标
// 登录态由 AuthContext 提供，购物袋数量由 CartContext 提供
function Header() {
  // 当前用户与退出函数：决定右侧显示"账户"还是"用户名 + 退出"
  const { user, logout } = useAuth()
  // 购物车总件数，用于角标显示
  const { count } = useCart()

  return (
    <header>
      <div className="header-wrapper">

        <span className="menu-logo hp-viewport fas fa-ellipsis-h"></span>

        <ul className="header-list">
          <li className="header-content hp-viewport apple-header">
            <Link to="/">
              <img className="logo" src="/Home-img/apple-logo.png" alt="Apple" />
            </Link>
          </li>

          {/* 站内页面用路由跳转，暂无对应页面的用占位链接 */}
          <li className="header-content hp-viewport-hide"><Link to="/store">store</Link></li>
          <li className="header-content hp-viewport-hide"><Link to="/mac">Mac</Link></li>
          <li className="header-content hp-viewport-hide"><Link to="/ipad">iPad</Link></li>
          <li className="header-content hp-viewport-hide"><Link to="/iphone">iPhone</Link></li>
          <li className="header-content hp-viewport-hide"><Link to="/watch">Watch</Link></li>

          <li className="header-content hp-viewport-hide"><a href="#">TV</a></li>
          <li className="header-content hp-viewport-hide"><a href="#">Music</a></li>

          {/* 已登录：用户名 + 订单/收藏/退出；未登录：仅"账户"入口 */}
          <li className="header-content hp-viewport-hide">
            {user ? (
              <>
                <Link to="/account" style={{ color: '#1d1d1f', fontSize: '14px', marginRight: '10px' }}>
                  {user.username}
                </Link>
                <Link to="/orders" style={{ color: '#1d1d1f', fontSize: '14px', marginRight: '10px' }}>
                  订单
                </Link>
                <Link to="/favorites" style={{ color: '#1d1d1f', fontSize: '14px', marginRight: '10px' }}>
                  收藏
                </Link>
                <Link to="/admin" style={{ color: '#1d1d1f', fontSize: '14px', marginRight: '10px' }}>
                  后台
                </Link>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault()
                    logout()   // 清除登录态，导航栏自动回到未登录状态
                  }}
                >
                  退出
                </a>
              </>
            ) : (
              <Link to="/login">账户</Link>
            )}
          </li>

          {/* 购物袋角标：数量大于 0 才显示 */}
          <li className="header-content hp-viewport-hide cart-wrap">
            <Link to="/cart" className="cart-link" aria-label="购物袋">
              <i className="fa-solid fa-bag-shopping"></i>
              {count > 0 && <span className="cart-badge">{count}</span>}
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}

export default Header
