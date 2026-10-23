import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useFavorites } from '../context/FavoritesContext'

// 一张商品卡的形状
type ProductCard = {
  name: string
  tag: string
  desc: string
  specs: string[]
  price: string
  img: string
  onSale?: boolean   // 后台上下架标记：false 表示下架
}

// 一个分类：包含若干张商品卡
type Category = {
  id: string
  label: string
  big?: boolean   // 为 true 时该分类的卡片用大图样式
  cards: ProductCard[]
}

// 分类入口区：点分类按钮切换下方商品面板
// 用 state 记录当前选中的分类 id，className 条件判断自动切换
function CategorySection({ categories }: { categories: Category[] }) {
  // 当前选中的分类 id，默认第一个
  const [active, setActive] = useState(categories[0].id)
  // 收藏：查询与切换收藏状态
  const { isFav, toggle } = useFavorites()

  return (
    <section className="cat-section">
      <div className="cat-container">

        {/* 分类按钮：选中项加 .active 高亮 */}
        <div className="cat-nav" role="tablist" aria-label="产品分类">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-btn${active === cat.id ? ' active' : ''}`}
              onClick={() => setActive(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* 商品面板：只显示当前选中分类的卡片 */}
        <div className="cat-panels">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`cat-panel${active === cat.id ? ' active' : ''}`}
            >
              {cat.cards
                .filter((p) => p.onSale !== false)   // 后台下架的商品（onSale=false）不显示
                .map((p) => (
                <div className={`cat-card${cat.big ? ' big-card' : ''}`} key={p.name}>
                  <div className="cat-media">
                    <img src={p.img} alt={p.name} />
                    {/* 收藏爱心：未登录点它也会被 FavoritesContext 忽略（内部判断） */}
                    <button
                      className={`fav-heart${isFav(p.name) ? ' active' : ''}`}
                      onClick={() => toggle({ name: p.name, price: p.price, img: p.img, category: cat.label })}
                      aria-label={isFav(p.name) ? '取消收藏' : '收藏'}
                    >
                      <i className="fa-solid fa-heart"></i>
                    </button>
                  </div>
                  <div className="cat-copy">
                    <h3>{p.name}</h3>
                    <p className="cat-tag">{p.tag}</p>
                    <p className="cat-desc">{p.desc}</p>
                    <ul className="cat-specs">
                      {p.specs.map((s) => <li key={s}>{s}</li>)}
                    </ul>
                    <span className="cat-price">{p.price}</span>
                    {/* 操作区：左侧"进一步了解"（蓝色下划线链接），右侧"购买"按钮
                        只有 MacBook Pro 有真实购买页可跳转，其他商品购买按钮写死（禁用） */}
                    <div className="cat-cta">
                      <a href="#" className="cat-learn-more">进一步了解</a>
                      {p.name.includes('MacBook Pro') ? (
                        <Link to="/buy-mac" className="cat-buy-btn">购买</Link>
                      ) : (
                        <span className="cat-buy-btn disabled">购买</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

      </div>
    </section>
  )
}

export default CategorySection
