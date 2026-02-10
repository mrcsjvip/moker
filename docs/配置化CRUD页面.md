# 配置化 CRUD 页面（低代码方式）

通过配置文件即可新增列表+表单的 CRUD 页面，无需为每个业务单独写 Vue 页面。

## 适用场景

- 标准增删改查：表格 + 搜索 + 分页 + 新增/编辑弹窗
- 后端已有对应 entity、controller、service（标准 Cool 风格）
- 不需要复杂自定义交互或自定义列渲染

## 新增一个配置化页面的步骤

### 1. 后端（若尚未有接口）

- 在 `server` 中按项目规范添加：entity、controller、service（可参考 `base_sys_tenant`、`chain_headquarters` 等）。
- 确保列表接口支持分页，新增/编辑接口符合现有 DTO 与权限体系。

### 2. 前端：添加配置

在 **`admin/src/modules/base/config/crud-pages.ts`** 中增加一条 `CrudPageConfig`：

- **key**：唯一标识，与路由 `/sys/dynamic/:key` 中的 `:key` 一致（如 `tenant`、`chain_headquarters`）。
- **servicePath**：请求服务路径，如 `base.sys.tenant`，对应 `service.base.sys.tenant`。
- **columns**：表格列（prop、label、type、buttons 等），与 `cl-table` 列配置一致。
- **formItems**：新增/编辑表单项（prop、label、component 等），与 `cl-upsert` 表单项一致。
- **dialogWidth**：弹窗宽度（可选）。
- **formOptions**：若表单项为下拉框且选项来自其他接口，在此配置 `listPath`、`listMethod`、`labelKey`、`valueKey` 等。

示例见该文件中的 `tenant`、`chain_headquarters`、`chain_store`。

### 3. 菜单与路由

- 在 **系统管理 → 权限管理 → 菜单管理** 中新增菜单（或通过 SQL 初始化）：
  - **路由 path**：`/sys/dynamic/<key>`，例如 `/sys/dynamic/tenant`、`/sys/dynamic/chain_headquarters`。
  - **视图路径 viewPath**：`modules/base/views/dynamic-crud.vue`（固定为通用配置化页面）。
- 保存后，该菜单会对应动态路由，打开菜单即进入配置化 CRUD 页，表格与表单由 `crud-pages.ts` 中对应 key 的配置驱动。

### 4. 路由与 remount

- 布局中已对 `<router-view>` 的组件使用 **`:key="route.path"`**，因此从 `/sys/dynamic/tenant` 切换到 `/sys/dynamic/chain_headquarters` 时会正确 remount，避免共用同一组件导致配置错乱。

## 配置项说明（摘要）

| 字段 | 说明 |
|------|------|
| key | 与路由 `/sys/dynamic/:key` 对应 |
| servicePath | 如 `base.sys.tenant`，对应 service 调用 |
| columns | 表格列，支持 type: selection/op、buttons、sortable 等 |
| formItems | 表单项，component.name 如 el-input、el-date-picker |
| formOptions | 下拉选项来源：listPath、listMethod、labelKey、valueKey |
| dialogWidth | 新增/编辑弹窗宽度 |
| searchPlaceholder | 搜索框占位 i18n key（可选） |

## 超出配置能力时

若需要自定义列渲染、复杂校验、多步骤表单等，可改为单独写 Vue 页面（如 `tenant.vue`、`chain-headquarters.vue`），并在菜单中配置该页面的 viewPath，与配置化页面并存使用。
