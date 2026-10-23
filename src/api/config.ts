// API 地址统一配置
// 开发时读 .env 的 VITE_API_BASE（默认 localhost:3001）
// 部署时在平台的环境变量里设置 VITE_API_BASE 指向线上后端即可，不用改代码
const BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3001'

export default BASE
