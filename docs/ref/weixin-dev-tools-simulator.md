# 微信开发者工具「加载模拟器失败」与目录说明

## 编译输出目录（固定）

HBuilderX / `pnpm run dev:mp-weixin` 编译微信小程序后的**固定输出目录**为：

| 场景 | 路径（相对于 `h5`） |
|------|----------------------|
| 开发 | `unpackage/dist/dev/mp-weixin` |
| 打包 | `unpackage/dist/build/mp-weixin` |

项目根目录 `h5/project.config.json` 中的 `miniprogramRoot` 已指定为上述开发路径。**每次编译结束后**（Vite 构建时）会在输出目录内自动写入一份 `project.config.json`（`miniprogramRoot: "."`），便于用下面「方式二」打开；若使用 HBuilderX 且未自动生成，可在 `h5` 下执行：`node scripts/write-mp-weixin-project-config.js`。

---

## 一、打开目录：两种方式

### 方式一：打开项目根目录（传统）

- 在微信开发者工具中**导入项目**，选择 **`h5`**（即 `moker/h5`）。
- 工具根据根目录下的 `project.config.json` 的 `miniprogramRoot` 去加载 `unpackage/dist/dev/mp-weixin` 下的代码。

### 方式二：直接打开编译产物目录（推荐，无需重新加载项目）

- 先用 HBuilderX 或 `pnpm run dev:mp-weixin` **编译一次**，保证 `h5/unpackage/dist/dev/mp-weixin` 已生成。
- 在微信开发者工具中**导入项目**，选择 **`h5/unpackage/dist/dev/mp-weixin`**（编译产物目录）。
- 该目录内会在每次编译后自动写入 `project.config.json`，项目路径固定，**之后只需在工具里点「编译」即可**，无需再重新导入或重新加载项目。

---

## 二、「加载模拟器失败」时排查

若出现 **「加载模拟器失败」**，按下面顺序排查。

### 推荐操作顺序（每次重新打开工具时）

1. **先编译**
   - 在 HBuilderX 中：**运行 → 运行到小程序模拟器 → 微信开发者工具**，或在本机执行 `pnpm run dev:mp-weixin`。
   - 等待编译完成，保证 `h5/unpackage/dist/dev/mp-weixin` 已生成且不为空。

2. **再打开 / 刷新微信开发者工具**
   - **若用方式二**：导入/打开 **`h5/unpackage/dist/dev/mp-weixin`**，之后每次 HBuilderX 编译完，在工具里点 **「编译」** 即可，无需重新加载项目。
   - **若用方式一**：导入/打开 **`h5`**，在工具里点 **「编译」** 重新加载。

3. **若「重新打开」后模拟器加载失败**
   - 多为编译产物被清理或尚未生成。先在 HBuilderX 再 **运行一次到微信小程序**，等编译完成后再在微信开发者工具里点 **「编译」**。

---

## 三、仍失败时的排查

| 现象 | 处理 |
|------|------|
| 打开的是 `h5` 或编译产物目录仍报错 | 确认 `h5/unpackage/dist/dev/mp-weixin` 下是否有 `app.js`、`app.json` 等文件；没有则先在 HBuilderX 运行到微信小程序一次。 |
| 编译完在 HBuilderX 正常，工具里仍失败 | 在微信开发者工具中 **工具 → 清除缓存 → 全部清除**，再点「编译」。 |
| 模拟器一直白屏 / 报错 | 看微信开发者工具 **控制台** 和 **调试器** 是否有报错；常见为 appid、域名或基础库版本问题。 |

---

## 四、小结

- **编译输出目录固定**：开发为 `h5/unpackage/dist/dev/mp-weixin`，打包为 `h5/unpackage/dist/build/mp-weixin`。
- **避免每次重新加载项目**：在微信开发者工具中直接打开 **`h5/unpackage/dist/dev/mp-weixin`**（方式二），编译后该目录会自动包含 `project.config.json`，之后只需点「编译」即可。
- 若选择打开 **`h5`**（方式一），每次重新打开工具后若加载失败，先运行一次小程序编译再在工具中点「编译」。
