// 应用根组件：定义全部路由，按路径拆分页面代码并渲染公共的 Header/Footer
import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Header from './components/Header'
import Footer from './components/Footer'
import Login from './pages/Login'
import Home from './pages/Home'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import Orders from './pages/Orders'
import OrderDetail from './pages/OrderDetail'
import Favorites from './pages/Favorites'
import Account from './pages/Account'
import Admin from './pages/Admin'
import ProtectedRoute from './components/ProtectedRoute'

// 懒加载：页面代码按路由拆分，进入对应路由时才加载
const Store = lazy(() => import('./pages/Store'))
const Mac = lazy(() => import('./pages/Mac'))
const IPad = lazy(() => import('./pages/IPad'))
const Watch = lazy(() => import('./pages/Watch'))
const IPhone = lazy(() => import('./pages/IPhone'))
const BMac = lazy(() => import('./pages/BMac'))

function App() {
  // 登录页不渲染 Footer
  const showFooter = useLocation().pathname !== '/login'

  return (
    <>
      <Header />
      <Suspense fallback={<div style={{ padding: '80px 0', textAlign: 'center' }}>加载中...</div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/mac" element={<Mac />} />
          <Route path="/ipad" element={<IPad />} />
          <Route path="/iphone" element={<IPhone />} />
          <Route path="/watch" element={<Watch />} />
          <Route path="/buy-mac" element={<BMac />} />
          <Route path="/login" element={<Login />} />

          {/* 受保护页面：未登录访问会被踢去登录页 */}
          <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
          <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
          <Route path="/orders" element={<ProtectedRoute><Orders /></ProtectedRoute>} />
          <Route path="/orders/:id" element={<ProtectedRoute><OrderDetail /></ProtectedRoute>} />
          <Route path="/favorites" element={<ProtectedRoute><Favorites /></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account /></ProtectedRoute>} />
          {/* 后台管理：登录即可进（课程项目简化权限） */}
          <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
        </Routes>
      </Suspense>
      {showFooter && <Footer />}
    </>
  )
}

export default App
