import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/store/list',
				meta: { label: '门店管理' },
				component: () => import('./views/list.vue')
			}
		]
	};
};
