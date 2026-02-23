import { type PluginConfig } from "@/.cool";
import { isNull, router, useStore } from "@/.cool";

export default {
	install(app) {
		/**
		 * 路由跳转前的全局钩子（如修改 pages.json 后需重新编译项目以确保路由信息生效）
		 * @param to 跳转页
		 * @param from 当前页
		 * @param next 跳转函数
		 */
		router.beforeEach((to, from, next) => {
			const { user } = useStore();
			const path = to.path || "";
			const isEmployeePage = path.startsWith("/pages/employee/");
			const isManagerPage = path.startsWith("/pages/employee/manager-");
			const portal = user.getPortal();

			// 判断是否需要登录
			if (to.isAuth == true || (isNull(to.meta) ? true : to.meta.isAuth == true)) {
				// 如果用户信息为空，则跳转到登录页
				if (!user.isNull()) {
					// 员工端 / 店长端权限与端口校验
					if (isManagerPage) {
						if (!user.hasManagerAccess()) {
							router.push({
								path: "/pages/index/home",
								mode: "reLaunch"
							});
							return;
						}

						// 具备店长权限但当前端口不是店长，限制访问
						if (portal != "manager") {
							router.push({
								path: "/pages/index/home",
								mode: "reLaunch"
							});
							return;
						}
					}

					if (isEmployeePage && !isManagerPage) {
						if (!user.hasEmployeeAccess()) {
							router.push({
								path: "/pages/index/home",
								mode: "reLaunch"
							});
							return;
						}

						// 员工页仅允许 employee/manager 端口
						if (portal == "user") {
							router.push({
								path: "/pages/index/home",
								mode: "reLaunch"
							});
							return;
						}
					}

					next();
				} else {
					router.login();
				}
			} else {
				next();
			}
		});
	}
} as PluginConfig;
