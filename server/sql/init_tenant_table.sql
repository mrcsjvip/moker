-- 租户表 base_sys_tenant 建表脚本
-- 当数据库中不存在该表时执行（例如：生产环境未开 synchronize、或 entities 未包含 entity/sys 子目录时）
-- 执行方式：在 MySQL 客户端或管理工具中执行本文件，或在项目根目录：mysql -u root -p cool < server/sql/init_tenant_table.sql

CREATE TABLE IF NOT EXISTS `base_sys_tenant` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `name` varchar(100) NOT NULL COMMENT '租户名称',
  `expireDate` date DEFAULT NULL COMMENT '到期日',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='租户表';
