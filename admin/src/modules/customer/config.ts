import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/customer/list',
				meta: { label: '客户管理' },
				component: () => import('./views/list.vue')
			}
		]
	};
};
