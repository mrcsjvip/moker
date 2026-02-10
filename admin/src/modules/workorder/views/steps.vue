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
	name: 'workorder-steps'
});

import { reactive } from 'vue';
import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const options = reactive({
	status: [
		{ label: '待完成', value: 0, type: 'info' },
		{ label: '已完成', value: 1, type: 'success' }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '工单ID', prop: 'workOrderId', minWidth: 120 },
		{ label: '步骤名称', prop: 'name', minWidth: 160 },
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 120 },
		{ label: '完成时间', prop: 'finishedTime', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'workOrderId', label: '工单ID', component: { name: 'el-input' }, required: true },
		{ prop: 'name', label: '步骤名称', component: { name: 'el-input' }, required: true },
		{
			prop: 'status',
			label: '状态',
			value: 0,
			component: { name: 'el-radio-group', options: options.status }
		},
		{ prop: 'finishedTime', label: '完成时间', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.workorder.workOrderStep
	},
	app => {
		app.refresh();
	}
);
</script>
