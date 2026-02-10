import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/material/list',
				meta: { label: '物料管理' },
				component: () => import('./views/list.vue')
			}
		]
	};
};
