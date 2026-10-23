import { useEffect, useState } from 'react'
import PageStatus from '../components/PageStatus'
import { getHomeData, type HomeProduct } from '../api/products'
import '../styles/Home.css'

// Home 页：顶部两块静态横幅（iPhone、MacBook Air），
// 下方产品卡片网格数据来自后端接口。
// 流程：拉数据 → 三态显示（PageStatus）→ 渲染卡片。

function Home() {
  // products 产品数据（null = 尚未成功）；loading 是否加载中；error 失败原因
  const [products, setProducts] = useState<HomeProduct[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 拉数据；抽成函数，重试按钮直接再调它
  const load = () => {
    setLoading(true)
    setError('')
    getHomeData()
      .then((d) => setProducts(d.products))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  // 页面挂载时加载一次
  useEffect(() => {
    load()
  }, [])

  return (
    <main>
      <div className="container">
        <div className="contents">
          {/* iPhone 大图块（静态内容，不走接口） */}
          <div
            className="image-container"
            onClick={() => { window.location.href = '/iphone' }}
            style={{ cursor: 'pointer' }}
          >
            <div className="iphone">
              <div className="title">
                <h1>iPhone</h1>
                <p>来看看 iPhone 最新阵容</p>
              </div>
              <div className="cta-links">
                <a href="#" className="learn-more-link">进一步了解</a>
                <a href="#" className="buy-link">选购 iPhone</a>
              </div>
            </div>
          </div>

          {/* MacBook Air 渐变块（静态内容，不走接口） */}
          <div className="macbook-block">
            <div className="macbook-text">
              <h1>Macbook Air</h1>
              <p>强势动力来自M5</p>
              <div className="cta-links">
                <a href="#" className="learn-more-link">进一步了解</a>
                <a href="#" className="buy-link">购买</a>
              </div>
            </div>
            <div className="macbook-image"></div>
          </div>
        </div>
      </div>

      {/* 加载中 / 加载失败（重试） */}
      <PageStatus loading={loading} error={error} onRetry={load} />

      {/* 成功：产品卡片网格（数据来自接口） */}
      {products && (
        <ul className="flex-list">
          {products.map((p) => (
            <li className="content" key={p.id}>
              <div
                className={`${p.theme} container-main`}
                onClick={() => { window.location.href = p.href }}
                style={{ cursor: 'pointer' }}
              >
                <div className="unit-copy-wrapper">
                  <img src={p.logo} alt="" style={p.logoStyle} />
                  <h2 className="headline">{p.headline}</h2>
                </div>
                <div className="cta-links">
                  {/* ctaType 为 'tv' 时渲染自定义按钮（JSX 无法入 JSON，改用数据标记）；其余渲染"进一步了解 / 购买" */}
                  {p.ctaType === 'tv' ? (
                    <a href="#" style={{ color: 'white' }}>
                      观看新一季 <span className="fas fa-play-circle" />
                    </a>
                  ) : (
                    <>
                      <a href={p.href} className="learn-more-link">进一步了解</a>
                      {p.buy && <a href={p.buy} className="buy-link">购买</a>}
                    </>
                  )}
                </div>
                <div className="unit-image">
                  <figure>
                    <img src={p.image} alt="" style={p.imgStyle} />
                  </figure>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default Home
