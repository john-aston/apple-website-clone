// 横向滑动卡片区：一排卡片，鼠标拖动查看，无进度条
// 每张卡片：小标题 + 介绍在上，图片在下
// 用原生横向滚动 + scroll-snap 吸附，隐藏滚动条

// 一张卡片的形状
type Card = {
  img: string
  title: string
  desc: string
}

// 横滑卡片区：大标题 + 一行可拖动的卡片
function SliderCards({ title, cards }: { title: string; cards: Card[] }) {
  return (
    <section className="ip-slider-section">
      <h2 className="ip-slider-title">{title}</h2>
      <div className="ip-slider-track">
        {cards.map((c) => (
          <article className="ip-slider-card" key={c.title}>
            <h3 className="ip-slider-card-title">{c.title}</h3>
            <p className="ip-slider-card-desc">{c.desc}</p>
            {/* 图片位：放在卡片下方，你插入新图后改 img 路径即可 */}
            <div className="ip-slider-card-media">
              <img src={c.img} alt={c.title} />
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default SliderCards
