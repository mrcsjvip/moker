-- 为「二、无菜单的页面」批量添加菜单（可重复执行，已存在则跳过）
-- 执行后请用超管账号重新登录或刷新后台；并在 角色管理 中为对应角色勾选「业务管理」下新增的菜单权限。
-- 说明：仅插入页面级菜单(type=1)，按钮权限(type=2)需在 菜单管理 中按各模块接口自行配置，或由后端权限标识在接口上配置后在此补充。

-- ========== 1. 新增父级「业务管理」（挂在「系统管理」下）==========
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT p.id, '业务管理', NULL, NULL, 0, 'icon-list', 6, NULL, 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM base_sys_menu p
WHERE p.name = '系统管理' AND p.type = 0
  AND NOT EXISTS (SELECT 1 FROM base_sys_menu m WHERE m.name = '业务管理' AND m.type = 0 AND m.parentId = p.id)
LIMIT 1;

SET @business_parent_id = (SELECT id FROM base_sys_menu WHERE name = '业务管理' AND type = 0 LIMIT 1);

-- ========== 2. 在「业务管理」下插入各页面菜单（type=1）==========
-- 预约列表
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '预约列表', '/appointment/list', NULL, 1, 'icon-menu', 1, 'modules/appointment/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/appointment/list' AND type = 1);

-- 审计日志
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '审计日志', '/audit/logs', NULL, 1, 'icon-log', 2, 'modules/audit/views/logs.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/audit/logs' AND type = 1);

-- 客户列表
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '客户列表', '/customer/list', NULL, 1, 'icon-user', 3, 'modules/customer/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/customer/list' AND type = 1);

-- 库存列表
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '库存列表', '/inventory/list', NULL, 1, 'icon-menu', 4, 'modules/inventory/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/inventory/list' AND type = 1);

-- 库存日志
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '库存日志', '/inventory/logs', NULL, 1, 'icon-log', 5, 'modules/inventory/views/logs.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/inventory/logs' AND type = 1);

-- 优惠券
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '优惠券', '/marketing/coupon', NULL, 1, 'icon-menu', 6, 'modules/marketing/views/coupon.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/marketing/coupon' AND type = 1);

-- 优惠券使用
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '优惠券使用', '/marketing/coupon-use', NULL, 1, 'icon-menu', 7, 'modules/marketing/views/coupon-use.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/marketing/coupon-use' AND type = 1);

-- 物料管理
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '物料管理', '/material/list', NULL, 1, 'icon-menu', 8, 'modules/material/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/material/list' AND type = 1);

-- 日报报表
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '日报报表', '/report/daily', NULL, 1, 'icon-data', 9, 'modules/report/views/daily.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/report/daily' AND type = 1);

-- 服务管理
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '服务管理', '/service/list', NULL, 1, 'icon-menu', 10, 'modules/service/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/service/list' AND type = 1);

-- 员工管理
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '员工管理', '/staff/list', NULL, 1, 'icon-user', 11, 'modules/staff/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/staff/list' AND type = 1);

-- 门店列表（业务）
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '门店列表', '/store/list', NULL, 1, 'icon-menu', 12, 'modules/store/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/store/list' AND type = 1);

-- 车辆管理
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '车辆管理', '/vehicle/list', NULL, 1, 'icon-menu', 13, 'modules/vehicle/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/vehicle/list' AND type = 1);

-- 工单列表
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '工单列表', '/workorder/list', NULL, 1, 'icon-menu', 14, 'modules/workorder/views/list.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/workorder/list' AND type = 1);

-- 工单步骤
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @business_parent_id, '工单步骤', '/workorder/steps', NULL, 1, 'icon-menu', 15, 'modules/workorder/views/steps.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @business_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/workorder/steps' AND type = 1);

-- ========== 3. 「扩展管理」下增加「AI 代码」==========
SET @ext_parent_id = (SELECT id FROM base_sys_menu WHERE name = '扩展管理' AND type = 0 LIMIT 1);

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @ext_parent_id, 'AI 代码', '/helper/ai-code', NULL, 1, 'icon-menu', 2, 'modules/helper/views/ai-code.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @ext_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/helper/ai-code' AND type = 1);

-- ========== 4. 「框架教程」下增加「测试路由」（演示用）==========
SET @tutorial_parent_id = (SELECT id FROM base_sys_menu WHERE name = '框架教程' AND type = 0 LIMIT 1);

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @tutorial_parent_id, '测试路由', '/demo/test/route', NULL, 1, 'icon-menu', 2, 'modules/demo/views/test/route.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @tutorial_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE router = '/demo/test/route' AND type = 1);
