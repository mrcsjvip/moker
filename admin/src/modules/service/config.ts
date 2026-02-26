import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/service/list',
				meta: { label: '服务项目' },
				component: () => import('./views/list.vue')
			},
			{
				path: '/service/category-list',
				meta: { label: '服务分类' },
				component: () => import('./views/category-list.vue')
			}
		]
	};
};
