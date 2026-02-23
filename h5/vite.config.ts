import { defineConfig } from "vite";
import { cool } from "@cool-vue/unix";
import { proxy } from "./config/proxy";
import tailwindcss from "tailwindcss";
import { join } from "node:path";
import { writeFileSync, existsSync, readFileSync } from "node:fs";
import uni from "@dcloudio/vite-plugin-uni";

const resolve = (dir: string) => join(__dirname, dir);

/** 微信小程序编译产物固定目录，与微信开发者工具打开路径一致，避免每次重新加载项目 */
const MP_WEIXIN_OUTPUT_DEV = join(__dirname, "unpackage/dist/dev/mp-weixin");
const MP_WEIXIN_OUTPUT_BUILD = join(__dirname, "unpackage/dist/build/mp-weixin");

function writeMpWeixinProjectConfig(): import("vite").Plugin {
	return {
		name: "write-mp-weixin-project-config",
		apply: "build",
		closeBundle() {
			if (process.env.UNI_PLATFORM !== "mp-weixin") return;
			const rootConfig = (() => {
				try {
					return JSON.parse(readFileSync(join(__dirname, "project.config.json"), "utf8"));
				} catch {
					return {};
				}
			})();
			const manifest = (() => {
				try {
					return JSON.parse(readFileSync(join(__dirname, "manifest.json"), "utf8"));
				} catch {
					return {};
				}
			})();
			const appid = manifest["mp-weixin"]?.appid ?? rootConfig.appid ?? "touristappid";
			const projectname = rootConfig.projectname ?? "moker-h5";
			const setting = rootConfig.setting ?? { es6: true, postcss: true, minified: false, urlCheck: false };
			const config = {
				appid,
				projectname,
				compileType: "miniprogram",
				miniprogramRoot: ".",
				setting
			};
			for (const dir of [MP_WEIXIN_OUTPUT_DEV, MP_WEIXIN_OUTPUT_BUILD]) {
				if (existsSync(dir)) {
					writeFileSync(join(dir, "project.config.json"), JSON.stringify(config, null, 2) + "\n");
				}
			}
		}
	};
}

for (const i in proxy) {
	proxy[`/${i}/`] = proxy[i];
}

// 将 @cool-vue/unix 注入的 @import 改为 @use，消除 Sass 弃用警告
function fixScssImport(): import("vite").Plugin {
	return {
		name: "fix-cool-unix-scss-import",
		enforce: "post",
		transform(code, id) {
			if (id.includes("App.uvue") && code.includes('@import "@/.cool/index.scss"')) {
				return { code: code.replace('@import "@/.cool/index.scss"', '@use "@/.cool/index.scss" as *'), map: null };
			}
		}
	};
}

export default defineConfig({
	plugins: [
		uni(),
		writeMpWeixinProjectConfig(),
		cool({
			proxy
		}),
		fixScssImport()
	],

	// 避免对 uni-app / vue 等做依赖预构建时卡住，首屏编译会稍慢但更稳定
	optimizeDeps: {
		exclude: ["@dcloudio/vite-plugin-uni", "@dcloudio/uni-components", "vue"]
	},

	server: {
		port: 9900,
		host: true, // 监听 0.0.0.0，本机与局域网均可访问（如手机扫码、同 WiFi 设备）
		proxy,
		// Docker 下减少无关目录触发重新编译，避免一直停在 Compiling
		watch: {
			ignored: ["**/node_modules/**", "**/.git/**", "**/.pnpm/**", "**/dist/**", "**/.cool/**"]
		}
	},

	css: {
		postcss: {
			plugins: [tailwindcss({ config: resolve("./tailwind.config.ts") })]
		}
	}
});
