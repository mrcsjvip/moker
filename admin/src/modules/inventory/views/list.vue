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
	name: 'inventory-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '物料ID', prop: 'materialId', minWidth: 120 },
		{ label: '门店ID', prop: 'storeId', minWidth: 120 },
		{ label: '库存数量', prop: 'quantity', minWidth: 120 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'materialId', label: '物料ID', component: { name: 'el-input' }, required: true },
		{ prop: 'storeId', label: '门店ID', component: { name: 'el-input' } },
		{
			prop: 'quantity',
			label: '库存数量',
			component: { name: 'el-input-number', props: { min: 0 } }
		}
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.inventory.inventory
	},
	app => {
		app.refresh();
	}
);
</script>
