# SQL 脚本说明

## init.sql（推荐首次部署使用）

**包含内容：**

- **建表语句**：所有业务表（base_sys_*、work_order、user_info、appointment_info 等）的 `CREATE TABLE IF NOT EXISTS`
- **基础数据**：系统配置、参数、部门、超管角色、超管用户（admin/123456）、用户-角色关联

**使用方式：**

```bash
# 创建数据库后执行（请替换 -u/-p 和数据库名）
mysql -h 127.0.0.1 -u root -p cool < server/sql/init.sql
```

执行后即可用 `admin` / `123456` 登录后台。若需「租户管理」「总部/门店管理」等菜单，再执行下方菜单脚本或由本地 `initMenu` 自动导入。

---

## TypeORM 会自动创建表吗？

**会，但仅在一定条件下：**

| 配置 | 行为 |
|------|------|
| **config.local.ts**（`npm run dev`） | `synchronize: true` → **会**根据 entity 自动建表/改表（与实体定义同步） |
| **config.prod.ts**（生产/`npm run prod`） | `synchronize: false`，且 `entities` 来自空的 `entities.ts` → **不会**自动建表 |

**结论：**

- **开发环境**：TypeORM 会根据 `entities: ['**/modules/*/entity']` 加载实体，并在启动时按实体自动创建或更新表结构。
- **生产环境**：不应开启 `synchronize`（有数据丢失风险），应通过 **执行 init.sql** 或 **迁移脚本** 建表。

若本地也未自动出现某张表（如 `base_sys_tenant`），可能是实体路径未递归到子目录（如 `entity/sys/tenant.ts`），执行一次 `init.sql` 即可补齐。

---

## 其他脚本

| 脚本 | 说明 |
|------|------|
| `init_tenant_table.sql` | 仅创建租户表 `base_sys_tenant`（已合并进 init.sql） |
| `init_tenant_menu.sql` | 租户管理菜单（系统管理 → 权限管理 → 租户管理） |
| `init_chain_menu.sql` | 总部管理、门店管理菜单及按钮权限 |
| `init_missing_pages_menu.sql` | 其他缺失页面菜单 |
| `check_menu_pages.sql` | 检查菜单与前端页面配置是否一致 |

菜单类脚本依赖 `base_sys_menu` 中已有「权限管理」等父级菜单（通常由 cool 首次启动 initMenu 生成），若表为空可先启动一次本地开发再执行，或先执行 init.sql 后由框架按模块初始化菜单。
