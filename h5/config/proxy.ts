// 开发环境接口地址：微信小程序/H5 非代理时请求该地址
// 未设置时默认本地服务（Docker 映射 8002→8001，本机直接跑则为 8001）
const devTarget =
	(typeof process !== "undefined" && process.env?.VITE_PROXY_TARGET) ||
	"http://localhost:8002";

export const proxy = {
	// 开发环境：H5 用 /dev 走 Vite 代理，微信小程序用 dev.target 直连
	dev: {
		target: devTarget,
		changeOrigin: true,
		rewrite: (path: string) => path.replace("/dev", "")
	},

	// 生产环境配置
	prod: {
		target: "https://show.cool-admin.com",
		changeOrigin: true,
		rewrite: (path: string) => path.replace("/prod", "/api")
	}
};

export const value = "dev";
