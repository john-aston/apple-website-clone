// 大图横幅区：横向长方形，左侧主副标题文字、右侧整张大图
// 呈现方式与 iPad 页 Hero 区一致（左文右图），主标题醒目、副标题轻量

function ImageBanner({
  title,
  subtitle,
  img,
  alt,
}: {
  title: string
  subtitle?: string
  img: string
  alt?: string
}) {
  return (
    <section className="ip-banner">
      <div className="ip-banner-copy">
        <h2 className="ip-banner-title">{title}</h2>
        {subtitle && <p className="ip-banner-subtitle">{subtitle}</p>}
      </div>
      <div className="ip-banner-media">
        <img src={img} alt={alt ?? ''} />
      </div>
    </section>
  )
}

export default ImageBanner
