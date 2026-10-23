import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useCart } from '../context/CartContext'
import { useAuth } from '../context/AuthContext'
import Gallery from '../components/Gallery'
import '../styles/BMac.css'

// B-Mac 购买页：选择机型 / 芯片 / 显示屏 / 颜色后加入购物袋
// 用 focus 记录"最近点了哪一组"，决定左侧展示区显示哪组图片

// 机型配置：名称 / 价格 / 图片组；base 是起价（纯数字方便算钱），stock 是库存
type Model = { name: string; price: string; images: string[]; base: number; stock: number }

const MODELS: Record<string, Model> = {
  mbp14: {
    name: '14 英寸 MacBook Pro',
    price: 'RMB 15,999 或 RMB 667/月 (24期) 起',
    base: 15999,
    stock: 18,
    images: ['/B-Mac-img/mac-14-1.png', '/B-Mac-img/mac-14-2.png'],
  },
  mbp16: {
    name: '16 英寸 MacBook Pro',
    price: 'RMB 19,999 或 RMB 777/月 (24 期) 起',
    base: 19999,
    stock: 5,
    images: ['/B-Mac-img/mac-16-1.png', '/B-Mac-img/mac-16-2.png', '/B-Mac-img/mac-16-3.png'],
  },
}

// 芯片选项：M5 为基准，Pro/Max 显示"起步"加价；delta 用于计算总价（近似官网价格）
const CHIPS = [
  { id: 'm5', name: 'M5', delta: 0 },
  { id: 'm5pro', name: 'M5 Pro', price: '+RMB 5,200 起', delta: 5200 },
  { id: 'm5max', name: 'M5 Max', price: '+RMB 10,000 起', delta: 10000 },
]

// 显示屏选项：纳米纹理需加价（用户确认的官方价）；delta 参与动态差价与总价
const DISPLAYS = [
  { id: 'standard', name: '标准显示器', delta: 0 },
  { id: 'nanotexture', name: '纳米纹理显示器', delta: 1013 },
]

// 芯片 / 屏幕特写图
const CHIP_IMG = '/B-Mac-img/芯片.png'
const SCREEN_IMG: Record<string, string> = {
  standard: '/B-Mac-img/标准屏幕.png',
  nanotexture: '/B-Mac-img/纳米玻璃.png',
}

// 颜色选项
const COLORS = [
  { id: 'black', hex: '#1d1d1f', label: '深空黑色' },
  { id: 'silver', hex: '#e3e4e6', label: '银色' },
]

// 内存定制：随芯片分档；delta 为绝对加价，按钮显示相对当前选择的差价
const MEMORY: Record<string, Opt[]> = {
  m5: [
    { id: '24g', name: '24GB 统一内存', delta: 0 },
    { id: '36g', name: '36GB 统一内存', delta: 1620 },
    { id: '48g', name: '48GB 统一内存', delta: 3240 },
  ],
  m5pro: [
    { id: '48g', name: '48GB 统一内存', delta: 0 },
    { id: '64g', name: '64GB 统一内存', delta: 3240 },
    { id: '128g', name: '128GB 统一内存', delta: 9720 },
  ],
  m5max: [
    { id: '48g', name: '48GB 统一内存', delta: 0 },
    { id: '64g', name: '64GB 统一内存', delta: 3240 },
    { id: '128g', name: '128GB 统一内存', delta: 9720 },
  ],
}

// 硬盘定制：1TB 为基准；delta 参与动态差价与总价
const STORAGES: Opt[] = [
  { id: '1t', name: '1TB 固态硬盘', delta: 0 },
  { id: '2t', name: '2TB 固态硬盘', delta: 3240 },
  { id: '4t', name: '4TB 固态硬盘', delta: 9720 },
  { id: '8t', name: '8TB 固态硬盘', delta: 22680 },
]

// 充电器：固定为 96W，不可选择（只展示）
const CHARGER = '96W USB-C 电源适配器'

// 当前展示的焦点：model / chip / screen / color
type Focus = 'model' | 'chip' | 'screen' | 'color'

// 通用选项：id/名称；price 是固定文案（如芯片"起步"价），delta 是绝对加价（用于动态差价与总价）
type Opt = { id: string; name: string; price?: string; delta?: number }

// 相对差价文案：0 → "已选"，正 → "+RMB x"，负 → "-RMB x"
function deltaText(delta: number): string {
  if (delta === 0) return '已选'
  return delta > 0 ? `+RMB ${delta.toLocaleString()}` : `-RMB ${Math.abs(delta).toLocaleString()}`
}

function OptGroup({
  title,
  sub,
  options,
  value,
  onPick,
  baseDelta,
}: {
  title: string
  sub: string
  options: Opt[]
  value: string
  onPick: (id: string) => void
  baseDelta?: number   // 当前选中项的 delta：传入后按钮显示相对差价，否则显示固定 price
}) {
  return (
    <div className="bmac-group">
      <h3 className="bmac-group-title">
        {title}
        <span className="bmac-group-sub">{sub}</span>
      </h3>
      <div className="bmac-opt-list">
        {options.map((opt) => {
          // 价格文案：有 baseDelta 时算相对差价，否则用固定 price
          const priceText = baseDelta !== undefined && opt.delta !== undefined
            ? deltaText(opt.delta - baseDelta)
            : opt.price
          return (
            <button
              key={opt.id}
              className={`bmac-opt-btn${value === opt.id ? ' active' : ''}`}
              onClick={() => onPick(opt.id)}
            >
              <span className="bmac-opt-name">{opt.name}</span>
              {priceText && <span className="bmac-opt-price">{priceText}</span>}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BMac() {
  // 从购物车上下文拿加购函数；登录态 + 跳转函数（未登录加购时跳登录页）
  const { addToCart } = useCart()
  const { user } = useAuth()
  const navigate = useNavigate()

  // 四个选项组各自独立高亮
  const [model, setModel] = useState('mbp14')
  const [chip, setChip] = useState('m5')
  const [display, setDisplay] = useState('standard')
  const [color, setColor] = useState('black')
  // 配置定制：内存（随芯片分档）+ 硬盘（固定选项）；默认收起，点"编辑"展开
  const [memory, setMemory] = useState(MEMORY.m5[0].id)
  const [storage, setStorage] = useState(STORAGES[0].id)
  const [configOpen, setConfigOpen] = useState(false)
  // focus：最近点了哪一组 → 决定展示区显示哪组图
  const [focus, setFocus] = useState<Focus>('model')
  // 当前展示的图片组（轮播序号由 Gallery 组件内部管理）
  const [images, setImages] = useState<string[]>(MODELS.mbp14.images)

  // 芯片切换时，若当前内存不在新档位里（如 M5 的 24G 换成 M5 Pro），回退到该档位第一项
  useEffect(() => {
    if (!MEMORY[chip].some((m) => m.id === memory)) {
      setMemory(MEMORY[chip][0].id)
    }
  }, [chip])

  // focus / 机型 / 显示屏变化时重算图片组；颜色没有对应图，保持当前图片
  useEffect(() => {
    let imgs: string[] | null = null
    if (focus === 'chip') imgs = [CHIP_IMG]
    else if (focus === 'screen') imgs = [SCREEN_IMG[display]]
    else if (focus === 'model') imgs = MODELS[model].images
    // focus === 'color' → imgs 保持 null，不换图

    if (!imgs) return
    setImages(imgs)      // 换图组 → Gallery 组件内部会自己回到第一张
  }, [focus, model, display])

  // 当前各选项的绝对加价（delta），用于计算总价
  const chipDelta = CHIPS.find((c) => c.id === chip)?.delta ?? 0
  const displayDelta = DISPLAYS.find((d) => d.id === display)?.delta ?? 0
  const memoryDelta = MEMORY[chip].find((m) => m.id === memory)?.delta ?? 0
  const storageDelta = STORAGES.find((s) => s.id === storage)?.delta ?? 0
  // 总价 = 机型基价 + 芯片/显示屏/内存/硬盘的加价总和，随选择实时变化
  const total = MODELS[model].base + chipDelta + displayDelta + memoryDelta + storageDelta

  // 把当前选中的配置拼成一行规格描述（写进购物车 / 订单）
  const specs = [
    MODELS[model].name,
    CHIPS.find((c) => c.id === chip)?.name ?? chip,
    DISPLAYS.find((d) => d.id === display)?.name ?? display,
    COLORS.find((c) => c.id === color)?.label ?? color,
    MEMORY[chip].find((m) => m.id === memory)?.name ?? memory,
    STORAGES.find((s) => s.id === storage)?.name ?? storage,
  ].join(' / ')

  // 加购：未登录先跳登录页（登录后返回再手动加购）；已登录按当前配置加购
  const handleAdd = () => {
    if (!user) {
      navigate('/login')
      return
    }
    addToCart({
      name: `${MODELS[model].name} (¥${total.toLocaleString()})`,
      price: `¥${total.toLocaleString()}`,
      img: MODELS[model].images[0],
      specs,
    })
  }

  // 库存状态：多显示"现货充足"，少显示"仅剩 N 台"，0 为缺货
  const stock = MODELS[model].stock

  return (
    <main className="bmac-main" aria-label="购买 Mac">
      {/* 标题 + 动态总价（随配置选择实时变化） */}
      <div className="bmac-heading">
        <h1>购买MacBook Pro</h1>
        <p className="bmac-price-note">
          ¥{total.toLocaleString()} 起{chipDelta + displayDelta + memoryDelta + storageDelta > 0 && `（含配置加价 ¥${(chipDelta + displayDelta + memoryDelta + storageDelta).toLocaleString()}）`}
        </p>
      </div>

      {/* 两栏布局：左轮播图 / 右选项 */}
      <div className="bmac-layout">
        {/* 左：大图轮播（轮播逻辑全在 Gallery 组件里，这里只传图片） */}
        <Gallery
          images={images}
          name={focus === 'model' ? MODELS[model].name : undefined}
        />

        {/* 右：配置侧边栏 */}
        <aside className="bmac-options" aria-label="购买选项">
          <OptGroup
            title="机型"
            sub="选择尺寸"
            options={[
              { id: 'mbp14', name: '14 英寸 MacBook Pro', price: 'RMB 15，999 起' },
              { id: 'mbp16', name: '16 英寸 MacBook Pro', price: 'RMB 19，999 起' },
            ]}
            value={model}
            onPick={(id) => { setModel(id); setFocus('model') }}
          />

          <OptGroup
            title="芯片"
            sub="强大配置任你选择"
            options={CHIPS}
            value={chip}
            onPick={(id) => { setChip(id); setFocus('chip') }}
          />

          <OptGroup
            title="显示屏"
            sub="选择适合你使用场景的屏幕类型"
            options={DISPLAYS}
            value={display}
            baseDelta={displayDelta}
            onPick={(id) => { setDisplay(id); setFocus('screen') }}
          />

          {/* 颜色：圆形小按钮，只高亮、不换图 */}
          <div className="bmac-group">
            <h3 className="bmac-group-title">
              颜色
              <span className="bmac-group-sub">选择你喜欢的颜色</span>
            </h3>
            <div className="bmac-color-list">
              {COLORS.map((c) => (
                <button
                  key={c.id}
                  className={`bmac-color-btn${color === c.id ? ' active' : ''}`}
                  style={{ background: c.hex }}
                  onClick={() => { setColor(c.id); setFocus('color') }}
                  title={c.label}
                  aria-label={c.label}
                />
              ))}
            </div>
          </div>

          {/* 配置定制：内存 + 硬盘 + 充电器（默认收起，点"编辑"展开） */}
          <div className="bmac-group">
            <div className="bmac-config-head">
              <h3 className="bmac-group-title">
                配置定制
                <span className="bmac-group-sub">保持标准配置或按需调整</span>
              </h3>
              {/* 编辑/收起按钮：切换配置区展开状态 */}
              <button className="bmac-config-toggle" onClick={() => setConfigOpen(!configOpen)}>
                {configOpen ? '收起' : '编辑'}
              </button>
            </div>

            {configOpen && (
              <>
                {/* 内存定制：选项随芯片分档，按钮显示相对当前选择的差价 */}
                <p className="bmac-config-label">内存</p>
                <div className="bmac-opt-list">
                  {MEMORY[chip].map((m) => (
                    <button
                      key={m.id}
                      className={`bmac-opt-btn${memory === m.id ? ' active' : ''}`}
                      onClick={() => setMemory(m.id)}
                    >
                      <span className="bmac-opt-name">{m.name}</span>
                      <span className="bmac-opt-price">{deltaText((m.delta ?? 0) - memoryDelta)}</span>
                    </button>
                  ))}
                </div>

                {/* 硬盘定制：统一选项，按钮显示相对当前选择的差价 */}
                <p className="bmac-config-label">硬盘</p>
                <div className="bmac-opt-list">
                  {STORAGES.map((s) => (
                    <button
                      key={s.id}
                      className={`bmac-opt-btn${storage === s.id ? ' active' : ''}`}
                      onClick={() => setStorage(s.id)}
                    >
                      <span className="bmac-opt-name">{s.name}</span>
                      <span className="bmac-opt-price">{deltaText((s.delta ?? 0) - storageDelta)}</span>
                    </button>
                  ))}
                </div>

                {/* 充电器：固定 96W，不可选择，仅展示（突出显示） */}
                <p className="bmac-config-label">电源适配器</p>
                <div className="bmac-charger">
                  <span className="bmac-charger-current">当前</span>
                  <span className="bmac-charger-name">{CHARGER}</span>
                </div>
              </>
            )}
          </div>

          {/* 库存状态 */}
          <p className={`bmac-stock${stock === 0 ? ' out' : ''}`}>
            {stock > 10 ? '库存：现货充足' : stock > 0 ? `库存：仅剩 ${stock} 台` : '库存：暂时缺货'}
          </p>

          {/* 加入购物袋（按当前配置加购） */}
          <button className="bmac-add-btn" onClick={handleAdd} disabled={stock === 0}>
            加入购物袋
          </button>
        </aside>
      </div>
    </main>
  )
}

export default BMac
