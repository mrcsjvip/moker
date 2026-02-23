-- 系统配置表按租户隔离：将原唯一键 cKey 改为 (tenantId, cKey)
-- 使用：在已有库上执行。若从未建过 base_sys_conf 可跳过。
-- mysql -u root -p cool < server/sql/migrate_conf_tenant.sql

SET NAMES utf8mb4;

-- 删除旧唯一索引（若存在）
ALTER TABLE `base_sys_conf` DROP INDEX `IDX_cKey`;

-- 添加按租户的唯一索引
ALTER TABLE `base_sys_conf` ADD UNIQUE KEY `idx_conf_tenant_key` (`tenantId`,`cKey`);

-- 可选：插入全局客服电话占位（若不存在）
-- INSERT IGNORE INTO base_sys_conf (createTime, updateTime, tenantId, cKey, cValue)
-- SELECT NOW(), NOW(), NULL, 'service_phone', '' FROM DUAL
-- WHERE NOT EXISTS (SELECT 1 FROM base_sys_conf WHERE cKey = 'service_phone' AND tenantId IS NULL);
