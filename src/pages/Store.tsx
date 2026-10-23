import { useRef, useState, useEffect } from 'react'
import PageStatus from '../components/PageStatus'
import { getStoreData, type StoreData, type StoreItem } from '../api/products'
import '../styles/Store.css'

// Store 页：数据来自后端接口（showcase / spotlight 两组），
// 页面负责拉数据 → 三态显示（PageStatus）→ 渲染两个轮播子组件。

// 产品滚动展示栏：4 张液态玻璃卡横向滚动，带细线滚动条和自动播放
function Showcase({ items }: { items: StoreItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)      // useRef：滚动轨道 DOM
  const thumbRef = useRef<HTMLSpanElement>(null)     // useRef：细线滑块 DOM
  const indexRef = useRef(0)                         // useRef：当前卡片序号（不参与渲染，用 ref 存）
  const pauseRef = useRef(false)                     // useRef：鼠标悬停时暂停自动播放
  const hideTimerRef = useRef<number | null>(null)   // useRef："停止滚动后隐藏滚动条"的延时定时器 id
  const [scrolling, setScrolling] = useState(false)  // useState：滚动条显隐（要触发重渲染，用 state）

  // 滚动到第 i 张卡（配合 CSS 的 scroll-snap + scroll-behavior）
  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[i] as HTMLElement | undefined
    if (!card) return
    indexRef.current = i
    track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
  }

  // 自动播放：每 3.5 秒滚到下一张（到头回第一张）；依赖 [items]，数据就绪后启动，卸载时清理定时器
  useEffect(() => {
    const id = setInterval(() => {
      if (!pauseRef.current) {
        goTo((indexRef.current + 1) % items.length)
      }
    }, 3500)
    return () => clearInterval(id)
  }, [items])

  // 更新滑块：宽度 = 可视区占比，位置 = 滚动进度 × 剩余行程
  const updateBar = () => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return
    const visible = track.clientWidth
    const totalW = track.scrollWidth
    const maxScroll = totalW - visible              // 还能往右滚多远

    const thumbW = Math.max((visible / totalW) * 100, 8)
    thumb.style.width = thumbW + '%'
    const move = maxScroll > 0 ? (track.scrollLeft / maxScroll) * (100 - thumbW) : 0
    thumb.style.left = move + '%'

    setScrolling(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setScrolling(false), 600)
  }

  // 挂载时先算一次滑块；窗口大小变化时重新计算（卡片宽度随视口变化）
  useEffect(() => {
    updateBar()
    window.addEventListener('resize', updateBar)
    return () => window.removeEventListener('resize', updateBar)
  }, [])

  return (
    <section className="showcase">
      <div className="showcase-head">
        <h2>选购产品</h2>
      </div>

      {/* 滚动时更新细线滚动条；悬停时暂停自动播放 */}
      <div
        className="showcase-track"
        ref={trackRef}
        onScroll={updateBar}
        onMouseEnter={() => { pauseRef.current = true }}
        onMouseLeave={() => { pauseRef.current = false }}
      >
        {items.map((p) => (
          <article className="glass-card" key={p.id}>
            <div className="glass-media">
              <img src={p.img} alt={p.name} />
            </div>
            <div className="glass-copy">
              <h3>{p.name}</h3>
              <p>{p.desc}</p>
              <div className="glass-price">
                <span className="price">{p.price}</span>
                <span className="installment">{p.installment}</span>
              </div>
              <a href="#" className="glass-link">进一步了解</a>
            </div>
          </article>
        ))}
      </div>

      {/* scrolling 为 true 时加 .scrolling 类，滚动条浮现 */}
      <div className={`showcase-scrollbar${scrolling ? ' scrolling' : ''}`}>
        <div className="showcase-scrollbar-inner">
          <span className="showcase-scrollbar-thumb" ref={thumbRef}></span>
        </div>
      </div>
    </section>
  )
}

// 新品轮播图：6 张大卡横向滚动，带圆点指示、前后按钮和自动播放
function Spotlight({ items }: { items: StoreItem[] }) {
  const viewportRef = useRef<HTMLDivElement>(null)    // useRef：可滚动视口 DOM
  const trackRef = useRef<HTMLDivElement>(null)       // useRef：内部轨道 DOM
  const pauseRef = useRef(false)                      // useRef：悬停暂停自动播放
  const [index, setIndex] = useState(0)               // useState：当前序号；圆点高亮、按钮禁用都依赖它，用 state 触发重渲染

  // 滚动到第 i 张
  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const slide = track.children[i] as HTMLElement | undefined
    if (!slide) return
    setIndex(i)
    viewportRef.current?.scrollTo({ left: slide.offsetLeft, behavior: 'smooth' })
  }

  // 自动播放：每 4 秒下一张，到头回第一张；依赖 [index]、[items]，手动切换或数据就绪后重新计时
  useEffect(() => {
    const id = setInterval(() => {
      if (!pauseRef.current) {
        goTo(index < items.length - 1 ? index + 1 : 0)
      }
    }, 4000)
    return () => clearInterval(id)
  }, [index, items])

  return (
    <section className="spotlight">
      <div className="spotlight-head">
        <h2>新品速览</h2>
        <div className="spotlight-controls">
          <button
            className="spot-btn"
            aria-label="上一张"
            onClick={() => goTo(index - 1)}
            disabled={index === 0}
          >‹</button>
          <button
            className="spot-btn"
            aria-label="下一张"
            onClick={() => goTo(index + 1)}
            disabled={index === items.length - 1}
          >›</button>
        </div>
      </div>

      {/* 悬停暂停自动播放 */}
      <div
        className="spotlight-viewport"
        ref={viewportRef}
        onMouseEnter={() => { pauseRef.current = true }}
        onMouseLeave={() => { pauseRef.current = false }}
      >
        <div className="spotlight-track" ref={trackRef}>
          {items.map((p) => (
            <a href="#" className="spot-card" key={p.id}>
              <div className="spot-media">
                <img src={p.img} alt={p.name} />
              </div>
              <div className="spot-copy">
                <h3>{p.name}</h3>
                <p>{p.desc}</p>
                <div className="spot-price">
                  <span className="price">{p.price}</span>
                  <span className="installment">{p.installment}</span>
                </div>
                <span className="spot-link">进一步了解 ›</span>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* 圆点：用 index 决定哪个高亮，点击直接跳转 */}
      <div className="spotlight-dots">
        {items.map((p, i) => (
          <span
            key={p.id}
            className={i === index ? 'active' : ''}
            onClick={() => goTo(i)}
          />
        ))}
      </div>
    </section>
  )
}

// Store 页主体：拉数据 → 三态显示 → 渲染两个轮播
function Store() {
  // data 接口数据（null = 尚未成功）；loading 是否加载中；error 失败原因
  const [data, setData] = useState<StoreData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // 拉数据；抽成函数，重试按钮直接再调它
  const load = () => {
    setLoading(true)
    setError('')
    getStoreData()
      .then((d) => setData(d))
      .catch((e) => setError(String(e)))
      .finally(() => setLoading(false))
  }

  // 页面挂载时加载一次
  useEffect(() => {
    load()
  }, [])

  return (
    <main>
      {/* Hero 横幅：STORE 在左，说明在右（静态，不走接口） */}
      <div className="hero">
        <div className="viewport">
          <div className="title">
            <h1>Store</h1>
          </div>
          <div className="description">
            <h4>以最好的方式购买你喜爱的产品。</h4>
            <a href="#" className="link">进一步了解</a>
            <a href="#" className="link">选购 iPhone</a>
          </div>
        </div>
      </div>

      {/* 加载中 / 加载失败（重试） */}
      <PageStatus loading={loading} error={error} onRetry={load} />

      {/* 成功：渲染两个轮播 */}
      {data && (
        <>
          {/* 产品滚动展示栏 */}
          <Showcase items={data.showcase} />

          {/* 新品轮播图 */}
          <Spotlight items={data.spotlight} />
        </>
      )}
    </main>
  )
}

export default Store
