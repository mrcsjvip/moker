import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/staff/list',
				meta: { label: '员工档案' },
				component: () => import('./views/list.vue')
			}
		]
	};
};
