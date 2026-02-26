# 插件下载、使用与自建部署说明

## 一、插件机制概览

### 1. 两种插件来源

| 类型 | 位置 | 加载方式 |
|------|------|----------|
| **内置 Hook** | `server/src/modules/plugin/hooks/<name>/` | 启动时从磁盘读取，无需安装 |
| **可安装插件** | 数据库 `plugin_info` + 运行时文件 | 通过后台「安装」写入 DB 与文件，再在后台启用 |

当前内置 Hook 示例：`upload`（文件上传），配置在 `server/src/modules/plugin/config.ts` 的 `hooks.upload`。

### 2. 插件不是“服务器下载”的

- **插件市场列表**：后台「全部插件」来自 **外部 API**（默认 `https://service.cool-js.com/api/app/plugin/info/page`），仅用于展示和跳转文档。
- **实际安装**：由**管理员在后台上传 `.cool` 包**完成，后端只处理“上传 + 解压 + 写入 DB/文件”，不会从市场 URL 自动下载插件。

因此：**自建服务器上使用插件 = 拿到 .cool 包 + 在自建后台里上传安装 + 配置并启用**。

---

## 二、插件的安装与存储

### 1. 安装流程（后台）

1. 登录 **管理后台** → 进入 **插件** 相关页面（如「帮助/插件」或「已安装」）。
2. **已安装** 列表左上角有「+」上传入口，支持 **`.cool` 文件**（实为 ZIP）。
3. 选择本地的 `.cool` 文件上传，请求会发到后端：`POST /admin/plugin/info/install`（multipart，字段 `files` + `force`）。
4. 后端会：
   - 解压 ZIP，校验并读取 `plugin.json`、`readme`、`logo`、`src/index.js`、`source/index.ts`
   - 写入/更新表 `plugin_info`
   - 将插件内容保存到 **运行时插件目录**（见下）
   - 若安装成功且未禁用，会触发插件重新加载（如通过全局事件 `GLOBAL_EVENT_PLUGIN_INIT`）。

### 2. 插件包结构（ZIP / .cool）

后端期望 ZIP 内至少包含：

```
plugin.json      # 元信息：name, key, version, author, hook, config 等
readme           # 说明文档（文件名由 plugin.json 的 readme 指定）
logo             # 图标（文件名由 plugin.json 的 logo 指定，base64 内容）
src/index.js     # 运行时使用的插件实现
source/index.ts  # 源码，用于生成 .d.ts
```

- `plugin.json` 中 `key` 为插件唯一标识（如 `sms-tx`、`sms-ali`），且不能为 `plugin`。
- 安装时若已存在同 `keyName`，会做更新并尽量保留已有配置。

### 3. 插件在服务器上的存储位置

- **数据库**：表 `plugin_info` 存名称、key、版本、启用状态、配置、说明等；大块内容（如压缩后的代码）也会落库，但运行时优先读文件。
- **文件**：路径由 `server/src/comm/path.ts` 中的 `pPluginPath()` 决定：
  - 基础目录：`pDataPath()` = `~/.cool-admin/<md5(keys)>/`
  - 插件目录：`<pDataPath>/plugin/`
  - 每个插件一个文件（名一般为插件 key），内容为 JSON：`{ content: { type, data }, tsContent: { type, data } }`。

自建部署时需保证该目录可写，且备份/迁移时如需要可一并备份 `~/.cool-admin/` 下对应数据目录。

---

## 三、短信插件在自建服务器上的使用（示例）

### 1. 业务侧如何用短信

- 用户模块的短信发送在 `server/src/modules/user/service/sms.ts`（如 `UserSmsService`）。
- 该服务通过 **PluginService** 按 key 取插件实例，当前会依次尝试：`sms-tx`、`sms-ali`，取到第一个可用实例即用其发短信。
- 未安装或未启用对应插件时，会抛出类似「未配置短信插件，请到插件市场下载安装配置：https://cool-js.com/plugin?keyWord=短信」的提示。

### 2. 在自建环境接入短信插件

1. **获取 .cool 包**
   - 从 [cool-js 插件市场](https://cool-js.com/plugin?keyWord=短信) 下载对应短信插件（如腾讯云、阿里云短信）的 `.cool` 包；或从其它可信渠道获取符合上述 ZIP 结构的包并重命名为 `.cool`。
2. **在自建后台安装**
   - 登录自建后台 → 插件/已安装 → 点击「+」→ 选择该 `.cool` 文件上传。
   - 安装成功后，在「已安装」列表中会看到该插件，并可进行启用/禁用。
3. **配置并启用**
   - 在插件列表中点击该插件的「设置」，填写所需配置（如厂商的 appId、密钥、签名等），保存。
   - 确保插件状态为 **启用**（列表中有启用开关）。
4. **（可选）用户模块配置**
   - 若项目中有 `module.user.sms` 等配置（如超时时间、默认插件 key），在自建环境的配置里按需填写，以便 `UserSmsService` 使用正确的超时和插件。

完成后，自建服务器上的登录/注册等调用 `UserSmsService.sendSms()` 的流程即可使用该短信插件，**无需**服务器能访问外网插件市场；只要有一次把 .cool 包上传到当前环境即可。

### 3. 自建环境无法访问外网时

- 「全部插件」列表依赖 `https://service.cool-js.com/api`，若完全内网可考虑：
  - 不依赖该列表：直接在能上网的环境下载好 `.cool`，再通过 U 盘/内网文件共享等方式拷贝到自建环境，在后台「已安装」里上传；
  - 或自建一个简单的“插件市场”接口，仅用于在内网提供 .cool 下载链接或列表，安装仍通过当前后台上传接口完成。
- 插件安装与运行**不依赖**对 cool-js.com 的访问，只依赖正确的 .cool 包与后台上传接口。

---

## 四、内置 Hook 与可安装插件的区别

- **内置 Hook**（如 `upload`）  
  - 代码在 `server/src/modules/plugin/hooks/<name>/`，随项目发布。  
  - 配置在 `server/src/modules/plugin/config.ts` 的 `hooks.<name>`（如 `hooks.upload` 的 `domain`）。  
  - 无需在后台安装、上传；只要启用了插件模块，就会在启动时被加载。

- **可安装插件**（如 `sms-tx`、`sms-ali`）  
  - 通过后台上传 `.cool` 安装，信息在 `plugin_info` 与 `pPluginPath()` 下的文件中。  
  - 在后台可启用/禁用、修改配置；重启后由插件中心根据 DB 状态重新加载。

---

## 五、接口与配置要点小结

| 项目 | 说明 |
|------|------|
| 安装接口 | `POST /admin/plugin/info/install`，表单字段：`files`（.cool 文件）、`force`（是否强制覆盖） |
| 插件市场 API | 默认 `helper.options.api` = `https://service.cool-js.com/api`，用于「全部插件」列表；自建可改或不用 |
| 插件存储目录 | `pPluginPath()` = `~/.cool-admin/<md5(keys)>/plugin/` |
| 短信插件 key | 业务代码中使用的为 `sms-tx` 或 `sms-ali`，需与插件包内 `plugin.json.key` 一致 |

按上述方式即可在自建服务器上通过“上传 .cool + 配置 + 启用”使用短信等插件，无需服务器主动从外网下载插件。
