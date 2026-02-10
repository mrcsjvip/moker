import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/appointment/list',
				meta: { label: '预约管理' },
				component: () => import('./views/list.vue')
			}
		]
	};
};
