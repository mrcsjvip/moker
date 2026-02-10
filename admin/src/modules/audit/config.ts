import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/audit/logs',
				meta: { label: '审计日志' },
				component: () => import('./views/logs.vue')
			}
		]
	};
};
