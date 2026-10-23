// 数据加载页面的统一状态组件：
// 加载中显示提示，失败显示原因 + 重试按钮，正常时返回 null 由页面渲染内容

function PageStatus({
  loading,
  error,
  onRetry,
}: {
  loading: boolean
  error: string
  onRetry: () => void
}) {
  // 加载中：显示加载提示
  if (loading) {
    return (
      <div className="page-status">
        <p>加载中…</p>
      </div>
    )
  }

  // 加载失败：显示错误原因，点"重试"重新拉取数据
  if (error) {
    return (
      <div className="page-status">
        <p>数据加载失败：{error}</p>
        <button onClick={onRetry}>重试</button>
      </div>
    )
  }

  // 加载完成且无错误：不渲染任何内容，正常内容由页面自己显示
  return null
}

export default PageStatus
