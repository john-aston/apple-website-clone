// 登录状态公共管理：提供当前用户与登录/注册/退出操作，并持久化到 localStorage
import { createContext, useContext, useState, type ReactNode } from 'react'
// 与 api 中的 login/register 重名，改名导入避免冲突
import { login as apiLogin, register as apiRegister, type User } from '../api/auth'

// 上下文提供的值：当前用户（null 表示未登录）与三个操作
type AuthContextType = {
  user: User | null
  login: (username: string, password: string) => Promise<void>
  register: (username: string, password: string) => Promise<void>
  logout: () => void
}

// 创建 Context，默认 null 表示 Provider 未包裹
const AuthContext = createContext<AuthContextType | null>(null)

// Provider：持有登录状态并包住整个应用
export function AuthProvider({ children }: { children: ReactNode }) {
  // 初始值从 localStorage 读取，刷新页面后保持登录
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('user')
    return saved ? JSON.parse(saved) as User : null
  })

  // 登录：校验成功后写入 state 并持久化；校验失败抛错，由登录页展示
  const login = async (username: string, password: string) => {
    const u = await apiLogin(username, password)
    if (!u) throw new Error('用户名或密码错误')
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }

  // 注册：成功后自动登录，同样写入 state 并持久化
  const register = async (username: string, password: string) => {
    const u = await apiRegister(username, password)
    setUser(u)
    localStorage.setItem('user', JSON.stringify(u))
  }

  // 退出：清空 state 与 localStorage
  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook：组件调用 useAuth() 获取上下文，必须在 Provider 内部使用
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth 必须在 AuthProvider 里用')
  return ctx
}
