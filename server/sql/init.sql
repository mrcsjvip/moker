-- ============================================================
-- 数据库初始化脚本 init.sql
-- 包含：建表语句 + 基础配置数据（超管、部门、角色、参数、配置等）
-- 使用：mysql -u root -p cool < server/sql/init.sql
-- 说明：TypeORM 在 config.local 下 synchronize:true 时会自动建表；
--       生产环境 synchronize 为 false，需执行本脚本或迁移建表。
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ------------------------------------------------------------
-- 一、建表语句（与 entity 定义一致）
-- ------------------------------------------------------------

-- 租户
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

-- 系统配置（按租户隔离：同一 cKey 可配置全局 tenantId=null 或按租户）
CREATE TABLE IF NOT EXISTS `base_sys_conf` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `cKey` varchar(255) NOT NULL COMMENT '配置键',
  `cValue` text COMMENT '配置值',
  PRIMARY KEY (`id`),
  UNIQUE KEY `idx_conf_tenant_key` (`tenantId`,`cKey`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统配置';

-- 参数配置
CREATE TABLE IF NOT EXISTS `base_sys_param` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `keyName` varchar(255) NOT NULL COMMENT '键',
  `name` varchar(255) NOT NULL COMMENT '名称',
  `data` text NOT NULL COMMENT '数据',
  `dataType` int DEFAULT '0' COMMENT '数据类型 0-字符串 1-富文本 2-文件',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_keyName` (`keyName`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='参数配置';

-- 部门
CREATE TABLE IF NOT EXISTS `base_sys_department` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `name` varchar(255) NOT NULL COMMENT '部门名称',
  `userId` int DEFAULT NULL COMMENT '创建者ID',
  `parentId` int DEFAULT NULL COMMENT '上级部门ID',
  `orderNum` int DEFAULT '0' COMMENT '排序',
  PRIMARY KEY (`id`),
  KEY `IDX_userId` (`userId`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='部门';

-- 菜单
CREATE TABLE IF NOT EXISTS `base_sys_menu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `parentId` int DEFAULT NULL COMMENT '父菜单ID',
  `name` varchar(255) NOT NULL COMMENT '菜单名称',
  `router` varchar(255) DEFAULT NULL COMMENT '菜单地址',
  `perms` text COMMENT '权限标识',
  `type` int DEFAULT '0' COMMENT '类型 0-目录 1-菜单 2-按钮',
  `icon` varchar(255) DEFAULT NULL COMMENT '图标',
  `orderNum` int DEFAULT '0' COMMENT '排序',
  `viewPath` varchar(255) DEFAULT NULL COMMENT '视图地址',
  `keepAlive` tinyint(1) DEFAULT '1' COMMENT '路由缓存',
  `isShow` tinyint(1) DEFAULT '1' COMMENT '是否显示',
  PRIMARY KEY (`id`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='菜单';

-- 角色
CREATE TABLE IF NOT EXISTS `base_sys_role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `userId` varchar(255) NOT NULL COMMENT '用户ID',
  `name` varchar(255) NOT NULL COMMENT '名称',
  `label` varchar(50) DEFAULT NULL COMMENT '角色标签',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `relevance` tinyint(1) DEFAULT '0' COMMENT '数据权限是否关联上下级',
  `menuIdList` json DEFAULT NULL COMMENT '菜单权限',
  `departmentIdList` json DEFAULT NULL COMMENT '部门权限',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_name` (`name`),
  UNIQUE KEY `IDX_label` (`label`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色';

-- 用户
CREATE TABLE IF NOT EXISTS `base_sys_user` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `departmentId` int DEFAULT NULL COMMENT '部门ID',
  `userId` int DEFAULT NULL COMMENT '创建者ID',
  `name` varchar(255) DEFAULT NULL COMMENT '姓名',
  `username` varchar(100) NOT NULL COMMENT '用户名',
  `password` varchar(255) NOT NULL COMMENT '密码',
  `passwordV` int DEFAULT '1' COMMENT '密码版本',
  `nickName` varchar(255) DEFAULT NULL COMMENT '昵称',
  `headImg` varchar(500) DEFAULT NULL COMMENT '头像',
  `phone` varchar(20) DEFAULT NULL COMMENT '手机',
  `email` varchar(255) DEFAULT NULL COMMENT '邮箱',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  `status` int DEFAULT '1' COMMENT '状态 0-禁用 1-启用',
  `socketId` varchar(255) DEFAULT NULL COMMENT 'socketId',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_tenantId_username` (`tenantId`,`username`),
  KEY `IDX_departmentId` (`departmentId`),
  KEY `IDX_userId` (`userId`),
  KEY `IDX_phone` (`phone`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统用户';

-- 用户角色关联
CREATE TABLE IF NOT EXISTS `base_sys_user_role` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `userId` int NOT NULL COMMENT '用户ID',
  `roleId` int NOT NULL COMMENT '角色ID',
  PRIMARY KEY (`id`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户角色';

-- 角色菜单关联
CREATE TABLE IF NOT EXISTS `base_sys_role_menu` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `roleId` int NOT NULL COMMENT '角色ID',
  `menuId` int NOT NULL COMMENT '菜单ID',
  PRIMARY KEY (`id`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色菜单';

-- 角色部门关联
CREATE TABLE IF NOT EXISTS `base_sys_role_department` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `roleId` int NOT NULL COMMENT '角色ID',
  `departmentId` int NOT NULL COMMENT '部门ID',
  PRIMARY KEY (`id`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='角色部门';

-- 系统日志
CREATE TABLE IF NOT EXISTS `base_sys_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `userId` int DEFAULT NULL COMMENT '用户ID',
  `action` varchar(255) NOT NULL COMMENT '行为',
  `ip` varchar(255) DEFAULT NULL COMMENT 'ip',
  `params` json DEFAULT NULL COMMENT '参数',
  PRIMARY KEY (`id`),
  KEY `IDX_userId` (`userId`),
  KEY `IDX_action` (`action`),
  KEY `IDX_ip` (`ip`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='系统日志';

-- 连锁总部
CREATE TABLE IF NOT EXISTS `base_sys_chain_headquarters` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `name` varchar(100) NOT NULL COMMENT '总部名称',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='连锁总部';

-- 门店（连锁）
CREATE TABLE IF NOT EXISTS `base_sys_chain_store` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `headquartersId` int NOT NULL COMMENT '所属总部ID',
  `name` varchar(100) NOT NULL COMMENT '门店名称',
  `address` varchar(500) DEFAULT NULL COMMENT '地址',
  `contact` varchar(20) DEFAULT NULL COMMENT '联系电话',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `IDX_headquartersId` (`headquartersId`),
  KEY `IDX_createTime` (`createTime`),
  KEY `IDX_updateTime` (`updateTime`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='门店';

-- 业务表（按 entity 定义，仅列与 base 表结构一致部分 + 业务字段）
CREATE TABLE IF NOT EXISTS `work_order` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `appointmentId` int DEFAULT NULL COMMENT '预约ID',
  `customerId` int NOT NULL COMMENT '客户ID',
  `storeId` int DEFAULT NULL COMMENT '门店ID',
  `vehicleId` int DEFAULT NULL COMMENT '车辆ID',
  `serviceId` int DEFAULT NULL COMMENT '服务ID',
  `technicianId` int DEFAULT NULL COMMENT '技师ID',
  `status` int DEFAULT '0' COMMENT '状态 0-已创建 1-施工中 2-已完成 3-归档',
  `checkInTime` varchar(255) DEFAULT NULL COMMENT '签到时间',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `IDX_appointmentId` (`appointmentId`),
  KEY `IDX_customerId` (`customerId`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单';

CREATE TABLE IF NOT EXISTS `work_order_step` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `workOrderId` int NOT NULL COMMENT '工单ID',
  `name` varchar(255) NOT NULL COMMENT '步骤名称',
  `status` int DEFAULT '0' COMMENT '状态 0-待完成 1-已完成',
  `finishedTime` varchar(255) DEFAULT NULL COMMENT '完成时间',
  PRIMARY KEY (`id`),
  KEY `IDX_workOrderId` (`workOrderId`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='工单步骤';

CREATE TABLE IF NOT EXISTS `vehicle_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `customerId` int NOT NULL COMMENT '客户ID',
  `plateNumber` varchar(255) NOT NULL COMMENT '车牌号',
  `brand` varchar(255) DEFAULT NULL COMMENT '品牌',
  `model` varchar(255) DEFAULT NULL COMMENT '车型',
  `vin` varchar(255) DEFAULT NULL COMMENT 'VIN',
  PRIMARY KEY (`id`),
  KEY `IDX_customerId` (`customerId`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='车辆';

CREATE TABLE IF NOT EXISTS `user_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `unionid` varchar(255) DEFAULT NULL COMMENT '登录唯一ID',
  `avatarUrl` varchar(500) DEFAULT NULL COMMENT '头像',
  `nickName` varchar(255) DEFAULT NULL COMMENT '昵称',
  `phone` varchar(255) DEFAULT NULL COMMENT '手机号',
  `gender` int DEFAULT '0' COMMENT '性别',
  `status` int DEFAULT '1' COMMENT '状态',
  `loginType` int DEFAULT '0' COMMENT '登录方式',
  `password` varchar(255) DEFAULT NULL COMMENT '密码',
  `description` text COMMENT '介绍',
  PRIMARY KEY (`id`),
  UNIQUE KEY `IDX_unionid` (`unionid`),
  UNIQUE KEY `IDX_phone` (`phone`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户信息';

CREATE TABLE IF NOT EXISTS `user_wx` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `unionid` varchar(255) DEFAULT NULL COMMENT '微信unionid',
  `openid` varchar(255) NOT NULL COMMENT '微信openid',
  `avatarUrl` varchar(500) DEFAULT NULL COMMENT '头像',
  `nickName` varchar(255) DEFAULT NULL COMMENT '昵称',
  `gender` int DEFAULT '0' COMMENT '性别 0-未知 1-男 2-女',
  `language` varchar(50) DEFAULT NULL COMMENT '语言',
  `city` varchar(100) DEFAULT NULL COMMENT '城市',
  `province` varchar(100) DEFAULT NULL COMMENT '省份',
  `country` varchar(100) DEFAULT NULL COMMENT '国家',
  `type` int DEFAULT '0' COMMENT '类型 0-小程序 1-公众号 2-H5 3-APP',
  PRIMARY KEY (`id`),
  KEY `IDX_unionid` (`unionid`),
  KEY `IDX_openid` (`openid`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户微信';

CREATE TABLE IF NOT EXISTS `user_address` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `userId` int NOT NULL COMMENT '用户ID',
  `contact` varchar(255) NOT NULL COMMENT '联系人',
  `phone` varchar(11) NOT NULL COMMENT '手机号',
  `province` varchar(100) NOT NULL COMMENT '省',
  `city` varchar(100) NOT NULL COMMENT '市',
  `district` varchar(100) NOT NULL COMMENT '区',
  `address` varchar(500) NOT NULL COMMENT '地址',
  `isDefault` tinyint(1) DEFAULT '0' COMMENT '是否默认',
  PRIMARY KEY (`id`),
  KEY `IDX_userId` (`userId`),
  KEY `IDX_phone` (`phone`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用户地址';

CREATE TABLE IF NOT EXISTS `task_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务信息';

CREATE TABLE IF NOT EXISTS `task_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='任务日志';

CREATE TABLE IF NOT EXISTS `store_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `name` varchar(255) NOT NULL COMMENT '门店名称',
  `city` varchar(255) NOT NULL COMMENT '城市',
  `address` varchar(500) DEFAULT NULL COMMENT '地址',
  `businessHours` varchar(255) DEFAULT NULL COMMENT '营业时间',
  `bookingSlots` text COMMENT '可预约时段(json)',
  `status` int DEFAULT '1' COMMENT '状态 0-停用 1-启用',
  PRIMARY KEY (`id`),
  KEY `IDX_name` (`name`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='门店';

CREATE TABLE IF NOT EXISTS `staff_profile` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='员工档案';

CREATE TABLE IF NOT EXISTS `space_type` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='空间类型';

CREATE TABLE IF NOT EXISTS `space_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='空间信息';

CREATE TABLE IF NOT EXISTS `service_item` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='服务项';

CREATE TABLE IF NOT EXISTS `report_daily` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='日报';

CREATE TABLE IF NOT EXISTS `recycle_data` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `entityInfo` json NOT NULL COMMENT '表信息',
  `userId` int DEFAULT NULL COMMENT '操作人',
  `data` json DEFAULT NULL COMMENT '被删除的数据',
  `url` varchar(500) DEFAULT NULL COMMENT '请求的接口',
  `params` json DEFAULT NULL COMMENT '请求参数',
  `count` int DEFAULT '1' COMMENT '删除数据条数',
  PRIMARY KEY (`id`),
  KEY `IDX_userId` (`userId`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='回收站';

CREATE TABLE IF NOT EXISTS `plugin_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `name` varchar(255) NOT NULL COMMENT '名称',
  `description` text NOT NULL COMMENT '简介',
  `keyName` varchar(255) NOT NULL COMMENT 'Key名',
  `hook` varchar(255) NOT NULL COMMENT 'Hook',
  `readme` text NOT NULL COMMENT '描述',
  `version` varchar(255) NOT NULL COMMENT '版本',
  `logo` text COMMENT 'Logo',
  `author` varchar(255) NOT NULL COMMENT '作者',
  `status` int DEFAULT '0' COMMENT '状态 0-禁用 1-启用',
  `content` json DEFAULT NULL COMMENT '内容',
  `tsContent` json DEFAULT NULL COMMENT 'ts内容',
  `pluginJson` json DEFAULT NULL COMMENT 'plugin.json',
  `config` json DEFAULT NULL COMMENT '配置',
  PRIMARY KEY (`id`),
  KEY `IDX_keyName` (`keyName`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='插件信息';

CREATE TABLE IF NOT EXISTS `material_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='物料';

CREATE TABLE IF NOT EXISTS `marketing_coupon` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券';

CREATE TABLE IF NOT EXISTS `marketing_coupon_use` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='优惠券使用';

CREATE TABLE IF NOT EXISTS `inventory_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存';

CREATE TABLE IF NOT EXISTS `inventory_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='库存日志';

CREATE TABLE IF NOT EXISTS `dict_type` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典类型';

CREATE TABLE IF NOT EXISTS `dict_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='字典项';

CREATE TABLE IF NOT EXISTS `demo_goods` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `title` varchar(50) NOT NULL COMMENT '标题',
  `price` decimal(5,2) NOT NULL COMMENT '价格',
  `description` varchar(500) DEFAULT NULL COMMENT '描述',
  `mainImage` varchar(500) DEFAULT NULL COMMENT '主图',
  `type` int DEFAULT NULL COMMENT '分类',
  `status` int DEFAULT '1' COMMENT '状态',
  `exampleImages` json DEFAULT NULL COMMENT '示例图',
  `stock` int DEFAULT '0' COMMENT '库存',
  PRIMARY KEY (`id`),
  KEY `IDX_title` (`title`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='演示商品';

CREATE TABLE IF NOT EXISTS `customer_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  PRIMARY KEY (`id`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='客户';

CREATE TABLE IF NOT EXISTS `audit_log` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `operatorId` int DEFAULT NULL COMMENT '操作人ID',
  `module` varchar(255) DEFAULT NULL COMMENT '操作模块',
  `action` varchar(255) DEFAULT NULL COMMENT '操作类型',
  `targetId` int DEFAULT NULL COMMENT '目标ID',
  `detail` text COMMENT '详情',
  `actionTime` varchar(255) DEFAULT NULL COMMENT '操作时间',
  PRIMARY KEY (`id`),
  KEY `IDX_operatorId` (`operatorId`),
  KEY `IDX_module` (`module`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='审计日志';

CREATE TABLE IF NOT EXISTS `appointment_info` (
  `id` int NOT NULL AUTO_INCREMENT COMMENT 'ID',
  `createTime` varchar(255) DEFAULT NULL COMMENT '创建时间',
  `updateTime` varchar(255) DEFAULT NULL COMMENT '更新时间',
  `tenantId` int DEFAULT NULL COMMENT '租户ID',
  `customerId` int NOT NULL COMMENT '客户ID',
  `storeId` int DEFAULT NULL COMMENT '门店ID',
  `vehicleId` int DEFAULT NULL COMMENT '车辆ID',
  `serviceId` int DEFAULT NULL COMMENT '服务ID',
  `technicianId` int DEFAULT NULL COMMENT '技师ID',
  `appointmentTime` varchar(255) NOT NULL COMMENT '预约时间',
  `status` int DEFAULT '0' COMMENT '状态 0-待确认 1-已确认 2-已取消 3-已完成',
  `remark` varchar(500) DEFAULT NULL COMMENT '备注',
  PRIMARY KEY (`id`),
  KEY `IDX_customerId` (`customerId`),
  KEY `IDX_tenantId` (`tenantId`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='预约';

SET FOREIGN_KEY_CHECKS = 1;

-- ------------------------------------------------------------
-- 二、基础配置数据（超管、部门、角色、参数、配置、用户角色）
-- 来源：modules/base/db.json，与 cool initDB 导入一致
-- ------------------------------------------------------------

SET @now = DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s');

-- 系统配置（仅当表为空时插入）
INSERT INTO `base_sys_conf` (`cKey`, `cValue`, `createTime`, `updateTime`, `tenantId`)
SELECT * FROM (
  SELECT 'logKeep' AS cKey, '31' AS cValue, @now AS createTime, @now AS updateTime, NULL AS tenantId
  UNION ALL SELECT 'recycleKeep', '31', @now, @now, NULL
) t
WHERE NOT EXISTS (SELECT 1 FROM base_sys_conf LIMIT 1);

-- 参数配置（已存在相同 keyName 则跳过）
INSERT IGNORE INTO `base_sys_param` (`keyName`, `name`, `data`, `dataType`, `remark`, `createTime`, `updateTime`, `tenantId`)
VALUES
  ('rich', '富文本参数', '<h3><strong>这是一个富文本</strong></h3><p>xxx</p><p>xxxxxxxxxx</p><p><br></p>', 1, NULL, @now, @now, NULL),
  ('json', 'JSON参数', '{\n  "code\": 111233\n}', 0, NULL, @now, @now, NULL),
  ('file', '文件', '', 2, NULL, @now, @now, NULL),
  ('text', '测试', '这是一段字符串', 0, NULL, @now, @now, NULL);

-- 部门
INSERT INTO `base_sys_department` (`id`, `name`, `parentId`, `orderNum`, `createTime`, `updateTime`, `tenantId`)
SELECT * FROM (
  SELECT 1 AS id, 'COOL' AS name, NULL AS parentId, 0 AS orderNum, @now AS createTime, @now AS updateTime, NULL AS tenantId
  UNION ALL SELECT 11, '开发', 12, 2, @now, @now, NULL
  UNION ALL SELECT 12, '测试', 1, 1, @now, @now, NULL
  UNION ALL SELECT 13, '游客', 1, 3, @now, @now, NULL
) t
WHERE NOT EXISTS (SELECT 1 FROM base_sys_department WHERE id = 1);

-- 角色（超管）
INSERT INTO `base_sys_role` (`id`, `userId`, `name`, `label`, `remark`, `relevance`, `menuIdList`, `departmentIdList`, `createTime`, `updateTime`, `tenantId`)
SELECT 1, '1', '超管', 'admin', '最高权限的角色', 1, NULL, NULL, @now, @now, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM base_sys_role WHERE id = 1);

-- 用户（超管 admin / 123456）
INSERT INTO `base_sys_user` (`id`, `departmentId`, `name`, `username`, `password`, `passwordV`, `nickName`, `phone`, `email`, `status`, `remark`, `socketId`, `createTime`, `updateTime`, `tenantId`)
SELECT 1, 1, '超级管理员', 'admin', 'e10adc3949ba59abbe56e057f20f883e', 7, '管理员', '18000000000', 'team@cool-js.com', 1, '拥有最高权限的用户', NULL, @now, @now, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM base_sys_user WHERE id = 1);

-- 用户-角色关联（超管 -> 超管角色）
INSERT INTO `base_sys_user_role` (`userId`, `roleId`, `createTime`, `updateTime`, `tenantId`)
SELECT 1, 1, @now, @now, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM base_sys_user_role WHERE userId = 1 AND roleId = 1);

-- 默认租户（登录页「选择租户」下拉有数据时才显示该表单项；无则插入一条）
INSERT INTO `base_sys_tenant` (`name`, `expireDate`, `remark`, `createTime`, `updateTime`, `tenantId`)
SELECT '默认租户', NULL, '初始化默认租户，用于登录页选择', @now, @now, NULL
FROM DUAL
WHERE NOT EXISTS (SELECT 1 FROM base_sys_tenant LIMIT 1);

-- ------------------------------------------------------------
-- 菜单说明：本目录仅保留此一份初始化脚本。租户/连锁/业务等菜单可由
-- 首次启动时 cool.initMenu 从模块自动导入，无需单独 SQL。
-- ------------------------------------------------------------
--
-- 三、可选：历史库修复（仅当 base_sys_user 存在错误唯一索引时执行）
-- 若新增租户时报错 Duplicate entry 'admin' for key... 说明表上存在仅针对 username 的旧唯一索引。
-- 执行前可查看索引：SHOW INDEX FROM base_sys_user;
-- 将下面 DROP INDEX 中的索引名替换为实际错误索引名后再执行。
--
-- ALTER TABLE base_sys_user DROP INDEX IDX_469ad55973f5b98930f6ad627b;
-- ALTER TABLE base_sys_user ADD UNIQUE KEY IDX_tenantId_username (tenantId, username);
--
