import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/vehicle/list',
				meta: { label: '车辆管理' },
				component: () => import('./views/list.vue')
			}
		]
	};
};
