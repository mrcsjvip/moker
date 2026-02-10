-- 连锁管理菜单初始化（总部管理、门店管理），可重复执行，已存在则跳过
-- 执行后请用超管账号重新登录或刷新后台，即可在 系统管理 下看到「连锁管理」-> 总部管理、门店管理
-- 若访问 /admin/base/sys/chain_headquarters/list 等接口仍 403：请在 角色管理 中为该角色勾选「总部管理/门店管理」及所需权限，并让该用户重新登录（见 docs/403权限排查.md）

-- 1. 插入「连锁管理」目录（父级为「系统管理」）
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT p.id, '连锁管理', NULL, NULL, 0, 'icon-dept', 5, NULL, 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM base_sys_menu p
WHERE p.name = '系统管理' AND p.type = 0
  AND NOT EXISTS (SELECT 1 FROM base_sys_menu m WHERE m.name = '连锁管理' AND m.type = 0 AND m.parentId = p.id)
LIMIT 1;

-- 2. 插入「总部管理」菜单（父级为「连锁管理」）
SET @chain_parent_id = (SELECT id FROM base_sys_menu WHERE name = '连锁管理' AND type = 0 LIMIT 1);

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @chain_parent_id, '总部管理', '/sys/chain-headquarters', NULL, 1, 'icon-menu', 1, 'modules/base/views/chain-headquarters.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @chain_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE name = '总部管理' AND router = '/sys/chain-headquarters');

-- 3. 插入「总部管理」下的按钮权限
SET @hq_menu_id = (SELECT id FROM base_sys_menu WHERE name = '总部管理' AND router = '/sys/chain-headquarters' AND type = 1 LIMIT 1);

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @hq_menu_id, '新增', NULL, 'base:sys:chain_headquarters:add', 2, NULL, 1, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @hq_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_headquarters:add');
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @hq_menu_id, '删除', NULL, 'base:sys:chain_headquarters:delete', 2, NULL, 2, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @hq_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_headquarters:delete');
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @hq_menu_id, '修改', NULL, 'base:sys:chain_headquarters:update', 2, NULL, 3, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @hq_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_headquarters:update');
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @hq_menu_id, '查询', NULL, 'base:sys:chain_headquarters:page,base:sys:chain_headquarters:list,base:sys:chain_headquarters:info', 2, NULL, 4, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @hq_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_headquarters:page,base:sys:chain_headquarters:list,base:sys:chain_headquarters:info');

-- 4. 插入「门店管理」菜单（父级为「连锁管理」）
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @chain_parent_id, '门店管理', '/sys/chain-store', NULL, 1, 'icon-menu', 2, 'modules/base/views/chain-store.vue', 1, 1,
  DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL
FROM DUAL WHERE @chain_parent_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE name = '门店管理' AND router = '/sys/chain-store');

-- 5. 插入「门店管理」下的按钮权限
SET @store_menu_id = (SELECT id FROM base_sys_menu WHERE name = '门店管理' AND router = '/sys/chain-store' AND type = 1 LIMIT 1);

INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @store_menu_id, '新增', NULL, 'base:sys:chain_store:add', 2, NULL, 1, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @store_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_store:add');
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @store_menu_id, '删除', NULL, 'base:sys:chain_store:delete', 2, NULL, 2, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @store_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_store:delete');
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @store_menu_id, '修改', NULL, 'base:sys:chain_store:update', 2, NULL, 3, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @store_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_store:update');
INSERT INTO base_sys_menu (parentId, name, router, perms, type, icon, orderNum, viewPath, keepAlive, isShow, createTime, updateTime, tenantId)
SELECT @store_menu_id, '查询', NULL, 'base:sys:chain_store:page,base:sys:chain_store:list,base:sys:chain_store:info', 2, NULL, 4, NULL, 0, 1, DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), DATE_FORMAT(NOW(), '%Y-%m-%d %H:%i:%s'), NULL FROM DUAL WHERE @store_menu_id IS NOT NULL AND NOT EXISTS (SELECT 1 FROM base_sys_menu WHERE perms = 'base:sys:chain_store:page,base:sys:chain_store:list,base:sys:chain_store:info');
