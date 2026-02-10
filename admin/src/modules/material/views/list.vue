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
	name: 'material-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '物料名称', prop: 'name', minWidth: 160 },
		{ label: 'SKU', prop: 'sku', minWidth: 140 },
		{ label: '单位', prop: 'unit', minWidth: 100 },
		{ label: '成本价', prop: 'costPrice', minWidth: 120 },
		{ label: '销售价', prop: 'salePrice', minWidth: 120 },
		{ label: '库存预警', prop: 'stockWarn', minWidth: 120 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'name', label: '物料名称', component: { name: 'el-input' }, required: true },
		{ prop: 'sku', label: 'SKU', component: { name: 'el-input' } },
		{ prop: 'unit', label: '单位', component: { name: 'el-input' } },
		{
			prop: 'costPrice',
			label: '成本价',
			component: { name: 'el-input-number', props: { min: 0, precision: 2 } }
		},
		{
			prop: 'salePrice',
			label: '销售价',
			component: { name: 'el-input-number', props: { min: 0, precision: 2 } }
		},
		{ prop: 'supplier', label: '供应商', component: { name: 'el-input' } },
		{
			prop: 'stockWarn',
			label: '库存预警',
			component: { name: 'el-input-number', props: { min: 0 } }
		}
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.material.material
	},
	app => {
		app.refresh();
	}
);
</script>
