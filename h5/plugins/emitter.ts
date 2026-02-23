import { type PluginConfig } from "@/.cool";

export default {
	install(app: VueApp) {
		uni.$on("cool.vibrate", (duration: number | null) => {
			// 直接使用 uni 内置震动，避免 mp-weixin UTS 插件兼容问题
			// #ifdef MP-WEIXIN
			uni.vibrateShort({
				type: "medium"
			});
			// #endif

			// #ifndef MP-WEIXIN
			if ((duration ?? 1) > 1) {
				uni.vibrateLong();
			} else {
				uni.vibrateShort();
			}
			// #endif
		});
	}
} as PluginConfig;
