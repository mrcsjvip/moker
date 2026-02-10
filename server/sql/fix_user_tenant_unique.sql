-- 修复：base_sys_user 用户名应按 (tenantId, username) 联合唯一，同一用户名在不同租户可存在
-- 若新增租户时报错 Duplicate entry 'admin' for key 'base_sys_user.IDX_...' 说明表上存在仅针对 username 的旧唯一索引，需执行本脚本
--
-- 执行前可先查看当前索引：SHOW INDEX FROM base_sys_user;
-- 找到 Key_name 为仅包含 username 的唯一索引，将下面第 1 步中的索引名替换为实际名称后再执行。
--

-- 1. 删除错误的唯一索引（仅对 username 唯一，导致全局只能有一个 admin）
--    报错里的索引名即要删除的；若不同请替换为 SHOW INDEX 中看到的名称
ALTER TABLE base_sys_user DROP INDEX IDX_469ad55973f5b98930f6ad627b;

-- 2. 添加正确的联合唯一索引（同一租户内用户名不可重复，不同租户可重复）
--    若提示 Duplicate key name 'IDX_tenantId_username' 说明已存在正确约束，可忽略本句
ALTER TABLE base_sys_user ADD UNIQUE KEY IDX_tenantId_username (tenantId, username);
