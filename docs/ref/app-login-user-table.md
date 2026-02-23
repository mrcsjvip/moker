# 小程序/APP 登录与用户表说明

## 会写入哪张表

**手机号验证码登录**（含测试号 18000000000 / 123456）和**微信授权登录**写入的都是 **C 端用户表**：

| 表名 | 说明 |
|------|------|
| **`user_info`** | 小程序/公众号/H5 用户，手机号或微信登录后**一定会**在此表创建或复用一条记录 |

- 实体：`server/src/modules/user/entity/info.ts` → `@Entity('user_info')`
- 库名：与项目配置一致，默认 `moker`，即 **`moker.user_info`**

**不会**写入后台管理员表 `base_sys_user`。若开启了身份同步，会在登录后**额外**在 `base_sys_user` 里创建/更新后台账号，并写入 `user_account_bind` 绑定关系，但**主用户记录**始终在 `user_info`。

---

## 手机号登录流程（18000000000 + 123456）

1. 前端：`POST /app/user/login/phone`，body `{ "phone": "18000000000", "smsCode": "123456" }`
2. 控制器：`AppUserLoginController.phone()` 取 body 的 `phone`、`smsCode`，调 `phoneVerifyCode(phone, smsCode)`
3. 服务：`phoneVerifyCode` 校验为测试号或短信验证码通过 → 调 `phone(phone)`
4. 服务：`phone(phone)` 用 `userInfoEntity`（对应表 `user_info`）按 `phone` 查询，**若无则 `save()` 插入一条**，再生成 token 返回

因此只要请求到达并校验通过，**一定会**在 `user_info` 里有一条对应手机号的记录。

---

## 请求没到本机（日志里没有 [app-login]）

微信小程序在**开发环境**下，接口 baseUrl 来自 **`h5/config/proxy.ts`** 的 `dev.target`（未设置 `VITE_PROXY_TARGET` 时用默认值）：

- **已改为默认**：`http://localhost:8002`（对应本机 Docker 映射 8002→8001，或本机直接跑服务端时请改为 `http://localhost:8001`）。
- 若小程序在**真机**调试，本机 localhost 无效，需在构建/运行前设置 **`VITE_PROXY_TARGET=http://本机IP:8002`**（如 `http://192.168.1.100:8002`），再编译或运行小程序。

修改默认或按环境指定：编辑 **`h5/config/proxy.ts`** 里 `devTarget`，或设置环境变量 **`VITE_PROXY_TARGET`**。

---

## 登录后查不到数据时的排查

按顺序确认：

1. **请求是否到达当前服务**
   - 看 `docker logs -f moker-server-1`（或本机运行时的控制台）是否有：
     - `[app-login] phone verify, phone=18000000000`
     - `[app-login] user_info save start, phone=18000000000`
     - `[app-login] user_info created, userId=xxx, phone=18000000000`
   - 若**一条都没有**：请求没打到这台服务（例如小程序里 baseURL 配的是别的环境），或端口/网络不对。

2. **是否报错导致未写入**
   - 若出现 `[app-login] user_info save failed`：说明 `save()` 抛错（例如 DB 连接、唯一约束、字段不兼容），看后面的 `err=` 信息排查。
   - 若前端收到「验证码错误」：说明 `phoneVerifyCode` 里校验未通过（测试号不匹配或短信码错误），不会执行 `phone()`，自然不会写表。

3. **查的库是否是当前服务用的库**
   - 执行 `SELECT * FROM moker.user_info;` 时，确认连接的 MySQL 与当前运行服务的配置一致（`DB_HOST`、`DB_PORT`、`DB_NAME`）。
   - Docker 里服务一般用 `DB_NAME=moker`，本机直连 MySQL 时也要选同一库。

4. **表是否存在**
   - 若从未执行过建表：需要执行 `server/sql/init.sql` 或让 TypeORM 同步实体，保证存在 `user_info` 表。

---

## 小结

- 小程序用 **18000000000 + 123456** 登录时，用户记录写在 **`moker.user_info`**。
- 若表里没有数据，优先看服务日志里是否有 `[app-login]` 的几条输出，再根据是否有 `user_info save failed` 和连接库、表是否存在逐项排查。
