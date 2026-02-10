<template>
	<div class="page-crud-wrap">
		<cl-crud ref="Crud">
			<cl-row>
				<cl-refresh-btn />
				<cl-add-btn />
				<cl-multi-delete-btn />
				<cl-flex1 />
				<cl-search-key :placeholder="$t('搜索名称')" />
			</cl-row>

			<cl-row>
				<cl-table ref="Table" />
			</cl-row>

			<cl-row>
				<cl-flex1 />
				<cl-pagination />
			</cl-row>

			<cl-upsert ref="Upsert" />
		</cl-crud>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'sys-tenant'
});

import { useTable, useUpsert, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { service } = useCool();

const Crud = useCrud({ service: service.base.sys.tenant }, app => {
	app.refresh();
});

const Upsert = useUpsert({
	dialog: {
		width: '560px'
	},
	onSubmit(data, { next }) {
		// 编辑时只提交租户名称、到期日、备注，不提交新增专用字段
		if (data.id) {
			next({
				id: data.id,
				name: data.name,
				expireDate: data.expireDate ?? null,
				remark: data.remark ?? null
			});
		} else {
			next(data);
		}
	},
	items: [
		{
			prop: 'name',
			label: t('租户名称'),
			span: 24,
			required: true,
			component: {
				name: 'el-input',
				props: { placeholder: t('请输入租户名称') }
			}
		},
		{
			prop: 'expireDate',
			label: t('到期日'),
			span: 24,
			value: null,
			component: {
				name: 'el-date-picker',
				props: {
					type: 'date',
					valueFormat: 'YYYY-MM-DD',
					placeholder: t('不填表示永不过期'),
					style: { width: '100%' }
				}
			}
		},
		{
			prop: 'remark',
			label: t('备注'),
			span: 24,
			component: {
				name: 'el-input',
				props: {
					type: 'textarea',
					rows: 2,
					placeholder: t('选填')
				}
			}
		},
		{
			prop: 'phone',
			label: t('手机号码（作为管理员登录账号）'),
			span: 24,
			required: true,
			component: {
				name: 'el-input',
				props: {
					placeholder: t('请输入手机号，用于管理员登录'),
					maxlength: 20
				}
			},
			hidden: ({ scope }) => !!scope?.id
		},
		{
			prop: 'adminPassword',
			label: t('默认登录密码'),
			span: 24,
			value: '123456',
			required: true,
			component: {
				name: 'el-input',
				props: {
					type: 'password',
					placeholder: t('管理员首次登录使用，不少于6位'),
					maxlength: 20,
					showPassword: true
				}
			},
			hidden: ({ scope }) => !!scope?.id
		},
		{
			prop: 'adminName',
			label: t('管理员姓名'),
			span: 24,
			value: '',
			component: {
				name: 'el-input',
				props: { placeholder: t('选填，不填则使用「总部管理员」') }
			},
			hidden: ({ scope }) => !!scope?.id
		}
	]
});

const Table = useTable({
	columns: [
		{
			type: 'selection',
			width: 60
		},
		{
			prop: 'name',
			label: t('租户名称'),
			minWidth: 150
		},
		{
			prop: 'expireDate',
			label: t('到期日'),
			minWidth: 120
		},
		{
			prop: 'remark',
			label: t('备注'),
			showOverflowTooltip: true,
			minWidth: 200
		},
		{
			prop: 'createTime',
			label: t('创建时间'),
			sortable: 'desc',
			minWidth: 170
		},
		{
			type: 'op'
		}
	]
});
</script>

<style lang="scss" scoped>
.page-crud-wrap {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
