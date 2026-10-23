# Apple Store 克隆商城（React 全栈项目）

一个仿 Apple 官网与 Apple Store 的**科技产品展示与商城系统**，覆盖完整的电商业务闭环：
后台管理商品 → 前台浏览 → 配置购买 → 加入购物袋 → 结算下单 → 订单管理。

前端 **React + TypeScript**，后端 **Node.js + Express**，数据库 **SQLite**（关系型数据库，SQL 语法）。

## 技术栈

| 层 | 技术 | 说明 |
| --- | --- | --- |
| 前端 | React 19 + TypeScript | 组件化 + 声明式渲染 |
| 构建 | Vite 8 | 开发服务器 + 打包 + 路由懒加载 |
| 路由 | react-router-dom 6 | 页面路由（含懒加载与受保护路由） |
| 状态 | React Context | 登录 / 购物车 / 收藏 全局状态 |
| 后端 | Node.js + Express 5 | REST 接口服务（端口 3001） |
| 数据库 | SQLite（node:sqlite） | 文件型关系型数据库，数据在 `server/data.db` |
| 安全 | SHA-256（node:crypto） | 密码哈希存储，不存明文 |

## 功能一览

- **官网首页**：导航栏、产品大图、产品卡片（数据来自后端接口）
- **Store 商店页**：产品滚动展示 + 新品轮播
- **产品分类页**：Mac / iPad / iPhone / Watch 四个页面（分类切换 + 商品卡 + 收藏爱心 + 购买/了解更多入口）
- **商品购买页**（/buy-mac）：机型 / 芯片 / 显示屏 / 颜色 / 内存 / 硬盘多级配置，**价格实时联动**（delta 加价引擎），配置定制可展开/收起，库存状态
- **登录注册**：注册 / 登录 / 退出 / 状态保持（localStorage + 后端验证）/ 密码 SHA-256 哈希存储
- **购物袋**：勾选结算 / 数量调整 / 规格显示 / 按登录用户隔离存储（后端 carts 表）
- **订单**：收货信息表单（前端校验）/ 生成订单（存快照）/ 订单列表 / 订单详情 / 取消订单
- **收藏**：商品卡爱心收藏 / 取消收藏 / 收藏列表页
- **账户中心**：查看资料 / 修改密码 / 订单与收藏入口 / 退出
- **后台管理**（/admin）：商品增删改查与上下架、分类管理与排序、订单管理与状态筛选，**修改数据真实影响前台展示**

## 快速开始

### 环境要求

- Node.js 22+（SQLite 使用内置 `node:sqlite`）

### 安装依赖

```bash
npm install
```

> 若 npm 因缓存权限报错，可指定缓存目录：`npm install --cache /tmp/npm-cache-john`

### 启动（两个终端）

```bash
# 终端 1：启动后端（Express + SQLite，端口 3001）
npm run server

# 终端 2：启动前端（Vite 开发服务器，端口 5173）
npm run dev
```

浏览器打开 **http://localhost:5173/**

> 首次启动后端会自动创建 `server/data.db` 并把 `db.json` 中的旧数据（用户 / 产品展示数据）迁移进去。

## 环境变量

复制 `.env.example` 为 `.env`（或自行创建）并修改：

```bash
# 后端 API 地址
# 本地开发默认 http://localhost:3001
# 部署后改为线上后端地址，例如 https://xxx.onrender.com
VITE_API_BASE=http://localhost:3001
```

前端所有接口请求统一从 `src/api/config.ts` 读取该地址，改环境变量即可切换后端，无需改动代码。

## 路由一览

| 路径 | 页面 | 说明 |
| --- | --- | --- |
| `/` | 首页 | 产品展示 |
| `/store` | Store 商店 | 轮播展示 |
| `/mac` `/ipad` `/iphone` `/watch` | 产品分类页 | 分类切换 + 商品卡 |
| `/buy-mac` | 商品购买页 | 多级配置 + 动态价格 |
| `/login` | 登录 / 注册 | |
| `/cart` | 购物袋 | 🔒 需登录 |
| `/checkout` | 结算 | 🔒 需登录 |
| `/orders` | 我的订单 | 🔒 需登录 |
| `/orders/:id` | 订单详情 | 🔒 需登录 |
| `/favorites` | 我的收藏 | 🔒 需登录 |
| `/account` | 账户中心 | 🔒 需登录 |
| `/admin` | 后台管理 | 🔒 需登录 |

🔒 = 受保护路由（未登录自动跳转登录页）。

## 目录结构

```
apple-clone-react/
├── index.html              # 入口 HTML
├── .env                    # 环境变量（VITE_API_BASE）
├── public/                 # 静态图片资源
├── server/                 # 后端
│   ├── index.js            #   Express 服务（全部 REST 接口）
│   └── db.js               #   SQLite 建表 + 数据迁移
├── db.json                 # 旧数据源（首次启动迁移进 SQLite）
└── src/
    ├── main.tsx            # 入口：Provider 嵌套（Auth → Cart → Favorites）
    ├── App.tsx             # 路由表（懒加载 + 受保护路由）
    ├── api/                # 接口层（前后端唯一通信入口）
    │   ├── config.ts       #   API 地址统一配置（读环境变量）
    │   ├── auth.ts         #   登录 / 注册 / 改密码
    │   ├── products.ts     #   产品展示数据
    │   ├── cart.ts         #   购物车
    │   ├── orders.ts       #   订单
    │   ├── favorites.ts    #   收藏
    │   └── admin.ts        #   后台管理
    ├── context/            # 全局状态（Context）
    │   ├── AuthContext.tsx     #   登录状态
    │   ├── CartContext.tsx     #   购物车
    │   └── FavoritesContext.tsx #  收藏
    ├── components/         # 共享组件
    │   ├── Header.tsx  Footer.tsx
    │   ├── ProtectedRoute.tsx  #   路由守卫
    │   ├── PageStatus.tsx      #   加载/错误/重试三态
    │   ├── ProductShowcase.tsx #   产品轮播
    │   ├── CategorySection.tsx #   分类商品卡
    │   ├── UtilSection.tsx     #   效用区
    │   ├── SliderCards.tsx     #   横滑卡片区
    │   ├── ImageBanner.tsx     #   大图横幅区
    │   └── Gallery.tsx         #   图片轮播（购买页）
    ├── pages/              # 页面（14 个）
    │   ├── Home / Store / Mac / IPad / IPhone / Watch
    │   ├── BMac（购买页）/ Login / Cart / Checkout
    │   ├── Orders / OrderDetail / Favorites / Account / Admin
    └── styles/             # 各页面 CSS
```

## 数据库设计（SQLite）

| 表 | 主要字段 | 说明 |
| --- | --- | --- |
| users | id, username, password | 用户（密码为 SHA-256 哈希） |
| carts | id, username, items | 购物车（每用户一行，items 存 JSON 字符串） |
| orders | id, username, items, total, address, status, createdAt | 订单（items/address 存快照 JSON） |
| favorites | id, username, name, price, img, category | 收藏 |
| pages | key, data | 产品展示数据（mac/iphone/home 等整页 JSON） |

## 构建与部署

### 本地构建

```bash
npm run build      # 打包产物到 dist/
npm run preview    # 本地预览打包结果
```

### 部署说明

本项目为前后端分离结构，部署时需要两部分：

1. **前端**（dist/ 静态文件）：部署到任意静态托管（Vercel / Nginx / 云服务器静态目录等）。因使用 BrowserRouter，需配置 SPA 回退（所有路径指向 index.html）。
2. **后端**（server/）：需要能运行 Node.js 的环境（云服务器 / Render / Railway 等），启动命令 `node server/index.js`，首次启动自动建库。

部署后设置前端环境变量 `VITE_API_BASE` 指向线上后端地址，重新构建即可连通。

## 常用命令

| 命令 | 作用 |
| --- | --- |
| `npm run dev` | 启动前端开发服务器 |
| `npm run server` | 启动后端（Express + SQLite） |
| `npm run build` | 构建前端产物到 dist/ |
| `npm run preview` | 预览构建产物 |
| `npm run lint` | Oxlint 代码检查 |

## 安全说明

- 密码使用 **SHA-256 哈希**存储，登录时后端比对，数据库不存明文、接口不返回密码
- SQL 使用参数占位符（`?`），防止 SQL 注入
- 受保护路由（购物车 / 订单 / 收藏 / 账户 / 后台）未登录自动跳转登录页

## 免责声明

本项目为个人学习与练习作品，与 Apple Inc. 无任何关联，也未获得其授权。页面中的 Apple 名称、产品图片及相关商标版权归 Apple Inc. 所有，仅用于非商业的学习展示。
