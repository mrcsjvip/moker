import { defineStore } from 'pinia';
import { ref } from 'vue';
import { storage } from '/@/cool/utils';
import { service, router } from '/@/cool';

// 本地缓存
const data = storage.info();

export const useUserStore = defineStore('user', function () {
	// 标识
	const token = ref<string>(data.token);

	// 设置标识
	function setToken(data: {
		token: string;
		expire: number;
		refreshToken: string;
		refreshExpire: number;
	}) {
		// 请求的唯一标识
		token.value = data.token;
		storage.set('token', data.token, data.expire);

		// 刷新 token 的唯一标识
		storage.set('refreshToken', data.refreshToken, data.refreshExpire);
	}

	// 刷新标识
	async function refreshToken(): Promise<string> {
		const stored = storage.get('refreshToken');
		if (!stored) {
			logout();
			return Promise.reject(new Error('登录失效，请重新登录'));
		}
		return new Promise((resolve, reject) => {
			service.base.open
				.refreshToken({ refreshToken: stored })
				.then(res => {
					setToken(res);
					resolve(res.token);
				})
				.catch(err => {
					logout();
					reject(err);
				});
		});
	}

	// 用户信息
	const info = ref<Eps.BaseSysUserEntity | null>(data.userInfo);

	// 设置用户信息
	function set(value: any) {
		info.value = value;
		storage.set('userInfo', value);
	}

	// 清除用户
	function clear() {
		storage.remove('userInfo');
		storage.remove('token');
		storage.remove('refreshToken');
		token.value = '';
		info.value = null;
	}

	// 退出
	async function logout() {
		clear();
		router.clear();
		router.push('/login');
	}

	// 获取用户信息
	async function get() {
		return service.base.comm.person().then(res => {
			set(res);
			return res;
		});
	}

	return {
		token,
		info,
		get,
		set,
		logout,
		clear,
		setToken,
		refreshToken
	};
});
