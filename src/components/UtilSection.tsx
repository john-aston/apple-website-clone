// 一张场景大图卡
type UtilItem = {
  img: string
  text: string
}

// 效用展示区：分类区下方的两张使用场景大图卡
// 纯展示组件，标题 + 数据 map 渲染
function UtilSection({ title, items }: { title: string; items: UtilItem[] }) {
  return (
    <section className="util-section">
      <h2 className="util-title">{title}</h2>
      <div className="util-grid">
        {items.map((item) => (
          <div className="cat-card big-card" key={item.text}>
            <div className="cat-media">
              <img src={item.img} alt={item.text} />
            </div>
            <div className="cat-copy">
              <p className="util-text">{item.text}</p>
              <div className="cat-cta">
                <span className="p-btn">进一步了解 ›</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

export default UtilSection
