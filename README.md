# AERO-FOLD — 外贸旅行包官网

AERO-FOLD 品牌官网与后台管理系统。前台展示产品，产品卡片可跳转到独立的产品详情页；管理员可在后台维护产品资料，并用可视化区块自由搭建每个产品的详情页。

## 技术栈

- 前端：Vite 6 + React 19 + TypeScript + framer-motion + lucide-react
- 样式：Tailwind CSS 3（本地 PostCSS 编译，生产环境不再使用 CDN）
- 后端：Express 5 + Node.js 内置 SQLite（`node:sqlite`）
- 数据：SQLite，默认存放在 `server/data/webfold.db`
- 二维码：`qrcode-generator`（页面内生成 PNG）

> 需要 Node.js 22.5+（本项目在 Node 24 上开发验证），因为使用了内置的 `node:sqlite`。

## 本地开发

```bash
npm install
npm run dev
```

启动后：

| 地址 | 说明 |
| --- | --- |
| http://localhost:3000 | 前台首页 |
| http://localhost:3000/product/1 | 产品详情页（可直接打开/扫码） |
| http://localhost:3000/admin | 后台管理 |
| http://localhost:3001/api/health | API 健康检查 |

端口：前端 `3000`，API `3001`，Vite 会把 `/api` 代理到 API 服务。
`npm run dev:web` / `npm run dev:server` 可单独启动前端或后端。

首次启动时会自动建表，并写入 `server/data/seed.ts` 中的初始产品数据。

### 开发环境登录

未设置 `ADMIN_PASSWORD` 时，开发环境默认密码为 **`admin123`**，启动日志里也会提示。
生产环境必须显式设置密码，否则服务会拒绝启动登录校验。

## 环境变量

在启动 API 的进程中设置（本地可写在 `.env` 外的 shell / 进程管理器配置里）：

| 变量 | 必填 | 说明 |
| --- | --- | --- |
| `ADMIN_PASSWORD` | 生产必填 | 后台登录密码 |
| `AUTH_SECRET` | 生产必填 | 会话签名密钥，至少 16 个字符，建议 `openssl rand -base64 32` 生成 |
| `NODE_ENV` | 部署时设为 `production` | 生产模式下启用 `secure` Cookie，并要求上述两个变量 |
| `VITE_API_BASE_URL` | 否 | 前后端不同域时的 API 地址；同域反代 `/api` 时留空 |
| `SITE_URL` | 生产建议必填 | 正式域名（如 `https://www.aero-fold.com`，不带末尾 `/`），用于 canonical、Open Graph、sitemap.xml；也可写在项目根目录 `.env` |
| `SEO_AUTO_REFRESH` | 否 | 设为 `false` 可关闭后台修改产品后的静态 SEO 页面自动刷新 |

示例：

```bash
export NODE_ENV=production
export ADMIN_PASSWORD='your-strong-password'
export AUTH_SECRET="$(openssl rand -base64 32)"
npm run dev:server
```

## 后台功能

访问 `/admin`，输入管理员密码登录。

### 产品资料

- 新建产品：名称、分类、价格（美元，留空显示 “Price on request”）、描述、图片、是否发布。
- 图片既可以直接粘贴外链，也可以上传本地文件（JPG / PNG / WebP / GIF / AVIF，单张不超过 8MB）。第一张为封面。
- 编辑资料：修改上述字段；也可以删除产品（会一并删除该产品的详情页区块）。
- 排序：拖动产品卡片右上角的手柄，即可调整产品在首页的展示顺序，松开即自动保存。
- 未发布的产品不会出现在首页，但管理员仍可通过后台预览。

### 详情页搭建

每个产品都有独立详情页 `/product/<id>`，由两部分组成：

1. **固定产品信息区**：图片、标题、分类、价格、描述、WhatsApp 询价按钮、分享/二维码按钮。
2. **自定义区块**：管理员在“编辑详情页”中自由添加、排序、编辑。

支持 8 类区块：

| 区块 | 用途 |
| --- | --- |
| 横幅大图 | 整屏宽度的大图 + 标题，适合开篇 |
| 文字段落 | 居中的标题 + 多段正文 |
| 图文左右 | 左图右文/右图左文，可带按钮 |
| 产品参数 | 两列表格，尺寸、重量、材质等 |
| 卖点卡片 | 图标 + 标题 + 说明，三列网格 |
| 图片画廊 | 多图网格 |
| 常见问题 | 可折叠问答 |
| 询价行动区 | 深色收尾区块，带 WhatsApp 按钮 |

编辑时右侧有手机框实时预览，未保存也会同步；保存后立即对访客生效。区块左侧的手柄可拖动排序，移动端也可用上下箭头调整。
“恢复默认”会清除自定义区块，回到由产品描述/图片自动生成的默认页面。

### 二维码与分享

详情页右上角“Scan / Share”会生成当前页面的二维码，可复制链接或下载 PNG。
二维码内容取浏览器当前访问的域名，因此部署后请使用正式域名访问，二维码才会指向正确地址。

## 数据与备份

- 数据库：`server/data/webfold.db`（WAL 模式，运行时可能还有 `-wal` / `-shm` 文件）。
- 本地上传的图片：`server/uploads/`。产品图片也可以使用外链，外链不会占用本地空间。
- 删除产品、或在产品编辑中移除图片时，服务端会清理不再被任何产品引用的本地图片文件。
- 备份：停止服务后同时复制 `server/data/` 与 `server/uploads/` 两个目录；数据库也可以使用 SQLite 的 `.backup` 命令导出单文件。

## SEO（Google 搜索优化）

项目已内置面向 Google 的技术 SEO 与内容结构，无需额外插件。

### 1. 配置正式域名

复制 `.env.example` 为 `.env`，把 `SITE_URL` 改成正式域名：

```bash
cp .env.example .env
# 编辑 .env
SITE_URL=https://www.your-domain.com
```

`SITE_URL` 用于生成绝对 canonical、`og:url`、`og:image`、`hreflang` 与 `sitemap.xml`。未设置时构建仍可进行，但会跳过 sitemap，社交分享图也可能无法抓取。

### 2. 构建时生成可抓取的静态页面

```bash
npm run build
```

`vite build` 之后会自动执行 `scripts/generate-seo.ts`，在 `dist/` 中生成：

| 文件 | 作用 |
| --- | --- |
| `dist/index.html` | 首页 title/description/OG/Twitter/Organization/WebSite/ItemList/FAQPage |
| `dist/product/<id>/index.html` | 每个已发布产品的独立 title/description/canonical/OG/Product/Breadcrumb/FAQ 结构化数据，以及 `<noscript>` 正文 |
| `dist/admin/index.html` | 后台页面 `noindex, nofollow` |
| `dist/sitemap.xml` | 首页 + 全部已发布产品（含图片 sitemap），仅在设置 `SITE_URL` 后生成 |
| `dist/robots.txt` | 允许抓取前台，禁止 `/admin` 与 `/api/` |
| `dist/404.html` | 品牌化 404 页面，`noindex` |

Nginx 使用下面的 `try_files` 写法时，会优先命中 `dist/product/1/index.html`，所以产品页对 Google 和 WhatsApp/Facebook 等不执行 JS 的抓取器直接可见；未知地址会返回真正的 404，而不是状态码 200 的空壳页。

### 3. 后台修改后自动刷新

API 服务运行时会监听后台的写操作（新增/编辑/删除/排序产品、保存详情区块），约 1.2 秒防抖后重新生成静态页面。要求运行 API 的进程对 `dist/` 有写权限。

也可以手动执行：

```bash
npm run seo
```

如果部署时 `dist/` 由 CI 构建、服务器只读，请把 `SEO_AUTO_REFRESH=false`，并在每次发布时重新执行 `npm run build`。

### 4. 提交 Google Search Console

1. 在 [Google Search Console](https://search.google.com/search-console) 添加资源，推荐使用「网域」验证并添加 DNS TXT 记录。
2. 提交 sitemap：`https://www.your-domain.com/sitemap.xml`。
3. 对首页和 2–3 个产品页使用「网址检查」→「请求编入索引」。
4. 用「富媒体搜索结果测试」检查 Product / FAQ / Breadcrumb 结构化数据。

### 5. 内容建议

- 初始 32 个产品的标题、描述已改为带颜色/视图的描述性文案；正式上架时请在后台替换为真实品名、尺寸、材质、容量和价格。标题与描述越具体，长尾词覆盖越好。
- 每个产品保持唯一 title 与 description；不要堆砌关键词。
- 产品图建议使用真实场景图 + 白底图，文件名用英文关键词（如 `foldable-travel-duffel-black.webp`），并填写 alt。
- 首页已有 H1「Foldable travel bags」、批发/OEM 区块与 6 条 FAQ；新增内容时保持一个页面一个 H1。
- 不要添加虚假的评价、价格或认证；结构化数据中的 Product 只有在后台填写价格时才会输出 `offers`。

### 6. 性能与抓取

- 已移除 Tailwind CDN，改为构建时生成约 36KB CSS；后台与二维码弹窗按路由懒加载。
- 图片使用 `loading="lazy"`（首屏主图除外）、固定宽高与 `decoding="async"`。
- 生产环境开启 Nginx gzip/brotli；HTML 建议 `Cache-Control: no-cache`，带 hash 的 `/assets/` 可长缓存。
- 上线后在 PageSpeed Insights 检查 LCP/CLS/INP；产品图建议转 WebP/AVIF 并压缩到 200KB 以内。

## 构建与部署

```bash
npm install     # 需要完整依赖（生产启动使用 tsx）
npm run build   # 生成前端静态文件到 dist/
npm start       # 启动 API：tsx server/index.ts
```

**宝塔面板的完整部署步骤见 [DEPLOY.md](DEPLOY.md)**（Nginx 配置、PM2、HTTPS、备份、常见问题）。

部署时：

1. 用 Nginx/Caddy 等托管 `dist/`。
2. 将 `/api` 反向代理到 API 服务（默认 `3001`）。
3. **配置回退**：静态文件优先，后台嵌套路由回退到 `/admin/index.html`，其余未知路径返回 404（配置见下方示例）。构建已为每个产品生成 `dist/product/<id>/index.html`，会优先命中静态页。
4. 构建前设置 `SITE_URL`，否则不会生成 `sitemap.xml`。

Nginx 示例：

```nginx
root /var/www/aero-fold/dist;

client_max_body_size 10m;

location /api/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_set_header Host $host;
  proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  proxy_set_header X-Forwarded-Proto $scheme;
}

# 本地上传的产品图片由 API 服务托管；也可以直接把 server/uploads 作为静态目录。
location /uploads/ {
  proxy_pass http://127.0.0.1:3001;
  proxy_set_header Host $host;
}

location / {
  try_files $uri $uri/ @spa;
}

location @spa {
  if ($uri ~ ^/admin(?:/|$)) {
    rewrite ^ /admin/index.html last;
  }
  return 404;
}

error_page 404 /404.html;
location = /404.html {
  internal;
}
```

生产环境请务必：

- 设置强 `ADMIN_PASSWORD` 与随机 `AUTH_SECRET`；
- 使用 HTTPS（会话 Cookie 在生产模式下为 `Secure`）；
- 让 API 信任反向代理（代码已在 `NODE_ENV=production` 时开启 `trust proxy`）。

## 目录结构

```
components/          前台与后台 React 组件
  admin/             后台：登录、产品列表、产品表单、详情页编辑器、实时预览
  product/           详情页：产品信息、区块渲染、二维码弹窗
lib/                 路由、API 封装、格式化、区块定义
server/              Express API
  db.ts              SQLite 建表、迁移、数据访问
  routes/            auth / products / admin 路由
  data/seed.ts       初始产品数据
  uploads/           本地上传的产品图片（运行时生成）
types/product.ts     共享类型
server/data/         SQLite 数据库（运行时生成）
```

## 说明与限制

- 后台为单管理员模式，未实现多用户/角色权限。
- 上传图片保存在本地磁盘；多实例部署时需要共享存储（如对象存储），并自行调整上传实现。
- SQLite 适合单机部署；多实例部署需要改用共享数据库。
