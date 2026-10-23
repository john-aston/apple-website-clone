import { useRef, useState, useEffect } from 'react'

// 一张产品小卡的形状
type ShowcaseItem = {
  name: string
  img: string
}

// 产品滚动展示：自动轮播 + 细线滚动条
// 轨道和滑块 DOM 用 ref 拿取；滚动条显隐需要触发重渲染，用 state
function ProductShowcase({ items }: { items: ShowcaseItem[] }) {
  const trackRef = useRef<HTMLDivElement>(null)      // 滚动轨道 DOM
  const thumbRef = useRef<HTMLSpanElement>(null)     // 细线滑块 DOM
  const indexRef = useRef(0)                         // 当前索引：只读不重画界面，放 ref
  const pauseRef = useRef(false)                     // 悬停暂停标记
  const hideTimerRef = useRef<number | null>(null)   // 停止滚动后隐藏滑块的延时定时器 id
  const [scrolling, setScrolling] = useState(false)  // 滚动条显隐：要触发重渲染，用 state

  const total = items.length

  // 平滑滚动到第 i 张卡（配合 CSS 的 scroll-snap）
  const goTo = (i: number) => {
    const track = trackRef.current
    if (!track) return
    const card = track.children[i] as HTMLElement | undefined
    if (!card) return
    indexRef.current = i
    track.scrollTo({ left: card.offsetLeft, behavior: 'smooth' })
  }

  // 滚动时更新滑块：宽度 = 可视区占比，位置 = 滚动进度 × 剩余行程
  const updateBar = () => {
    const track = trackRef.current
    const thumb = thumbRef.current
    if (!track || !thumb) return
    const visible = track.clientWidth
    const totalW = track.scrollWidth
    const maxScroll = totalW - visible          // 还能往右滚多远

    const thumbW = Math.max((visible / totalW) * 100, 8)
    thumb.style.width = thumbW + '%'

    const move = maxScroll > 0 ? (track.scrollLeft / maxScroll) * (100 - thumbW) : 0
    thumb.style.left = move + '%'

    setScrolling(true)
    if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
    hideTimerRef.current = window.setTimeout(() => setScrolling(false), 600)
  }

  // 自动轮播：每 3 秒滚到下一张，到头回第一张；悬停暂停
  useEffect(() => {
    const id = setInterval(() => {
      if (!pauseRef.current) {
        goTo(indexRef.current >= total - 1 ? 0 : indexRef.current + 1)
      }
    }, 3000)
    return () => clearInterval(id)   // 卸载时清除定时器，防止内存泄漏
  }, [total])

  // 窗口尺寸变化时重算滑块位置（卡片宽度随视口变化）
  useEffect(() => {
    updateBar()
    window.addEventListener('resize', updateBar)
    return () => window.removeEventListener('resize', updateBar)
  }, [])

  return (
    <section className="p-showcase" aria-label="产品浏览">
      {/* onScroll 时更新滑块；悬停暂停自动播放 */}
      <div
        className="p-track"
        ref={trackRef}
        onScroll={updateBar}
        onMouseEnter={() => { pauseRef.current = true }}
        onMouseLeave={() => { pauseRef.current = false }}
      >
        {items.map((item) => (
          <article className="p-card" key={item.name}>
            <div className="p-media">
              <img src={item.img} alt={item.name} />
            </div>
            <h3 className="p-name">{item.name}</h3>
          </article>
        ))}
      </div>

      {/* scrolling 为 true 时加 .scrolling 类，细线滚动条浮现 */}
      <div className={`p-scrollbar${scrolling ? ' scrolling' : ''}`}>
        <div className="p-scrollbar-inner">
          <span className="p-scrollbar-thumb" ref={thumbRef}></span>
        </div>
      </div>
    </section>
  )
}

export default ProductShowcase
