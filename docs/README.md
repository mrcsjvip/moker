# Moker 项目文档

面向 4S 服务预约的 H5 / 微信小程序 + 管理后台 + 服务端 一体化项目文档索引。

---

## 一、功能文档（feature/）

| 文档 | 说明 |
|------|------|
| [目标功能](./feature/目标功能.md) | 产品目标、核心页面与功能规划 |
| [已实现功能](./feature/已实现功能.md) | 当前已上线的 C 端、员工端、店长端、后台与接口 |

---

## 二、开发文档（dev/）

### 运行与联调

| 文档 | 说明 |
|------|------|
| [本地运行指南](./dev/本地运行指南.md) | Docker Compose 与本机启动服务端、Admin、H5 |

### 各端开发

| 文档 | 说明 |
|------|------|
| [服务端开发](./dev/服务端开发.md) | Cool Admin Midway、模块结构、多租户、登录与配置 |
| [H5 端开发](./dev/H5端开发.md) | uni-app x、目录结构、代理、页面与子包 |
| [微信小程序开发](./dev/微信小程序开发.md) | 编译、HBuilderX、AppID、账号绑定与角色 |

### 管理后台（admin）

| 文档 | 说明 |
|------|------|
| [403 权限排查](./dev/admin/403权限排查.md) | 菜单与权限标识、角色分配、重新登录 |
| [配置化 CRUD 页面](./dev/admin/配置化CRUD页面.md) | 低代码方式新增列表+表单 CRUD |
| [Admin 页面与菜单对照](./dev/admin/admin页面与菜单对照检查.md) | 菜单来源、router/viewPath 与页面对应 |
| [组织机构说明](./dev/admin/组织机构说明.md) | 部门树、用户归属、与连锁总部/门店区别 |

---

## 三、参考与设计（ref/）

| 文档 | 说明 |
|------|------|
| [品牌配置分析](./ref/brand-config-analysis.md) | Admin/Server 品牌相关配置与配置化方案 |
| [小程序登录与用户表](./ref/app-login-user-table.md) | 小程序登录写入 user_info、排查请求是否到本机 |
| [Figma MCP 渠道配置](./ref/figma-mcp-channel-setup.md) | Figma MCP 与设计稿对接 |
| [微信小程序 Figma 构建](./ref/weixin-app-figma-build.md) | 小程序与 Figma 构建流程 |
| [微信小程序 Figma 规范](./ref/weixin-app-figma-spec.md) | 设计规范说明 |
| [微信开发者工具模拟器](./ref/weixin-dev-tools-simulator.md) | 开发者工具模拟器使用 |

---

## 四、文档结构一览

```
docs/
├── README.md                 # 本索引
├── feature/                  # 功能文档
│   ├── 目标功能.md
│   └── 已实现功能.md
├── dev/                      # 开发文档
│   ├── 本地运行指南.md
│   ├── 服务端开发.md
│   ├── H5端开发.md
│   ├── 微信小程序开发.md
│   └── admin/
│       ├── 403权限排查.md
│       ├── 配置化CRUD页面.md
│       ├── admin页面与菜单对照检查.md
│       └── 组织机构说明.md
└── ref/                      # 参考与设计
    ├── brand-config-analysis.md
    ├── app-login-user-table.md
    ├── figma-mcp-channel-setup.md
    ├── weixin-app-figma-build.md
    ├── weixin-app-figma-spec.md
    └── weixin-dev-tools-simulator.md
```
