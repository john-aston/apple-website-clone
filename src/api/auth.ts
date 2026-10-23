import BASE from './config'
// 用户鉴权接口层：注册、登录、修改密码
// 密码验证在后端完成（后端做 SHA-256 哈希比对），前端只传明文、只收安全字段

// 对外暴露的用户信息：不含密码
export type User = {
  id: string;
  username: string;
};


// 登录：把用户名密码交给后端验证，成功返回用户信息，失败抛错
export async function login(username: string, password: string): Promise<User> {
  const res = await fetch(`${BASE}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `请求失败：${res.status}`)
  }
  return res.json()
}

// 注册：后端查重 + 存哈希，成功即返回新用户（等于自动登录）
export async function register(username: string, password: string): Promise<User> {
  const res = await fetch(`${BASE}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `注册失败：${res.status}`)
  }
  return res.json()
}

// 修改密码：后端校验旧密码后写入新密码的哈希
export async function changePassword(id: string, oldPassword: string, newPassword: string): Promise<void> {
  const res = await fetch(`${BASE}/change-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, oldPassword, newPassword }),
  })
  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    throw new Error(data.error || `修改失败：${res.status}`)
  }
}
