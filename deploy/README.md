# Moker 生产环境部署说明

对外域名：**moker.mrcsj.cc**

- **moker.mrcsj.cc/admin** → 管理后台（Vue 3 + Vite）
- **moker.mrcsj.cc/api** → 后端 API（Node.js Midway）

---

## 一、前置要求

- Node.js >= 18
- Nginx
- MySQL（按 server 项目配置）
- 域名 moker.mrcsj.cc 已解析到服务器 IP

---

## 二、构建步骤

### 1. 后端（server）

```bash
cd server
npm ci
npm run build
```

生产启动（任选其一）：

```bash
# 直接运行
NODE_ENV=production node ./bootstrap.js

# 或使用 PM2
npm run pm2:start
```

后端默认监听 **8001** 端口（可在 `server/src/config/config.default.ts` 中修改），仅需本机可访问，由 Nginx 反向代理对外提供 `/api`。

### 2. 管理后台（admin）

```bash
cd admin
npm ci
npm run build
```

构建产物在 **admin/dist**。生产构建已使用 base `/admin/`，部署到域名下的 `/admin` 路径即可。

### 3. H5（如需要）

```bash
cd h5
npm ci
npm run build
```

若 H5 也通过同一域名提供，可在 Nginx 中增加对应 `location`（例如 `/h5`），配置方式类似 admin。

---

## 三、Nginx 配置

1. 复制并编辑配置：

```bash
cp deploy/nginx.conf /etc/nginx/conf.d/moker.mrcsj.cc.conf
```

2. 修改配置中的 **实际路径**：

将 `/path/to/moker` 改为项目在服务器上的路径，例如：

- `/path/to/moker/admin/dist` → `/var/www/moker/admin/dist`

3. 重载 Nginx：

```bash
sudo nginx -t && sudo nginx -s reload
```

### 配置要点

- **`/api/`**：反向代理到 `http://127.0.0.1:8001/`，请求中的 `/api` 会被去掉，后端收到的路径为 `/admin/...`、`/app/...` 等。
- **`/admin`、`/admin/`**：静态资源 + SPA 回退到 `index.html`，需保证 `alias` 指向 admin 的 **dist** 目录。
- **`/`**：可选重定向到 `/admin/`，便于直接打开管理后台。

### HTTPS（推荐）

在 `server { ... }` 中增加并填写证书路径：

```nginx
listen 443 ssl http2;
listen [::]:443 ssl http2;
ssl_certificate     /path/to/fullchain.pem;
ssl_certificate_key /path/to/privkey.pem;
```

并保留 80 端口的 `server` 做 HTTP 到 HTTPS 跳转（或在同一 server 内用 `if`/`return` 重定向）。

---

## 四、环境变量与后端配置

- **Server**：数据库、Redis 等按 `server/src/config/config.default.ts` 及环境变量配置（如 `NODE_ENV=production`）。
- **Admin**：生产环境请求地址为相对路径 `/api`，会发往当前域名（moker.mrcsj.cc），无需再配 API 地址；若需覆盖，可在构建时使用 `VITE_API_HOST` 等（见 admin 的 proxy 与 config）。

---

## 五、部署检查清单

- [ ] 域名 moker.mrcsj.cc 解析到服务器
- [ ] MySQL 已创建并导入/迁移，server 配置正确
- [ ] server 已 build 并以 production 模式运行在 8001
- [ ] admin 已 build，且 Nginx 中 `alias` 指向 `admin/dist`
- [ ] Nginx 中 `/path/to/moker` 已替换为实际路径
- [ ] 若启用 HTTPS，证书已配置并重载 Nginx
- [ ] 访问 moker.mrcsj.cc/admin 可打开管理后台
- [ ] 访问 moker.mrcsj.cc/api/... 可正常调通接口（如登录）

---

## 六、目录结构参考

```
/var/www/moker/          # 或你选择的部署根目录
├── admin/
│   └── dist/           # admin 构建产物，Nginx alias 指向此处
├── server/             # 后端源码，运行 node bootstrap.js 或 pm2
│   ├── dist/
│   └── bootstrap.js
└── deploy/
    └── nginx.conf      # 参考配置，复制到 Nginx 并改路径
```

按上述步骤即可完成 moker.mrcsj.cc 下 `/admin` 与 `/api` 的生产部署与配置。
