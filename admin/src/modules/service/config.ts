import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/service/list',
				meta: { label: '服务项目' },
				component: () => import('./views/list.vue')
			}
		]
	};
};
