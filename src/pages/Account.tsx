import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { changePassword } from '../api/auth'
import '../styles/Account.css'

// 账户中心页（受保护）：查看资料、进入订单 / 收藏 / 购物袋、修改密码、退出登录

function Account() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  // 修改密码表单
  const [oldPwd, setOldPwd] = useState('')
  const [newPwd, setNewPwd] = useState('')
  const [confirm, setConfirm] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null)

  // 修改密码：先做前端校验，再调用接口
  const handleChangePassword = async () => {
    setMessage(null)
    if (!user) return
    if (newPwd.length < 6) { setMessage({ ok: false, text: '新密码至少 6 位' }); return }
    if (newPwd !== confirm) { setMessage({ ok: false, text: '两次输入的新密码不一致' }); return }

    setBusy(true)
    try {
      await changePassword(user.id, oldPwd, newPwd)
      setMessage({ ok: true, text: '密码修改成功，下次登录用新密码' })
      setOldPwd(''); setNewPwd(''); setConfirm('')
    } catch (e) {
      setMessage({ ok: false, text: e instanceof Error ? e.message : '修改失败，请重试' })
    } finally {
      setBusy(false)
    }
  }

  // 退出登录并返回首页
  const handleLogout = () => {
    logout()
    navigate('/')
  }

  if (!user) return null   // 受保护路由理论上进不来，双保险

  return (
    <div className="acc-page">
      <h1 className="acc-title">账户</h1>

      {/* 资料卡 */}
      <div className="acc-card">
        <div className="acc-avatar">{user.username.slice(0, 1).toUpperCase()}</div>
        <div className="acc-info">
          <h3>{user.username}</h3>
          <p className="acc-muted">用户 ID：{user.id}</p>
        </div>
      </div>

      {/* 常用入口 */}
      <div className="acc-card">
        <nav className="acc-nav">
          <Link to="/orders">我的订单 ›</Link>
          <Link to="/favorites">我的收藏 ›</Link>
          <Link to="/cart">购物袋 ›</Link>
        </nav>
      </div>

      {/* 修改密码 */}
      <div className="acc-card">
        <h3 className="acc-sec-title">修改密码</h3>
        <label className="acc-label">
          旧密码
          <input className="acc-input" type="password" value={oldPwd}
            onChange={(e) => setOldPwd(e.target.value)} placeholder="当前密码" />
        </label>
        <label className="acc-label">
          新密码
          <input className="acc-input" type="password" value={newPwd}
            onChange={(e) => setNewPwd(e.target.value)} placeholder="至少 6 位" />
        </label>
        <label className="acc-label">
          确认新密码
          <input className="acc-input" type="password" value={confirm}
            onChange={(e) => setConfirm(e.target.value)} placeholder="再输一次" />
        </label>
        {message && <p className={message.ok ? 'acc-ok' : 'acc-err'}>{message.text}</p>}
        <button className="acc-btn" onClick={handleChangePassword} disabled={busy}>
          {busy ? '保存中…' : '保存新密码'}
        </button>
      </div>

      {/* 退出 */}
      <button className="acc-btn acc-btn-logout" onClick={handleLogout}>退出登录</button>
    </div>
  )
}

export default Account
