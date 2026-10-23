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

// iPhone 页：商品数据来自后端接口。
// 流程：拉数据 → 三态显示（PageStatus）→ 渲染大标题 + 滚动展示、分类区、效用区；
// 注意："机型"分类用大图卡，数据里该分类标了 big: true。

// 页面渐变色
const HERO = 'linear-gradient(135deg, #e8f2ff 0%, #dfeaff 50%, #f0e9ff 100%)'
const UTIL = 'linear-gradient(135deg, #f0e9ff 0%, #e8f2ff 50%, #eafbf5 100%)'

// 新增区域一的配置：横滑卡片数据（图片 + 标题 + 介绍）
// 图片已插入（placeholder-1.png ~ 6.png），共 6 张卡片
const BUY_TIPS = [
  { img: '/iPhone-img/placeholder-1.png', title: '折抵换购', desc: '用符合条件的设备折抵，购买新 iPhone 立享优惠。' },
  { img: '/iPhone-img/placeholder-2.png', title: '免费送货', desc: '所有在线订单均享免费送货，最快次日送达。' },
  { img: '/iPhone-img/placeholder-3.png', title: '灵活分期', desc: '支持多种分期方案，让心仪设备触手可及。' },
  { img: '/iPhone-img/placeholder-4.png', title: 'AppleCare+', desc: '为设备提供专家技术支持与硬件保障服务。' },
  { img: '/iPhone-img/placeholder-5.png', title: '个性化镌刻', desc: '免费在设备上镌刻专属文字或表情符号。' },
  { img: '/iPhone-img/placeholder-6.png', title: '14 天退货', desc: '不满意可无理由退货，退款无忧。' },
]

// 新增区域二的配置：隐私大图区（主标题 + 副标题 + 大图）
const PRIVACY = {
  title: '隐私保护根植于 App Store 和 iPhone 设计之中。',
  subtitle: '力保个人信息安全，这很 iPhone。',
  img: '/iPhone-img/隐私.png',
}

function IPhone() {
  // data 当前数据（null = 还没成功过）；loading 是否加载中；error 失败原因
  const [data, setData] = useState<PageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 拉数据（单独抽成函数，重试按钮直接再调它）
  const load = () => {
    setLoading(true)
    setError('')
    getPageData('iphone')
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
                <h1>iPhone</h1>
              </div>
            </div>
            <ProductShowcase items={data.showcase} />
          </div>

          {/* 分类区 */}
          <CategorySection categories={data.categories} />

          {/* 新区一：在 Apple 购买 iPhone，好处多多（横滑卡片） */}
          <SliderCards title="在 Apple 购买 iPhone，好处多多" cards={BUY_TIPS} />

          {/* 效用区 */}
          <UtilSection title="iPhone的左膀右臂" items={data.utilities} />

          {/* 新区二：隐私保护大图区（主标题 + 副标题 + 大图） */}
          <ImageBanner
            title={PRIVACY.title}
            subtitle={PRIVACY.subtitle}
            img={PRIVACY.img}
            alt="隐私保护"
          />
        </>
      )}
    </main>
  )
}

export default IPhone
