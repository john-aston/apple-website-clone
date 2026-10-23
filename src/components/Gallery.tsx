import { useEffect, useState } from 'react'

// 图片轮播组件：左右切换的大图 + 圆点指示
// 轮播序号、切换逻辑等只与轮播自身相关，故独立成组件
// 样式复用全局的 .bmac-gallery 系列类

function Gallery({
  images,
  name,
}: {
  images: string[]
  /** 图片名称：有值 → alt 显示"名称 图 N"；没值 → 显示"配置特写图" */
  name?: string
}) {
  // 当前第几张：圆点高亮要跟着变，必须触发重渲染，所以用 state
  const [slide, setSlide] = useState(0)

  // 换了一组图片 → 回到第一张
  useEffect(() => {
    setSlide(0)
  }, [images])

  // 上一张 / 下一张（取模转圈）
  const prev = () => setSlide((slide - 1 + images.length) % images.length)
  const next = () => setSlide((slide + 1) % images.length)

  const single = images.length <= 1   // 单张图时隐藏箭头和圆点

  return (
    <section className={`bmac-gallery${single ? ' bmac-single' : ''}`} aria-label="产品预览">
      <div className="bmac-stage">
        {images.map((src, i) => (
          <img
            key={src}
            className={`bmac-slide${i === slide ? ' active' : ''}`}
            src={src}
            alt={name ? `${name} 图 ${i + 1}` : '配置特写图'}
          />
        ))}
        <button className="bmac-arrow bmac-prev" onClick={prev} aria-label="上一张">‹</button>
        <button className="bmac-arrow bmac-next" onClick={next} aria-label="下一张">›</button>
      </div>

      <div className="bmac-dots">
        {images.map((_, i) => (
          <button
            key={i}
            className={`bmac-dot${i === slide ? ' active' : ''}`}
            onClick={() => setSlide(i)}
            aria-label={`第 ${i + 1} 张`}
          />
        ))}
      </div>
    </section>
  )
}

export default Gallery
