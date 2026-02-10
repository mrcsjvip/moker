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
	name: 'vehicle-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '客户ID', prop: 'customerId', minWidth: 120 },
		{ label: '车牌号', prop: 'plateNumber', minWidth: 140 },
		{ label: '品牌', prop: 'brand', minWidth: 120 },
		{ label: '车型', prop: 'model', minWidth: 120 },
		{ label: 'VIN', prop: 'vin', minWidth: 160 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'customerId', label: '客户ID', component: { name: 'el-input' }, required: true },
		{ prop: 'plateNumber', label: '车牌号', component: { name: 'el-input' }, required: true },
		{ prop: 'brand', label: '品牌', component: { name: 'el-input' } },
		{ prop: 'model', label: '车型', component: { name: 'el-input' } },
		{ prop: 'vin', label: 'VIN', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.vehicle.vehicle
	},
	app => {
		app.refresh();
	}
);
</script>
