// 页脚：免责声明、三列链接、版权与法律链接
// 链接数据全部来自下方 FOOTER_COLUMNS / FOOTER_LEGAL 常量
function Footer() {
  return (
    <footer>
      {/* 免责声明 */}
      <div className="foot-notes">
        <ul>
          <li>
            * 有资格的购买人在活动地点购买符合条件的产品并搭配促销产品时，可享促销优惠金额。每个有资格的购买人购买符合条件的产品时，仅限搭配购买一件促销产品。本次优惠活动仅支持部分付款方式，详情请参阅结账页面。须遵守此处列出的条款和条件。
          </li>
          <li>
            1. 折抵换购服务由 Apple 的折抵服务合作伙伴提供。折抵金额报价仅为预估价，实际折抵金额可能低于预估价值，具体金额取决于设备的状况、配置、推出年份，以及发售国家或地区。并非所有设备均有资格获得第三方折抵服务合作伙伴提供的设备折抵金额或 Apple 提供的购新优惠。年满 18 周岁及以上者才可参与本计划。现有设备的折抵金额可用于折抵购买新的 Apple 设备。实际折抵金额取决于收到的符合折抵条件的设备情况是否与评估报价时你提供的设备描述相符合。可能需按照新设备的全额售价缴纳增值税。店内折抵需出示政府颁发并附有照片的有效身份证件 (当地法律可能会要求存储该信息)。该服务可能仅在部分 Apple Store 零售店提供，在线换购和店内换购的折抵金额可能有所不同。某些 Apple Store 零售店可能有不同要求。Apple 的折抵服务合作伙伴保留出于任何原因拒绝、取消任何折抵交易或限制任何设备 (及其数量) 的权利。如需获得有关折抵及设备回收服务的更多信息，请咨询 Apple 的折抵服务合作伙伴。需要遵守 Apple 的折抵服务合作伙伴的其他条款。
          </li>
        </ul>
      </div>

      <hr />

      {/* 三列链接：由常量数据 map 渲染 */}
      <div className="footer-container">
        {FOOTER_COLUMNS.map((col) => (
          <div className="footer-list" key={col.title}>
            <h3>{col.title}</h3>
            {col.links.map((name) => (
              <p key={name}><a href="#">{name}</a></p>
            ))}
          </div>
        ))}
      </div>

      <hr />

      {/* 版权信息 + 法律链接，链接之间用 | 分隔 */}
      <div className="footer-bottom">
        <div className="copyright">Copyright © 2026 Apple Inc. 保留所有权利。</div>
        <div className="footer-links">
          {FOOTER_LEGAL.map((name, i) => (
            <span key={name}>
              <a href="#">{name}</a>
              {i < FOOTER_LEGAL.length - 1 && <span>|</span>}
            </span>
          ))}
        </div>
      </div>

      <div className="footer-country">
        中国 <a href="#">更改地区</a>
      </div>
    </footer>
  )
}

const FOOTER_COLUMNS = [
  { title: '购物与学习', links: ['Mac', 'iPad', 'iPhone', 'Watch', 'TV', 'Music', 'AirPods', 'HomePod', 'iPod touch', '配件', '礼品卡'] },
  { title: '服务', links: ['Apple Music', 'Apple TV+', 'Apple Fitness+', 'Apple News+', 'Apple Arcade', 'iCloud', 'Apple One', 'Apple Card', 'Apple Books', 'App Store'] },
  { title: 'Apple Store', links: ['查找零售店', '在线选购', 'Genius Bar 天才吧', 'Today at Apple', 'Apple Camp', 'Apple Store App', '翻新和优惠', '分期付款', 'Apple Trade In 换购计划', '订单状态', '购物帮助'] },
]

const FOOTER_LEGAL = ['隐私政策', '使用条款', '销售政策', '法律信息', '网站地图']

export default Footer
