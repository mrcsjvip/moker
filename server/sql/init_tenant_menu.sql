-- 租户管理菜单初始化（可重复执行，已存在则跳过）
-- 执行后请用超管账号重新登录或刷新后台，即可在 系统管理 -> 权限管理 下看到「租户管理」

-- 1. 插入「租户管理」主菜单（父级为「权限管理」，不存在时才插入）
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT p.id, '租户管理', '/sys/tenant', NULL, 1, 'icon-dept', 4, 'modules/base/views/tenant.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM base_sys_menu p
WHERE p.name = '权限管理' AND p.type = 0
  AND NOT EXISTS (SELECT 1 FROM base_sys_menu m WHERE m.name = '租户管理' AND m.router = '/sys/tenant' AND m.type = 1)
LIMIT 1;

-- 2. 插入「租户管理」下的 4 个按钮权限（仅当该父菜单存在且尚无「新增」子菜单时插入）
SET @tenant_menu_id = (SELECT id FROM base_sys_menu WHERE name = '租户管理' AND router = '/sys/tenant' AND type = 1 LIMIT 1);

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @tenant_menu_id, '新增', NULL, 'base:sys:tenant:add', 2, NULL, 1, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @tenant_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:tenant:add');

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @tenant_menu_id, '删除', NULL, 'base:sys:tenant:delete', 2, NULL, 2, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @tenant_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:tenant:delete');

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @tenant_menu_id, '修改', NULL, 'base:sys:tenant:update', 2, NULL, 3, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @tenant_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:tenant:update');

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @tenant_menu_id, '查询', NULL, 'base:sys:tenant:page,base:sys:tenant:list,base:sys:tenant:info', 2, NULL, 4, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @tenant_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:tenant:page,base:sys:tenant:list,base:sys:tenant:info');
