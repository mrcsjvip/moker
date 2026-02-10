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
	name: 'store-list'
});

import { reactive } from 'vue';
import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const options = reactive({
	status: [
		{ label: '停用', value: 0, type: 'danger' },
		{ label: '启用', value: 1, type: 'success' }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '门店名称', prop: 'name', minWidth: 160 },
		{ label: '城市', prop: 'city', minWidth: 120 },
		{ label: '营业时间', prop: 'businessHours', minWidth: 160 },
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 120 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'name', label: '门店名称', component: { name: 'el-input' }, required: true },
		{ prop: 'city', label: '城市', component: { name: 'el-input' }, required: true },
		{ prop: 'address', label: '地址', component: { name: 'el-input' } },
		{ prop: 'businessHours', label: '营业时间', component: { name: 'el-input' } },
		{
			prop: 'status',
			label: '状态',
			value: 1,
			component: { name: 'el-radio-group', options: options.status }
		}
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.store.store
	},
	app => {
		app.refresh();
	}
);
</script>
