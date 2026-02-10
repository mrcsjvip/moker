<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<cl-search ref="Search" />
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
</template>

<script lang="ts" setup>
defineOptions({
	name: 'customer-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '姓名', prop: 'name', minWidth: 140 },
		{ label: '手机号', prop: 'phone', minWidth: 140 },
		{ label: '备注', prop: 'remark', minWidth: 160 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'name', label: '姓名', component: { name: 'el-input' }, required: true },
		{
			prop: 'phone',
			label: '手机号',
			component: { name: 'el-input', props: { maxlength: 20 } },
			required: true
		},
		{ prop: 'remark', label: '备注', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.customer.customer
	},
	app => {
		app.refresh();
	}
);
</script>
