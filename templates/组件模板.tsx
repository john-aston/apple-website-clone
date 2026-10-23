// 组件模板：复制本文件 → 改组件名（两处 MyComponent）→ 写你的 HTML
import { useState } from 'react'

function MyComponent() {
  // 数据变化时页面会自动更新
  const [count, setCount] = useState(0)

  return (
    <div>
      {/* 在这里写你的 HTML */}
      <h1>你好</h1>
      <button onClick={() => setCount(count + 1)}>{count}</button>
    </div>
  )
}

export default MyComponent
