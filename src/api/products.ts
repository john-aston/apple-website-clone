// 商品数据接口层：各页面统一从这里拉数据；后端为 json-server，数据存于项目根目录 db.json
import type { CSSProperties } from 'react'
import BASE from './config'

// ---------- ① 产品页类型（Mac / iPhone / iPad / Watch 共用） ----------

// 顶部滚动展示的一张产品小卡（ProductShowcase 的 items 项）
export type ShowcaseItem = {
  name: string
  img: string
}

// 分类区里的一张商品卡
export type ProductCard = {
  name: string
  tag: string
  desc: string
  specs: string[]
  price: string
  img: string
}

// 一个分类（含若干商品卡）；big: true 表示用大图卡（目前仅 iPhone 的"机型"分类使用）
export type Category = {
  id: string
  label: string
  big?: boolean
  cards: ProductCard[]
}

// 效用区的一张场景大图卡（UtilSection 的 items 项）
export type UtilItem = {
  img: string
  text: string
}

// 一个产品页的全部数据（对应 db.json 中每个页面的结构）
export type PageData = {
  showcase: ShowcaseItem[]
  categories: Category[]
  utilities: UtilItem[]
}

// ---------- ② Store 页类型 ----------

// Store 页的一张商品卡（滚动展示栏和轮播图共用）
export type StoreItem = {
  id: string
  name: string
  desc: string
  price: string
  installment: string
  img: string
}

export type StoreData = {
  showcase: StoreItem[]
  spotlight: StoreItem[]
}

// ---------- ③ Home 页类型 ----------

// Home 页的一张产品卡；logoStyle / imgStyle 是直接用于 style 属性的 CSS 样式对象，
// ctaType 是特殊按钮标记（目前仅 tv 卡片使用自定义按钮）
export type HomeProduct = {
  id: string
  theme: string
  logo: string
  logoStyle?: CSSProperties
  headline: string
  href: string
  buy?: string
  image: string
  imgStyle?: CSSProperties
  ctaType?: 'tv'
}

export type HomeData = {
  products: HomeProduct[]
}

// ---------- ④ fetch 封装 ----------

// json-server 默认运行在 3001 端口（见 package.json 的 server 脚本）

// 拉取某个产品页（/mac /iphone /ipad /watch）的数据；失败抛错，由页面显示"加载失败"
export async function getPageData(page: string): Promise<PageData> {
  const res = await fetch(`${BASE}/${page}`)
  if (!res.ok) {
    throw new Error(`请求失败：${res.status}`)
  }
  return res.json()
}

// 拉取 Store 页数据
export async function getStoreData(): Promise<StoreData> {
  const res = await fetch(`${BASE}/store`)
  if (!res.ok) {
    throw new Error(`请求失败：${res.status}`)
  }
  return res.json()
}

// 拉取 Home 页数据
export async function getHomeData(): Promise<HomeData> {
  const res = await fetch(`${BASE}/home`)
  if (!res.ok) {
    throw new Error(`请求失败：${res.status}`)
  }
  return res.json()
}
