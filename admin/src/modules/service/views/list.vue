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
	name: 'service-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '服务名称', prop: 'name', minWidth: 160 },
		{ label: '指导价', prop: 'guidePrice', minWidth: 120 },
		{ label: '施工时长(分钟)', prop: 'duration', minWidth: 140 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'name', label: '服务名称', component: { name: 'el-input' }, required: true },
		{
			prop: 'guidePrice',
			label: '指导价',
			component: { name: 'el-input-number', props: { min: 0, precision: 2 } },
			required: true
		},
		{
			prop: 'duration',
			label: '施工时长(分钟)',
			component: { name: 'el-input-number', props: { min: 0 } }
		},
		{ prop: 'sop', label: 'SOP', component: { name: 'el-input', props: { type: 'textarea' } } },
		{ prop: 'description', label: '描述', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.service.service
	},
	app => {
		app.refresh();
	}
);
</script>
