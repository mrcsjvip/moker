# TalkToFigma MCP — 如何设置 Channel（通道）

Cursor 通过 MCP 与 Figma 里的 **Talk to Figma** 插件通信时，两边必须使用**同一个 channel 名称**，否则会报错（如 "Must join a channel" 或 "Not connected to Figma"）。

---

## 1. Channel 是什么？

- **Channel** = 一个“房间名”，用来匹配 **Cursor（MCP 客户端）** 和 **Figma 插件** 之间的连接。
- Cursor 端调用 `join_channel(channel: "xxx")` 时，会尝试加入名为 `"xxx"` 的通道。
- Figma 插件在运行后，会监听某个通道（默认或你在插件里填的）。**两边的通道名必须一致**，才能建立连接。

---

## 2. 在 Cursor 端设置 Channel

在 Cursor 里，由 AI 或你在对话中触发 MCP 的 `join_channel` 时传入通道名，例如：

- **默认**：不传或传空字符串时，多数实现会使用 `"default"`。
- **自定义**：例如 `join_channel(channel: "moker")`，则 Figma 插件也要使用 `moker`。

你可以在对话里直接说：“用 channel 名字 **moker** 连接 Figma”，AI 会调用 `join_channel(channel: "moker")`。

---

## 3. 在 Figma 插件端设置 Channel

在 **Figma 桌面端** 或 **Figma 网页** 中：

1. 打开要设计的文件。
2. 菜单 **Plugins** → 找到并运行 **Talk to Figma**（或你安装的同类 MCP 桥接插件，名称可能为 “Talk to Figma” / “Cursor Figma” 等）。
3. 在插件弹出的面板里查找：
   - **Channel / 通道 / Room** 的输入框，或  
   - **Connect** 按钮旁的设置/下拉框。
4. 输入与 Cursor 端**完全相同**的通道名，例如：
   - 使用默认时填：`default`
   - 使用自定义时填：`moker`（与上面 Cursor 端一致）
5. 点击 **Connect** 或 **Join**（若有），等待插件显示“已连接”或类似提示。
6. 保持插件面板打开、不要关闭 Figma 文件，这样 Cursor 才能持续发送命令。

如果插件**没有** Channel 输入框，说明它可能固定使用 `default`，此时在 Cursor 端用 `join_channel(channel: "default")` 即可。

---

## 4. 推荐流程（一次配好）

| 步骤 | 操作 |
|------|------|
| 1 | 在 Figma 中打开目标文件，运行 **Talk to Figma** 插件 |
| 2 | 在插件里输入 channel 名（如 `default` 或 `moker`），并点击连接 |
| 3 | 在 Cursor 对话中说：“连接 Figma，channel 用 default”（或你选的名称） |
| 4 | 连接成功后，即可在对话中让 AI 在 Figma 里创建/修改画板 |

---

## 5. 常见问题

- **“Must join a channel before sending commands”**  
  Cursor 端还没调用 `join_channel`，或调用失败。先在对话里让 AI “join channel default”（或你的通道名），并确认 Figma 插件已连接同一通道。

- **“Not connected to Figma” / 请求超时**  
  Figma 插件未运行或未连接；或通道名不一致。请确认：插件已打开并连接、channel 与 Cursor 端一致、网络/防火墙未拦截 WebSocket。

- **插件从哪里安装？**  
  在 Figma 里：**Resources** → **Plugins** → 搜索 “Talk to Figma” 或 “Cursor Figma” 安装；或从插件作者提供的 manifest 链接安装（见该插件的官方文档）。

---

## 6. 小结

- **Channel** = Cursor 与 Figma 插件约定的“房间名”。
- **Cursor**：通过 `join_channel(channel: "通道名")` 加入。
- **Figma 插件**：在插件面板里输入**相同**的通道名并连接。
- 两边一致后即可在 Cursor 中通过对话操作 Figma。
