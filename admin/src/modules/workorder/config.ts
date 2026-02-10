import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/workorder/list',
				meta: { label: '工单管理' },
				component: () => import('./views/list.vue')
			},
			{
				path: '/workorder/steps',
				meta: { label: '工单步骤' },
				component: () => import('./views/steps.vue')
			}
		]
	};
};
