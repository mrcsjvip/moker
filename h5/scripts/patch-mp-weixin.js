#!/usr/bin/env node
/**
 * 安装后打补丁，使 pnpm run dev:mp-weixin 能通过编译：
 * 1. @cool-vue/unix 注入的样式改为 @use
 * 2. @dcloudio/uni-app 的 vue 未导出 API 用本地 stub
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// 1. patch @cool-vue/unix dist
const unixPath = path.join(root, "node_modules/@cool-vue/unix/dist/index.js");
if (fs.existsSync(unixPath)) {
  let c = fs.readFileSync(unixPath, "utf8");
  if (c.includes('@import "@/.cool/index.scss"') && !c.includes('@use "@/.cool/index.scss"')) {
    c = c.replace('@import "@/.cool/index.scss"', '@use "@/.cool/index.scss" as *');
    fs.writeFileSync(unixPath, c);
    console.log("[patch] @cool-vue/unix: @import -> @use");
  }
}

// 2. patch @dcloudio/uni-app dist-x (all copies under node_modules)
const patchUniApp = (filePath) => {
  if (!fs.existsSync(filePath)) return;
  let c = fs.readFileSync(filePath, "utf8");
  if (c.includes("function injectHook() {}")) return;
  if (!c.includes("injectHook } from 'vue'")) return;
  c = c.replace(
    /import \{ shallowRef, ref, getCurrentInstance(?:, isInSSRComponentSetup)?, injectHook \} from 'vue';\n?/,
    "import { shallowRef, ref, getCurrentInstance } from 'vue';\nconst isInSSRComponentSetup = false;\nfunction injectHook() {}\n"
  );
  fs.writeFileSync(filePath, c);
  console.log("[patch] @dcloudio/uni-app:", filePath.replace(root, ""));
};

// 只遍历 node_modules 和 node_modules/.pnpm 下的 @dcloudio/uni-app
const nm = path.join(root, "node_modules");
const tryPatch = (p) => {
  const f = path.join(p, "dist-x", "uni-app.es.js");
  if (fs.existsSync(f)) patchUniApp(f);
};
if (fs.existsSync(nm)) {
  const unixApp = path.join(nm, "@dcloudio", "uni-app");
  tryPatch(unixApp);
  const pnpm = path.join(nm, ".pnpm");
  if (fs.existsSync(pnpm)) {
    const dirs = fs.readdirSync(pnpm);
    for (const d of dirs) {
      if (d.startsWith("@dcloudio+uni-app")) {
        tryPatch(path.join(pnpm, d, "node_modules", "@dcloudio", "uni-app"));
      }
    }
  }
}

// 3. patch uni_modules: remove UTSJSONObject import from @dcloudio/uni-shared (not exported in mp-weixin build)
const uniModulesDir = path.join(root, "uni_modules");
const utsJsonObjectImportRe = /import\s*\{\s*UTSJSONObject\s*\}\s*from\s*['"]@dcloudio\/uni-shared['"]\s*;?\s*\n?/g;
const utsLocalType = "type UTSJSONObject = Record<string, any>;\n";

function patchFile(filePath) {
  if (!fs.existsSync(filePath)) return false;
  let c = fs.readFileSync(filePath, "utf8");
  if (!c.includes("UTSJSONObject") || !c.includes("@dcloudio/uni-shared")) return false;
  const before = c;
  c = c.replace(utsJsonObjectImportRe, "");
  if (c === before) return false;
  const ext = path.extname(filePath);
  if (ext === ".uts" && c.includes("UTSJSONObject")) {
    const hasLocalType = /\btype\s+UTSJSONObject\s*=/.test(c);
    if (!hasLocalType) c = utsLocalType + c;
  }
  fs.writeFileSync(filePath, c);
  console.log("[patch] uni_modules:", path.relative(root, filePath));
  return true;
}

function walkDir(dir) {
  if (!fs.existsSync(dir)) return;
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walkDir(full);
    else if (e.name.endsWith(".uts") || e.name.endsWith(".ts")) patchFile(full);
  }
}

walkDir(uniModulesDir);

// 4. Always overwrite cool-vibrate mp-weixin (HBuilderX/插件市场可能恢复带 UTSJSONObject 的版本)
const coolVibrateMpWeixin = path.join(uniModulesDir, "cool-vibrate", "utssdk", "mp-weixin", "index.uts");
const safeContent = `/**
 * 震动（mp-weixin）
 * @param {number} duration 震动时间单位ms,ios微信失效
 */
export function vibrate(duration: number) {
\twx.vibrateShort({
\t\ttype: "medium",
\t\tsuccess() {},
\t\tfail(error) {
\t\t\tconsole.error("微信:震动失败");
\t\t}
\t});
}
`;
if (fs.existsSync(path.dirname(coolVibrateMpWeixin))) {
  fs.writeFileSync(coolVibrateMpWeixin, safeContent);
  console.log("[patch] uni_modules: cool-vibrate/utssdk/mp-weixin/index.uts (forced)");
}

console.log("[patch] mp-weixin patches applied.");
