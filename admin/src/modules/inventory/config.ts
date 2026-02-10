import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/inventory/list',
				meta: { label: '库存管理' },
				component: () => import('./views/list.vue')
			},
			{
				path: '/inventory/logs',
				meta: { label: '库存流水' },
				component: () => import('./views/logs.vue')
			}
		]
	};
};
