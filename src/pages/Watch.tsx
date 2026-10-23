import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import ProductShowcase from '../components/ProductShowcase'
import CategorySection from '../components/CategorySection'
import UtilSection from '../components/UtilSection'
import PageStatus from '../components/PageStatus'
import { getPageData, type PageData } from '../api/products'
import '../styles/Product.css'

// Watch 页：商品数据来自后端接口。
// 流程：拉数据 → 三态显示（PageStatus）→ 渲染大标题 + 滚动展示、分类区、效用区。

// 页面渐变色
const HERO = 'linear-gradient(135deg, #eafbf5 0%, #e2f3ea 50%, #eaf4ff 100%)'
const UTIL = 'linear-gradient(135deg, #eaf4ff 0%, #eafbf5 50%, #f3ecff 100%)'

function Watch() {
  // data 当前数据（null = 还没成功过）；loading 是否加载中；error 失败原因
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 拉数据（单独抽成函数，重试按钮直接再调它）
  const load = () => {
    setLoading(true)
    setError('')
    getPageData('watch')
      .then((d) => setData(d))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  // 页面一挂载就去拉
  useEffect(() => {
    load()
  }, [])

  return (
    <main className="product-page" style={{ '--hero-grad': HERO, '--util-grad': UTIL } as CSSProperties}>
      <PageStatus loading={loading} error={error} onRetry={load} />

      {data && (
        <>
          {/* 大标题 + 滚动展示 */}
          <div className="hero">
            <div className="viewport">
              <div className="title">
                <h1>Watch</h1>
              </div>
            </div>
            <ProductShowcase items={data.showcase} />
          </div>

          {/* 分类区 */}
          <CategorySection categories={data.categories} />

          {/* 效用区 */}
          <UtilSection title="用 Apple Watch，拥抱健康" items={data.utilities} />
        </>
      )}
    </main>
  )
}

export default Watch
