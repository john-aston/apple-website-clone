import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from '../context/AuthContext'

// 路由保护：包裹需要登录才能访问的页面
// 未登录时重定向到登录页，已登录时正常渲染子页面
function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user } = useAuth()

  if (!user) {
    // 用 replace 替换历史记录，避免点"返回"又回到受保护页面
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
