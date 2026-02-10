import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/report/daily',
				meta: { label: '日报表' },
				component: () => import('./views/daily.vue')
			}
		]
	};
};
