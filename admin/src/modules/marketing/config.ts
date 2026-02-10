import { type ModuleConfig } from '/@/cool';

export default (): ModuleConfig => {
	return {
		views: [
			{
				path: '/marketing/coupon',
				meta: { label: '优惠券' },
				component: () => import('./views/coupon.vue')
			},
			{
				path: '/marketing/coupon-use',
				meta: { label: '优惠券使用' },
				component: () => import('./views/coupon-use.vue')
			}
		]
	};
};
