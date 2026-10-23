import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import '../styles/Login.css'

function Login() {
  // mode 决定当前显示登录还是注册
  const [mode, setMode] = useState<'login' | 'register'>('login')

  // 三个输入框的值（受控组件：值存在 state 里，界面随输入更新）
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')   // 注册时的"确认密码"

  // 错误提示 + 提交中状态
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)      // 请求途中防连点

  const { login, register } = useAuth()        // 从 AuthContext 拿登录 / 注册方法
  const navigate = useNavigate()               // 路由跳转

  // 提交登录 / 注册
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()        // 阻止表单默认提交导致的页面刷新
    setError('')              // 清空上次的错误提示

    // 注册时校验两次密码一致（前端校验，提升体验）
    if (mode === 'register' && password !== confirm) {
      setError('两次输入的密码不一致')
      return
    }

    setBusy(true)
    try {
      // 调用 AuthContext 的 login / register（内部调接口并写入 localStorage）
      if (mode === 'login') {
        await login(username, password)
      } else {
        await register(username, password)
      }
      navigate('/')           // 成功后跳回首页
    } catch (err) {
      // 失败（密码错误 / 用户名被占）时显示原因
      setError(err instanceof Error ? err.message : '出错了，请重试')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="login-page">
      <section className="login-card">
        <form className="login-form" onSubmit={handleSubmit}>
          <h1>{mode === 'login' ? 'WELCOME' : 'REGISTER'}</h1>

          {/* 错误提示 */}
          {error && (
            <p style={{ color: '#e03131', fontSize: '13px', textAlign: 'center', margin: '0 0 10px' }}>
              {error}
            </p>
          )}

          {/* 用户名（登录和注册都用） */}
          <div className="login-field">
            <input
              type="text"
              placeholder="用户名"
              spellCheck={false}
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
            <i className="fa-solid fa-user"></i>
          </div>

          {/* 密码 */}
          <div className="login-field">
            <input
              type="password"
              placeholder="密码"
              spellCheck={false}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <i className="fa-solid fa-lock"></i>
          </div>

          {/* 注册时才显示：确认密码 */}
          {mode === 'register' && (
            <div className="login-field">
              <input
                type="password"
                placeholder="确认密码"
                spellCheck={false}
                required
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
              />
              <i className="fa-solid fa-lock"></i>
            </div>
          )}

          {/* 装饰性的，先不管 */}
          <div className="login-options">
            <p>
              <input type="checkbox" /> 记住账户
            </p>
            <a href="#">忘记密码?</a>
          </div>

          <button type="submit" className="login-btn" disabled={busy}>
            {busy ? '请稍候…' : mode === 'login' ? '登陆' : '注册'}
          </button>

          <p className="login-register">
            {mode === 'login' ? '没有帐户？' : '已注册帐户？'}
            <a
              href="#"
              onClick={(e) => {
                e.preventDefault()
                setMode(mode === 'login' ? 'register' : 'login')
                setError('')      // 切换时清掉错误
              }}
            >
              {mode === 'login' ? '注册' : '登陆'}
            </a>
          </p>
        </form>
      </section>
    </div>
  )
}

export default Login
