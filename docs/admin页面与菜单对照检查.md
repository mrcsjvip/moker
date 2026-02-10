# Admin 页面与菜单配置对照检查

## 说明

- **菜单来源**：管理员侧边栏来自数据库表 `base_sys_menu`。只有在该表中有对应记录（且角色已分配）的菜单，管理员才能看到并访问。
- **配置来源**：项目里菜单的“设计稿”在 `server/src/modules/base/menu.json`；租户/连锁等另有 SQL 初始化脚本（`server/sql/init_tenant_menu.sql`、`init_chain_menu.sql`）。数据库中的菜单可能是通过「菜单管理」导入 menu.json、执行 SQL 或手工添加得到的。
- 以下对照表基于 **menu.json + 已有 init SQL** 与 **admin 下实际页面** 对比，标出「是否有菜单配置」。若数据库未按 menu.json 或 SQL 初始化，实际可见性以数据库为准，可用 `server/sql/check_menu_pages.sql` 查询当前库中页面级菜单。

---

## 一、menu.json 中已配置的页面（type=1，有 router/viewPath）

| 菜单名称 | router | viewPath | 对应页面 |
|---------|--------|----------|----------|
| 首页 | / | modules/demo/views/home/index.vue | ✅ |
| 菜单列表 | /sys/menu | modules/base/views/menu/index.vue | ✅ |
| 参数（测试） | /test/aa | modules/base/views/info.vue | ✅ |
| 角色列表 | /sys/role | cool/modules/base/views/role.vue | ✅ |
| 用户列表 | /sys/user | modules/base/views/user/index.vue | ✅ |
| 租户管理 | /sys/tenant | modules/base/views/tenant.vue | ✅（需执行 init_tenant_menu.sql 才会入库） |
| 总部管理 | /sys/chain-headquarters | modules/base/views/chain-headquarters.vue | ✅（需执行 init_chain_menu.sql） |
| 门店管理 | /sys/chain-store | modules/base/views/chain-store.vue | ✅（需执行 init_chain_menu.sql） |
| 参数列表 | /sys/param | cool/modules/base/views/param.vue | ✅ |
| 请求日志 | /sys/log | cool/modules/base/views/log.vue | ✅ |
| 任务列表 | /task/list | modules/task/views/list.vue | ✅ |
| 文档官网 | /tutorial/doc | https://...（外链） | - |
| crud 示例 | /demo/crud | modules/demo/views/crud/index.vue | ✅ |
| 字典管理 | /dict/list | modules/dict/views/list.vue | ✅ |
| 数据回收站 | /recycle/data | modules/recycle/views/data.vue | ✅ |
| 文件管理 | /upload/list | modules/space/views/list.vue | ✅ |
| 用户列表（用户模块） | /user/list | modules/user/views/list.vue | ✅ |
| 插件列表 | /helper/plugins | modules/helper/views/plugins.vue | ✅ |

**说明**：`cool/` 前缀在加载时会被处理，与 `modules/base/views/` 下的文件等价。

---

## 二、Admin 下存在但 menu.json 中无菜单的页面

以下页面在 `admin/src/modules/` 下存在，但在 **menu.json 和现有 init SQL 中均未出现**。若未在「菜单管理」中手工添加或通过其它 SQL 入库，**管理员侧边栏不会显示这些菜单**，即看不到这些页面。

| 模块 | 页面路径 | 建议 router（可自行在菜单中配置） |
|------|----------|----------------------------------|
| base | modules/base/views/dynamic-crud.vue | 按需使用，如 /sys/dynamic/tenant、/sys/dynamic/chain_headquarters 等（见配置化 CRUD 文档） |
| appointment | modules/appointment/views/list.vue | 如 /appointment/list |
| audit | modules/audit/views/logs.vue | 如 /audit/logs |
| customer | modules/customer/views/list.vue | 如 /customer/list |
| demo | modules/demo/views/test/route.vue | 演示用，可选 |
| helper | modules/helper/views/ai-code.vue | 如 /helper/ai-code |
| inventory | modules/inventory/views/list.vue | 如 /inventory/list |
| inventory | modules/inventory/views/logs.vue | 如 /inventory/logs |
| marketing | modules/marketing/views/coupon.vue | 如 /marketing/coupon |
| marketing | modules/marketing/views/coupon-use.vue | 如 /marketing/coupon-use |
| material | modules/material/views/list.vue | 如 /material/list |
| report | modules/report/views/daily.vue | 如 /report/daily |
| service | modules/service/views/list.vue | 如 /service/list |
| staff | modules/staff/views/list.vue | 如 /staff/list |
| store | modules/store/views/list.vue | 如 /store/list |
| vehicle | modules/vehicle/views/list.vue | 如 /vehicle/list |
| workorder | modules/workorder/views/list.vue | 如 /workorder/list |
| workorder | modules/workorder/views/steps.vue | 如 /workorder/steps |

**说明**：`frame.vue` 为 iframe 容器，通常由外链菜单（如「文档官网」）使用，不单独作为业务菜单。

---

## 三、如何确认数据库里是否有对应菜单

1. **查当前库中所有“页面级”菜单**（type=1 且通常有 viewPath/router）  
   执行：`server/sql/check_menu_pages.sql`（见下），可得到当前库中所有页面菜单的 router、viewPath、name，便于与上表对照。

2. **若缺少菜单**  
   - 在 **系统管理 → 权限管理 → 菜单管理** 中手工添加：填写 name、router、viewPath（如 `modules/xxx/views/xxx.vue`），并给对应角色分配权限。  
   - 或执行 **`server/sql/init_missing_pages_menu.sql`**，可一次性为「二、无菜单的页面」在「业务管理」等父级下插入所有页面菜单（可重复执行，已存在则跳过）。执行后需在 角色管理 中为管理员角色勾选「业务管理」等新增菜单；按钮权限(type=2)可按各模块在 菜单管理 中补充。

3. **租户 / 连锁**  
   - 若未执行过 `init_tenant_menu.sql`、`init_chain_menu.sql`，则「租户管理」「总部管理」「门店管理」在库中可能不存在，需执行对应 SQL 后，用超管重新登录或刷新后台再查看。

---

## 四、小结

- **已在 menu.json 或 init SQL 中配置的页面**：若数据库已按这些配置初始化，管理员在分配了对应菜单权限后可以看到。
- **未在 menu.json 中配置的 17+ 个页面**：除非已在数据库 `base_sys_menu` 中手工或通过其它 SQL 添加，否则管理员侧边栏不会出现这些菜单，即**看不到这些页面**。
- 要确认“管理员是否都能看到”，请运行 `check_menu_pages.sql` 查看当前库中实际有哪些页面菜单，再与本文「一、二」对照查漏。
