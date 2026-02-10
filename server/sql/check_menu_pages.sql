-- 检查数据库中当前配置的「页面级」菜单（type=1）
-- 用于对照 admin 下实际页面，确认管理员能否看到所有页面
-- 执行方式：mysql -u root -p your_db < server/sql/check_menu_pages.sql

SELECT
  id,
  name AS menu_name,
  router,
  viewPath,
  type,
  orderNum,
  parentId
FROM base_sys_menu
WHERE type = 1
ORDER BY parentId, orderNum, id;
