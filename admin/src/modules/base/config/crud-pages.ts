/**
 * 配置化 CRUD 页面定义（低代码方式）
 * 新增业务表时：后端添加 entity + controller + service，前端在此添加一条 config 并在菜单中配置路由即可，无需再写 .vue 页面
 */

export interface CrudPageColumn {
	prop: string;
	label: string;
	minWidth?: number;
	width?: number;
	type?: 'selection' | 'op';
	buttons?: string[];
	sortable?: string | boolean;
	showOverflowTooltip?: boolean;
	[key: string]: any;
}

export interface CrudPageFormItem {
	prop: string;
	label: string;
	span?: number;
	required?: boolean;
	value?: any;
	component: {
		name: string;
		options?: any[];
		props?: Record<string, any>;
	};
	rules?: any[];
	[key: string]: any;
}

export interface CrudPageConfig {
	/** 唯一 key，与路由 /sys/dynamic/:key 对应 */
	key: string;
	/** 请求服务路径，如 'base.sys.tenant' 对应 service.base.sys.tenant */
	servicePath: string;
	/** 搜索框占位文案（i18n key） */
	searchPlaceholder?: string;
	/** 表格列配置 */
	columns: CrudPageColumn[];
	/** 表单项配置（新增/编辑） */
	formItems: CrudPageFormItem[];
	/** 弹窗宽度 */
	dialogWidth?: string;
	/** 可选：打开表单时拉取选项的配置，如 { prop: 'headquartersId', listPath: 'base.sys.chain_headquarters', listMethod: 'list' } */
	formOptions?: Array<{
		prop: string;
		listPath: string;
		listMethod?: string;
		labelKey?: string;
		valueKey?: string;
	}>;
}

/**
 * 所有通过配置生成的 CRUD 页面
 * 新增页面：在此添加一条配置，菜单中配置 path=/sys/dynamic/xxx 且 viewPath=modules/base/views/dynamic-crud.vue 即可
 */
export const crudPageConfigs: CrudPageConfig[] = [
	{
		key: 'tenant',
		servicePath: 'base.sys.tenant',
		searchPlaceholder: '搜索名称',
		dialogWidth: '560px',
		columns: [
			{ type: 'selection', width: 60 },
			{ prop: 'name', label: '租户名称', minWidth: 150 },
			{ prop: 'expireDate', label: '到期日', minWidth: 120 },
			{ prop: 'remark', label: '备注', showOverflowTooltip: true, minWidth: 200 },
			{ prop: 'createTime', label: '创建时间', sortable: 'desc', minWidth: 170 },
			{ type: 'op', buttons: ['edit', 'delete'], width: 150 }
		],
		formItems: [
			{ prop: 'name', label: '租户名称', span: 24, required: true, component: { name: 'el-input' } },
			{
				prop: 'expireDate',
				label: '到期日',
				span: 24,
				value: null,
				component: {
					name: 'el-date-picker',
					props: { type: 'date', valueFormat: 'YYYY-MM-DD', placeholder: '不填表示永不过期', style: { width: '100%' } }
				}
			},
			{
				prop: 'remark',
				label: '备注',
				span: 24,
				component: { name: 'el-input', props: { type: 'textarea', rows: 4 } }
			}
		]
	},
	{
		key: 'chain_headquarters',
		servicePath: 'base.sys.chain_headquarters',
		searchPlaceholder: '搜索名称',
		dialogWidth: '560px',
		columns: [
			{ type: 'selection', width: 60 },
			{ prop: 'name', label: '总部名称', minWidth: 150 },
			{ prop: 'remark', label: '备注', showOverflowTooltip: true, minWidth: 200 },
			{ prop: 'createTime', label: '创建时间', sortable: 'desc', minWidth: 170 },
			{ type: 'op', buttons: ['edit', 'delete'], width: 150 }
		],
		formItems: [
			{ prop: 'name', label: '总部名称', span: 24, required: true, component: { name: 'el-input' } },
			{
				prop: 'remark',
				label: '备注',
				span: 24,
				component: { name: 'el-input', props: { type: 'textarea', rows: 4 } }
			}
		]
	},
	{
		key: 'chain_store',
		servicePath: 'base.sys.chain_store',
		searchPlaceholder: '搜索门店名称、地址、电话',
		dialogWidth: '560px',
		columns: [
			{ type: 'selection', width: 60 },
			{ prop: 'name', label: '门店名称', minWidth: 120 },
			{ prop: 'headquartersName', label: '所属总部', minWidth: 120 },
			{ prop: 'address', label: '地址', showOverflowTooltip: true, minWidth: 180 },
			{ prop: 'contact', label: '联系电话', minWidth: 120 },
			{ prop: 'remark', label: '备注', showOverflowTooltip: true, minWidth: 120 },
			{ prop: 'createTime', label: '创建时间', sortable: 'desc', minWidth: 170 },
			{ type: 'op', buttons: ['edit', 'delete'], width: 150 }
		],
		formItems: [
			{
				prop: 'headquartersId',
				label: '所属总部',
				span: 24,
				required: true,
				value: null,
				component: {
					name: 'el-select',
					options: [],
					props: { placeholder: '请选择总部', style: { width: '100%' } }
				}
			},
			{ prop: 'name', label: '门店名称', span: 24, required: true, component: { name: 'el-input' } },
			{ prop: 'address', label: '地址', span: 24, component: { name: 'el-input' } },
			{ prop: 'contact', label: '联系电话', span: 24, component: { name: 'el-input' } },
			{
				prop: 'remark',
				label: '备注',
				span: 24,
				component: { name: 'el-input', props: { type: 'textarea', rows: 4 } }
			}
		],
		formOptions: [
			{
				prop: 'headquartersId',
				listPath: 'base.sys.chain_headquarters',
				listMethod: 'list',
				labelKey: 'name',
				valueKey: 'id'
			}
		]
	}
];

/** 根据 key 获取配置 */
export function getCrudPageConfig(key: string): CrudPageConfig | undefined {
	return crudPageConfigs.find(c => c.key === key);
}
