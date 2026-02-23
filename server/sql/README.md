# SQL 脚本说明

本目录仅保留一份初始化脚本：**init.sql**，包含建表语句与必要的基础配置数据。

## init.sql

**包含内容：**

- **建表语句**：所有业务表（`base_sys_*`、`work_order`、`user_info`、`appointment_info` 等）的 `CREATE TABLE IF NOT EXISTS`
- **基础数据**：系统配置、参数、部门、超管角色、超管用户（admin/123456）、用户-角色关联、默认租户
- **可选**：文件末尾注释中提供「base_sys_user 唯一索引修复」语句，仅当历史库存在错误唯一约束时按需执行

**使用方式：**

```bash
# 创建数据库后执行（请替换 -h/-u/-p 和数据库名，默认库名 cool）
mysql -h 127.0.0.1 -u root -p cool < server/sql/init.sql
```

执行后可用 `admin` / `123456` 登录后台。租户管理、连锁管理、业务菜单等由首次启动时 `cool.initMenu` 从模块自动导入，无需单独 SQL。

---

## TypeORM 与建表

| 环境 | synchronize | 行为 |
|------|-------------|------|
| **开发**（config.local，`npm run dev`） | `true` | 会根据 entity 自动建表/改表 |
| **生产**（config.prod，`npm run prod`） | `false` | 不会自动建表，需执行 **init.sql** 或迁移脚本 |

生产环境不应开启 `synchronize`，应通过执行 **init.sql** 或迁移脚本建表。
