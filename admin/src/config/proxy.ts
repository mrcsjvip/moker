const env =
	typeof process !== 'undefined' && process.env
		? process.env
		: (import.meta as any).env || {};
const apiHost = env.VITE_API_HOST || 'http://127.0.0.1:8001';

const proxy = {
	'/dev/': {
		target: apiHost,
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/dev/, '')
	},

	'/prod/': {
		target: 'https://show.cool-admin.com',
		changeOrigin: true,
		rewrite: (path: string) => path.replace(/^\/prod/, '/api')
	}
};

const value = 'dev';
const host = proxy[`/${value}/`]?.target;

export { proxy, host, value };
