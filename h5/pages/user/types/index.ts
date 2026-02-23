export type LoginForm = {
	phone: string;
	smsCode: string;
	/** 登录时选择的租户ID（小程序按租户关联时必选） */
	tenantId?: number | null;
};

/** 租户选项（登录页下拉） */
export type TenantOption = {
	id: number;
	name: string;
};
