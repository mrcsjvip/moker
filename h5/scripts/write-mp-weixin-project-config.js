#!/usr/bin/env node
/**
 * 向微信小程序编译产物目录写入 project.config.json（miniprogramRoot: "."），
 * 便于在微信开发者工具中「只打开该目录一次」，后续编译无需重新加载项目。
 * 使用方式：在 vite 插件 buildEnd 中调用，或手动执行 node scripts/write-mp-weixin-project-config.js
 */
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");

// 与 project.config.json / manifest 对齐的固定输出目录（HBuilderX / uni 编译产物位置）
const MP_WEIXIN_OUTPUT_DEV = path.join(root, "unpackage", "dist", "dev", "mp-weixin");
const MP_WEIXIN_OUTPUT_BUILD = path.join(root, "unpackage", "dist", "build", "mp-weixin");

function readJson(filePath) {
	if (!fs.existsSync(filePath)) return null;
	try {
		return JSON.parse(fs.readFileSync(filePath, "utf8"));
	} catch {
		return null;
	}
}

function writeProjectConfigTo(dir) {
	if (!fs.existsSync(dir)) return;
	const rootConfig = readJson(path.join(root, "project.config.json"));
	const manifest = readJson(path.join(root, "manifest.json"));
	const appid = manifest?.["mp-weixin"]?.appid || rootConfig?.appid || "touristappid";
	const projectname = rootConfig?.projectname || "moker-h5";
	const setting = rootConfig?.setting || { es6: true, postcss: true, minified: false, urlCheck: false };

	const config = {
		appid,
		projectname,
		compileType: "miniprogram",
		miniprogramRoot: ".",
		setting,
	};
	fs.writeFileSync(path.join(dir, "project.config.json"), JSON.stringify(config, null, 2) + "\n");
	console.log("[mp-weixin] project.config.json written to", dir);
}

// 支持传入路径，如 node write-mp-weixin-project-config.js unpackage/dist/build/mp-weixin
const customDir = process.argv[2];
if (customDir) {
	const abs = path.isAbsolute(customDir) ? customDir : path.join(root, customDir);
	writeProjectConfigTo(abs);
} else {
	writeProjectConfigTo(MP_WEIXIN_OUTPUT_DEV);
	writeProjectConfigTo(MP_WEIXIN_OUTPUT_BUILD);
}
