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
	name: 'inventory-logs'
});

import { reactive } from 'vue';
import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const options = reactive({
	type: [
		{ label: '入库', value: 0, type: 'success' },
		{ label: '出库', value: 1, type: 'danger' }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '物料ID', prop: 'materialId', minWidth: 120 },
		{ label: '门店ID', prop: 'storeId', minWidth: 120 },
		{ label: '数量变化', prop: 'changeQty', minWidth: 120 },
		{ label: '类型', prop: 'type', dict: options.type, minWidth: 120 },
		{ label: '关联单号', prop: 'refNo', minWidth: 160 },
		{ label: '发生时间', prop: 'happenTime', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'materialId', label: '物料ID', component: { name: 'el-input' }, required: true },
		{ prop: 'storeId', label: '门店ID', component: { name: 'el-input' } },
		{
			prop: 'changeQty',
			label: '数量变化',
			component: { name: 'el-input-number', props: { min: 0 } }
		},
		{
			prop: 'type',
			label: '类型',
			value: 0,
			component: { name: 'el-radio-group', options: options.type }
		},
		{ prop: 'refNo', label: '关联单号', component: { name: 'el-input' } },
		{ prop: 'happenTime', label: '发生时间', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.inventory.inventoryLog
	},
	app => {
		app.refresh();
	}
);
</script>
