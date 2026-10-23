import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import ProductShowcase from '../components/ProductShowcase'
import CategorySection from '../components/CategorySection'
import UtilSection from '../components/UtilSection'
import SliderCards from '../components/SliderCards'
import ImageBanner from '../components/ImageBanner'
import PageStatus from '../components/PageStatus'
import { getPageData, type PageData } from '../api/products'
import '../styles/Product.css'

// Mac 页：商品数据来自后端接口。
// 流程：拉数据 → 三态显示（PageStatus）→ 渲染大标题 + 滚动展示、分类区、效用区；
// 页面渐变色定义在组件内，经 CSS 变量传给 Product.css。

// 页面渐变色
const HERO = 'linear-gradient(135deg, #eaf4ff 0%, #f3ecff 50%, #e9fbf5 100%)'
const UTIL = 'linear-gradient(135deg, #fdf0f7 0%, #f3ecff 50%, #eaf4ff 100%)'

// 新区一：在 Apple 购买 Mac，好处多多（横滑卡片，文字参考苹果官网购买页）
// 图片已插入（placeholder-1.png ~ 7.png），共 7 张卡片
const BUY_TIPS = [
  { img: '/MacBook-img/placeholder-1.png', title: '折抵换购', desc: '用符合条件的电脑折抵，购买新 Mac 立享优惠。' },
  { img: '/MacBook-img/placeholder-2.png', title: '免费送货', desc: '所有在线订单均享免费送货，最快次日送达。' },
  { img: '/MacBook-img/placeholder-3.png', title: '灵活分期', desc: '支持多种分期方案，让心仪设备触手可及。' },
  { img: '/MacBook-img/placeholder-4.png', title: 'AppleCare+', desc: '为 Mac 提供专家技术支持与硬件保障服务。' },
  { img: '/MacBook-img/placeholder-5.png', title: '个性化配置', desc: '在线定制芯片、内存与存储，打造你的专属 Mac。' },
  { img: '/MacBook-img/placeholder-6.png', title: '14 天退货', desc: '不满意可无理由退货，退款无忧。' },
  { img: '/MacBook-img/placeholder-7.png', title: '专家支持', desc: '随时获取 Apple 专家的在线帮助与指导。' },
]

// 新区二：大图横幅区（主标题 + 副标题 + 大图，文字参考苹果官网理念）
const PRIVACY = {
  title: '解锁 Apple 世界',
  subtitle: 'Mac 与 iPhone、iPad 无缝协作，让灵感在 Apple 生态中自由流动。',
  img: '/MacBook-img/探索新世界.png',
}

function Mac() {
  // data 当前数据（null = 还没成功过）；loading 是否加载中；error 失败原因
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 拉数据（单独抽成函数，重试按钮直接再调它）
  const load = () => {
    setLoading(true)
    setError('')
    getPageData('mac')
      .then((d) => setData(d))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  // 页面一挂载就去拉
  useEffect(() => {
    load()
  }, [])

  return (
    // .product-page 限定 CSS 作用域；两个渐变色通过 CSS 变量传给 Product.css
    <main className="product-page" style={{ '--hero-grad': HERO, '--util-grad': UTIL } as CSSProperties}>
      {/* 加载中 / 加载失败（重试） */}
      <PageStatus loading={loading} error={error} onRetry={load} />

      {/* 成功：正常内容（数据来自接口） */}
      {data && (
        <>
          {/* 大标题 + 滚动展示 */}
          <div className="hero">
            <div className="viewport">
              <div className="title">
                <h1>Mac</h1>
              </div>
            </div>
            <ProductShowcase items={data.showcase} />
          </div>

          {/* 分类区 */}
          <CategorySection categories={data.categories} />

          {/* 新区一：在 Apple 购买 Mac，好处多多（横滑卡片） */}
          <SliderCards title="在 Apple 购买 Mac，好处多多" cards={BUY_TIPS} />

          {/* 效用区 */}
          <UtilSection title="用Mac显身手" items={data.utilities} />

          {/* 新区二：隐私安全大图区 */}
          <ImageBanner
            title={PRIVACY.title}
            subtitle={PRIVACY.subtitle}
            img={PRIVACY.img}
            alt="解锁 Apple 世界"
          />
        </>
      )}
    </main>
  )
}

export default Mac
