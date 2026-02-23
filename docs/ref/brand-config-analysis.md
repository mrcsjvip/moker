# Cool-Admin 品牌配置分析

## 一、当前品牌相关分布

### 1. 前端 Admin（已部分配置化）

| 位置 | 当前内容 | 是否可配置 |
|------|----------|------------|
| `admin/.env` | `VITE_NAME = "COOL-ADMIN"` | ✅ 已通过环境变量 |
| `admin/src/config/index.ts` | `config.app.name = import.meta.env.VITE_NAME` | ✅ 已用 VITE_NAME |
| 登录页标题 | `app.info.name`（来自 config.app） | ✅ 随 VITE_NAME |
| 侧栏/加载页 | 同上 | ✅ 同上 |
| 登录页 Logo | 硬编码 `/logo.png` | ❌ 未配置 |
| 登录页版权 | 硬编码 `Copyright © COOL`、`https://cool-js.com` | ❌ 未配置 |
| 侧栏 Logo | 硬编码 `/logo.png` | ❌ 未配置 |
| `admin/index.html` | `<title>` 为空，由 JS 设；`favicon.ico` 固定 | 可增加 VITE_ 变量 |

### 2. 后端 Server

| 位置 | 当前内容 | 说明 |
|------|----------|------|
| `server/src/modules/base/db.json` | 部门名 "COOL"、超管邮箱 "team@cool-js.com" | 初始化种子数据，可改为占位或你们品牌 |
| `server/src/modules/dict/db.json` | "COOL"、"闪酷"、`show.cool-admin.com` 图片链接 | 字典演示数据 |
| `server/public/index.html` | 标题/描述/HELLO COOL-ADMIN/链接 | 后端欢迎页，可改为配置或静态替换 |
| `server/package.json` | name、author、repository.url | 项目元信息，一般保留或改为自己项目名 |
| 各插件/helper 内 | `cool-js.com`、`vue.cool-admin.com` 等 URL | 文档/插件市场链接，可选保留或配置 |

### 3. 其他

| 位置 | 内容 |
|------|------|
| `admin/src/modules/helper/*` | 插件市场、文档链接指向 cool-js.com |
| `admin/src/plugins/*/config.ts` | 多处 `author: 'COOL'`（插件元数据） |
| `h5/config/*`、`admin/packages/vite-plugin` | 演示/代理目标 URL |

---

## 二、是否可以做配置化？

**可以。** 建议分两层：

1. **构建时配置（环境变量）**  
   用于：应用名称、Logo 路径、版权文案、版权链接、favicon 等，改 `.env` 或构建参数即可，无需改代码。

2. **运行时配置（可选）**  
   若需要「不重新打包就换品牌」或「按租户/环境不同展示不同名称、Logo」：  
   可在后端用 `base_sys_conf` 或单独接口提供 `appName`、`appLogo`、`copyright`、`copyrightLink`，前端启动或登录前请求一次并写入 `app.info`。

---

## 三、推荐配置化方案

### 方案 A：仅构建时配置（最小改动）

在 **admin** 侧统一用环境变量驱动「品牌」相关展示，便于部署时改品牌而不改代码。

1. **扩展 `admin/.env`**

```env
# 应用名称（已有）
VITE_NAME = "COOL-ADMIN"

# 品牌相关（新增）
VITE_LOGO = "/logo.png"
VITE_COPYRIGHT = "Copyright © COOL"
VITE_COPYRIGHT_LINK = "https://cool-js.com"
```

2. **扩展 `admin/src/config/index.ts` 的 `config.app`**

```ts
app: {
  name: import.meta.env.VITE_NAME,
  logo: import.meta.env.VITE_LOGO ?? '/logo.png',
  copyright: import.meta.env.VITE_COPYRIGHT ?? '',
  copyrightLink: import.meta.env.VITE_COPYRIGHT_LINK ?? '',
  // ... 原有 menu、router
}
```

3. **前端使用**

- 登录页：`<img :src="app.info.logo" />`、`<a :href="app.info.copyrightLink">{{ app.info.copyright }}</a>`
- 侧栏：`<img :src="app.info.logo" />`
- 已用 `app.info.name` 的地方保持不变

4. **类型**

在 `admin/env.d.ts` 中补充：

```ts
readonly VITE_LOGO?: string;
readonly VITE_COPYRIGHT?: string;
readonly VITE_COPYRIGHT_LINK?: string;
```

这样：**名称、Logo、版权文案与链接** 都可通过 `.env` 配置，无需改代码。

---

### 方案 B：运行时配置（后端驱动，可选）

适用于：多环境/多租户不同品牌、或运营希望后台改「系统名称/Logo」即生效。

1. **后端**

- 在 `base_sys_conf` 中约定配置键，例如：  
  `appName`、`appLogo`、`appCopyright`、`appCopyrightLink`  
  或在现有「系统配置」管理里增加这些项。
- 提供接口，例如：  
  `GET /admin/base/comm/appInfo` 返回  
  `{ name, logo, copyright, copyrightLink }`  
  （可从 conf 表或配置服务读取，带缓存亦可）。

2. **前端**

- 在应用启动（或登录前）请求 `appInfo`，将结果 `merge` 到 `app.info`（或 `app.set(...)`）。
- 若接口未配置或失败，回退为 `config.app` 中的默认值（即方案 A 的 VITE_*）。

这样：**同一套前端包，不同环境/租户可展示不同品牌**，且可由后台配置维护。

---

## 四、建议落地顺序

1. **先做方案 A**  
   - 在 admin 增加 `VITE_LOGO`、`VITE_COPYRIGHT`、`VITE_COPYRIGHT_LINK` 及 `config.app` 对应字段。  
   - 登录页、侧栏的 Logo 和版权改为使用 `app.info`。  
   - 你们项目把 `.env` 改成自己的名称、Logo、版权与链接即可「去 cool-admin 品牌化」。

2. **按需做方案 B**  
   - 若需要后台可改或按租户/环境区分品牌，再增加 conf 键与 `appInfo` 接口，前端增加请求与回退逻辑。

3. **后端与静态资源**  
   - `server/public/index.html`、`server/src/modules/base/db.json`、`server/src/modules/dict/db.json` 中的 COOL/cool-js 等：  
     可随你们品牌做一次性替换（或把欢迎页标题/描述也做成从 conf 读取，与方案 B 一致）。  
   - `package.json` 的 name/author 等：改为你们项目信息即可。

---

## 五、小结

| 维度 | 结论 |
|------|------|
| 是否可配置化 | 可以，且建议做 |
| 已有基础 | 应用名称已通过 `VITE_NAME` + `config.app.name` 配置化 |
| 建议补充 | Logo、版权文案、版权链接用环境变量（方案 A），必要时再加后端接口（方案 B） |
| 改动范围 | 以 admin 的 config、登录页、侧栏为主；后端以 conf/接口和静态替换为辅 |

如需，我可以按你当前仓库结构给出方案 A 的具体修改清单（含文件名与片段）。
