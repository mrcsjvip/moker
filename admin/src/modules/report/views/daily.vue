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
	name: 'report-daily'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '门店ID', prop: 'storeId', minWidth: 120 },
		{ label: '日期', prop: 'reportDate', minWidth: 140 },
		{ label: '营收', prop: 'revenue', minWidth: 120 },
		{ label: '工单数量', prop: 'workOrderCount', minWidth: 120 },
		{ label: '客户数量', prop: 'customerCount', minWidth: 120 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'storeId', label: '门店ID', component: { name: 'el-input' } },
		{ prop: 'reportDate', label: '日期', component: { name: 'el-input' }, required: true },
		{
			prop: 'revenue',
			label: '营收',
			component: { name: 'el-input-number', props: { min: 0, precision: 2 } }
		},
		{
			prop: 'workOrderCount',
			label: '工单数量',
			component: { name: 'el-input-number', props: { min: 0 } }
		},
		{
			prop: 'customerCount',
			label: '客户数量',
			component: { name: 'el-input-number', props: { min: 0 } }
		}
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.report.reportDaily
	},
	app => {
		app.refresh();
	}
);
</script>
