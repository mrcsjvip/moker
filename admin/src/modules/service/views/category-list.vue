<template>
	<cl-crud ref="Crud">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
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
	name: 'service-category-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '分类名称', prop: 'name', minWidth: 160 },
		{ label: '排序号', prop: 'orderNum', minWidth: 100 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'name', label: '分类名称', component: { name: 'el-input' }, required: true },
		{
			prop: 'orderNum',
			label: '排序号',
			component: { name: 'el-input-number', props: { min: 0 } },
			value: 0
		}
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.service.service_category
	},
	app => {
		app.refresh();
	}
);
</script>
