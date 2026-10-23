import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import ProductShowcase from '../components/ProductShowcase'
import CategorySection from '../components/CategorySection'
import UtilSection from '../components/UtilSection'
import PageStatus from '../components/PageStatus'
import { getPageData, type PageData } from '../api/products'
import '../styles/Product.css'

// iPad 页：商品数据来自后端接口。
// 流程：拉数据 → 三态显示（PageStatus）→ 渲染 Hero 大图区 + 滚动展示、分类区、效用区。

// 页面渐变色（Hero 背景图之外铺的底色）
const HERO = 'linear-gradient(135deg, #f3ecff 0%, #e9e0f8 50%, #eaf4ff 100%)'
const UTIL = 'linear-gradient(135deg, #eaf4ff 0%, #f3ecff 50%, #fdf0f7 100%)'

// Hero 区配置：背景图 + 标语 + 链接（改这里的文字/图片即可定制首屏）
const HERO_IMG = '/iPad-img/ipad.png'
const HERO_SUBTITLE = '妙，妙不可言。'
const HERO_LINKS = [
  { text: '进一步了解', href: '#' },
  { text: '购买', href: '#' },
]

function IPad() {
  // data 当前数据（null = 还没成功过）；loading 是否加载中；error 失败原因
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 拉数据（单独抽成函数，重试按钮直接再调它）
  const load = () => {
    setLoading(true)
    setError('')
    getPageData('ipad')
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
          {/* Hero 大图区：左标题右大图 + 标语 + 链接 */}
          <div className="hero">
            <div className="viewport">
              <div className="title">
                <h1>iPad</h1>
                <p className="hero-subtitle">{HERO_SUBTITLE}</p>
                <div className="hero-links">
                  {HERO_LINKS.map((l) => (
                    <a key={l.text} className="hero-link" href={l.href}>{l.text}</a>
                  ))}
                </div>
              </div>
              {/* 产品大图：放在右栏（viewport 是两栏 grid） */}
              <div className="hero-media">
                <img src={HERO_IMG} alt="iPad" />
              </div>
            </div>
            {/* 产品滚动展示 */}
            <ProductShowcase items={data.showcase} />
          </div>

          {/* 分类区 */}
          <CategorySection categories={data.categories} />

          {/* 效用区 */}
          <UtilSection title="用 iPad，释放创意" items={data.utilities} />
        </>
      )}
    </main>
  )
}

export default IPad
