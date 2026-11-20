# 宝塔面板部署指南

本文以 **宝塔 Linux 面板 9.x + Nginx + Node.js 24 + PM2 + SQLite** 为例，部署 AERO-FOLD 官网。

## 0. 架构说明

```
浏览器
  │  https://your-domain.com
  ▼
Nginx（宝塔站点，托管 dist/ 静态文件）
  ├── /            → /www/wwwroot/webfold/dist（SPA 回退到 index.html）
  ├── /api/        → 反向代理 127.0.0.1:3001（Express API）
  └── /uploads/    → 反向代理 127.0.0.1:3001（本地上传的图片）
                        │
                        └── SQLite: server/data/webfold.db
```

要点：

- 前端是纯静态文件，构建后放在 `dist/`。
- API 只监听 `127.0.0.1:3001`，不直接对公网开放。
- 数据库是文件型 SQLite，**不需要安装 MySQL**。
- 上传图片保存在 `server/uploads/`，需要持久化和备份。
- 生产模式会话 Cookie 带 `Secure` 标记，**必须使用 HTTPS**，否则后台无法登录。

---

## 1. 准备工作

### 1.1 安装软件

在宝塔面板 →「软件商店」安装：

- **Nginx**（任意稳定版本）
- **Node.js 版本管理器**：安装 Node.js **24**（最低 22.5，因为使用了内置 `node:sqlite`）
- **PM2 管理器**（也可稍后用 npm 全局安装 PM2）

### 1.2 域名与端口

- 域名 A 记录解析到服务器公网 IP。
- 宝塔「安全」放行 **80、443**；云服务器安全组同样放行。
- **不要**对公网开放 3001 端口。
- 国内服务器需先完成域名备案。

### 1.3 确认 Node 版本

SSH 登录服务器后执行：

```bash
node -v   # 应 >= v22.5，推荐 v24.x
npm -v
```

如果提示找不到 `node`，在宝塔「Node.js 版本管理器」中设置命令行版本，或把对应版本的 bin 目录加入 PATH：

```bash
export PATH=/www/server/nodejs/v24.11.0/bin:$PATH
```

（实际版本号以面板显示为准。）

---

## 2. 上传代码

推荐目录：`/www/wwwroot/webfold`

方式一：Git（推荐，后续更新方便）

```bash
cd /www/wwwroot
git clone <你的仓库地址> webfold
```

方式二：本地打包成 zip，通过宝塔「文件」上传后解压到 `/www/wwwroot/webfold`。

确认根目录下有 `package.json`、`server/`、`src` 相关文件。

---

## 3. 安装依赖并构建前端

```bash
cd /www/wwwroot/webfold

# 国内服务器建议使用镜像源
npm config set registry https://registry.npmmirror.com

# 注意：不要加 --omit=dev / --production
# 生产启动使用 tsx（devDependency），需要完整安装依赖
npm install

npm run build
```

构建成功后会生成 `dist/`，并自动为首页、每个已发布产品生成静态 SEO HTML，以及 `robots.txt`；设置 `SITE_URL` 后还会生成 `sitemap.xml`。

> 构建前请先设置 `SITE_URL`（可写入项目根目录 `.env`），否则 canonical/OG 只能使用相对地址，且不会生成 sitemap。
>
> 如果服务器内存较小（1GB）导致构建被 kill，可临时增加 swap，或在本地构建后只上传 `dist/`。

---

## 4. 启动 API 服务

### 4.1 配置环境变量

| 变量 | 示例 | 说明 |
| --- | --- | --- |
| `NODE_ENV` | `production` | 必填，启用生产安全策略 |
| `ADMIN_PASSWORD` | 强密码 | 必填，后台登录密码 |
| `AUTH_SECRET` | `openssl rand -base64 32` | 必填，≥16 字符，会话签名密钥 |
| `HOST` | `127.0.0.1` | 只监听本机，由 Nginx 反代 |
| `PORT` | `3001` | 与 Nginx 配置一致 |
| `SITE_URL` | `https://www.your-domain.com` | 生产建议必填；也可写入项目根目录 `.env`。用于 canonical、OG 与 sitemap.xml |

生成密钥：

```bash
openssl rand -base64 32
```

### 4.2 用 PM2 启动（推荐）

在项目根目录创建 `ecosystem.config.cjs`（**不要提交到公开仓库**）：

```js
module.exports = {
  apps: [
    {
      name: 'webfold-api',
      cwd: '/www/wwwroot/webfold',
      script: 'node_modules/.bin/tsx',
      args: 'server/index.ts',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: 3001,
        ADMIN_PASSWORD: '替换成你的强密码',
        AUTH_SECRET: '替换成 openssl 生成的随机字符串',
        SITE_URL: 'https://www.your-domain.com',
      },
    },
  ],
};
```

启动并设置开机自启：

```bash
cd /www/wwwroot/webfold

# 如果面板已安装 PM2 管理器，可直接使用；否则：
npm install -g pm2

pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
# 按提示复制执行 pm2 startup 输出的那条命令
```

检查：

```bash
pm2 status
pm2 logs webfold-api --lines 50
curl http://127.0.0.1:3001/api/health
# 期望：{"ok":true}
```

首次启动会自动建表，并写入 `server/data/seed.ts` 中的 32 个初始产品。

修改环境变量后需要重新加载：

```bash
pm2 delete webfold-api
pm2 start ecosystem.config.cjs
pm2 save
```

### 4.3 目录权限

如果 PM2 以 `www` 用户运行，需要保证数据目录可写：

```bash
cd /www/wwwroot/webfold
mkdir -p server/data server/uploads
chown -R www:www server/data server/uploads
```

以 root 运行 PM2 时通常不会遇到权限问题，但仍建议保持上述目录归属。

---

## 5. 配置 Nginx 站点

### 5.1 添加站点

宝塔 →「网站」→「添加站点」：

- 域名：`your-domain.com` 和 `www.your-domain.com`
- 根目录：`/www/wwwroot/webfold/dist`
- PHP 版本：**纯静态**

### 5.2 修改站点配置

进入站点「设置」→「配置文件」，在 `server { ... }` 中加入/确认以下内容（**保留宝塔生成的 SSL 证书配置**）：

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    root /www/wwwroot/webfold/dist;
    index index.html;

    # 上传接口限制为 8MB，这里留出余量
    client_max_body_size 10m;

    # API 反向代理
    location ^~ /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 60s;
    }

    # 本地上传的图片（由 Node 服务托管）
    location ^~ /uploads/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_set_header Host $host;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Vite 构建产物，文件名带 hash，可长缓存
    location ^~ /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
        try_files $uri =404;
    }

    # 静态页优先；未知地址返回真正的 404，避免“软 404”浪费抓取预算
    location / {
        try_files $uri $uri/ @spa;
    }

    location @spa {
        # 后台嵌套路由没有静态目录，回退到后台 SPA 入口
        if ($uri ~ ^/admin(?:/|$)) {
            rewrite ^ /admin/index.html last;
        }
        return 404;
    }

    error_page 404 /404.html;
    location = /404.html {
        internal;
    }

    # 如宝塔自动生成了图片/脚本缓存规则，保留即可；
    # 但不要覆盖上面的 /uploads/ 与 /assets/。
}
```

保存后重载 Nginx：

```bash
nginx -t && nginx -s reload
```

### 5.3 SEO 静态页面与缓存

`npm run build` 会生成：

```
dist/index.html                    首页
dist/product/1/index.html          每个已发布产品的独立静态页
dist/admin/index.html              noindex
dist/404.html                      品牌化 404 页面
dist/robots.txt
dist/sitemap.xml                   设置 SITE_URL 后生成
```

`try_files $uri $uri/ @spa;` 会优先命中这些目录下的 `index.html`，所以 Google、WhatsApp、Facebook 等不执行 JS 的抓取器能直接读到产品标题、描述、图片和结构化数据；未知地址由 `@spa` 返回 404 并展示 `dist/404.html`，不会产生“软 404”。

建议给 HTML 加短缓存或协商缓存，避免后台改价/改文案后访客长时间看到旧页面：

```nginx
location ~* \.html$ {
    add_header Cache-Control "no-cache";
}
```

带 hash 的 `/assets/` 仍可长缓存。后台保存产品后，API 进程会在约 1.2 秒后重写 `dist/` 下的静态页，因此运行 API 的用户必须对 `dist/` 有写权限；如果 `dist/` 只读，请设置 `SEO_AUTO_REFRESH=false`，并在每次发布时重新构建。

上线后到 Google Search Console 提交 `https://你的域名/sitemap.xml`，并用「富媒体搜索结果测试」检查 Product、FAQ、Breadcrumb 结构化数据。

### 5.4 为什么要 `^~`

`^~ /uploads/` 可以避免被宝塔默认的图片正则缓存规则拦截，否则 `/uploads/xxx.png` 会去 `dist/` 里找而 404。

---

## 6. 开启 HTTPS（必须）

宝塔站点「设置」→「SSL」：

1. 选择 Let's Encrypt，申请证书。
2. 开启「强制 HTTPS」。

原因：生产模式登录 Cookie 带 `Secure`，通过 HTTP 访问时浏览器不会保存，表现为“登录成功后又回到登录页”。

申请完成后，用 HTTPS 访问：

- 前台：`https://your-domain.com`
- 后台：`https://your-domain.com/admin`
- 详情页：`https://your-domain.com/product/1`

---

## 7. 首次验证清单

```bash
# API 本机
curl http://127.0.0.1:3001/api/health

# 经 Nginx
curl -I https://your-domain.com/
curl https://your-domain.com/api/health
curl -I https://your-domain.com/product/1     # 应为 200 text/html
curl -I https://your-domain.com/admin         # 应为 200 text/html
```

浏览器：

1. 打开 `https://your-domain.com/admin`，用 `ADMIN_PASSWORD` 登录。
2. 新建产品、上传一张图片、保存。
3. 打开该产品详情页，点击右上角「Scan / Share」，确认二维码指向正式域名。
4. 检查首页产品顺序、详情页区块是否正常。

---

## 8. 日常更新

```bash
cd /www/wwwroot/webfold

# 如果使用 Git
git pull

npm install        # 依赖有变化时
npm run build      # 前端重新构建
pm2 restart webfold-api
```

数据库结构变更会在 API 启动时自动迁移，无需手动执行 SQL。

---

## 9. 备份

需要备份：

- `server/data/webfold.db`（以及运行时的 `-wal` / `-shm`）
- `server/uploads/`

### 9.1 宝塔计划任务

「计划任务」→「Shell 脚本」，每天执行一次（时间按需）：

```bash
#!/bin/bash
set -e

APP=/www/wwwroot/webfold
DEST=/www/backup/webfold
mkdir -p "$DEST"

# 短暂停止 API，避免 SQLite WAL 在复制时不一致
pm2 stop webfold-api || true

tar -czf "$DEST/webfold-$(date +%F-%H%M).tar.gz" \
  -C "$APP" server/data server/uploads

pm2 start webfold-api || true

# 保留 14 天
find "$DEST" -name 'webfold-*.tar.gz' -mtime +14 -delete
```

如果服务器安装了 `sqlite3`，也可以不停服：

```bash
sqlite3 /www/wwwroot/webfold/server/data/webfold.db \
  ".backup '/www/backup/webfold/webfold-$(date +%F).db'"
```

建议再把备份同步到对象存储或另一台机器。

---

## 10. 常见问题

### 502 Bad Gateway

API 没启动或端口不一致：

```bash
pm2 status
pm2 logs webfold-api --lines 100
curl http://127.0.0.1:3001/api/health
```

确认 Nginx 里 `proxy_pass` 的端口是 3001。

### 登录后立即退回登录页

- 没有使用 HTTPS（生产 Cookie 为 Secure）。
- `NODE_ENV` 不是 `production` 时也应通过 HTTPS 访问正式域名，避免测试困惑。
- 检查系统时间是否准确（影响 Cookie 过期判断）。

### 直接打开 /product/1 或 /admin 是 404

Nginx 缺少静态页/SPA 回退。使用 DEPLOY.md 5.2 的配置：

```nginx
location / {
    try_files $uri $uri/ @spa;
}

location @spa {
    if ($uri ~ ^/admin(?:/|$)) {
        rewrite ^ /admin/index.html last;
    }
    return 404;
}
```

### 上传图片返回 413

Nginx 请求体限制太小，在 `server` 块加：

```nginx
client_max_body_size 10m;
```

### 上传提示“仅支持 JPG、PNG…”

服务端按文件真实内容校验，改扩展名无效；请上传真实图片。

### 启动报 `node:sqlite` 相关错误

Node 版本过低，升级到 **24**（最低 22.5）。

### 数据库只读 / 无法写入

```bash
chown -R www:www /www/wwwroot/webfold/server/data /www/wwwroot/webfold/server/uploads
```

### 二维码指向 localhost 或 IP

二维码内容取当前浏览器地址。请用正式 HTTPS 域名打开详情页后再生成；后台保存的链接不受影响。

### 忘记后台密码

修改 `ecosystem.config.cjs` 中的 `ADMIN_PASSWORD`，然后：

```bash
pm2 delete webfold-api
pm2 start ecosystem.config.cjs
pm2 save
```

---

## 11. 安全建议

- 只对公网开放 80/443，API 使用 `127.0.0.1` 监听。
- `ADMIN_PASSWORD` 使用强密码，`AUTH_SECRET` 使用随机 32 字节以上字符串。
- 全程 HTTPS。
- 定期备份数据库与 `server/uploads/`，并异地保存。
- 及时更新 Node.js、Nginx 与项目依赖。
- 不建议把 `ecosystem.config.cjs`（含密码）提交到公开仓库；可将其加入 `.gitignore`。
