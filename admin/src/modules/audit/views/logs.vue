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
	name: 'audit-logs'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '操作人ID', prop: 'operatorId', minWidth: 120 },
		{ label: '模块', prop: 'module', minWidth: 140 },
		{ label: '动作', prop: 'action', minWidth: 120 },
		{ label: '目标ID', prop: 'targetId', minWidth: 120 },
		{ label: '详情', prop: 'detail', minWidth: 200 },
		{ label: '操作时间', prop: 'actionTime', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'operatorId', label: '操作人ID', component: { name: 'el-input' } },
		{ prop: 'module', label: '模块', component: { name: 'el-input' } },
		{ prop: 'action', label: '动作', component: { name: 'el-input' } },
		{ prop: 'targetId', label: '目标ID', component: { name: 'el-input' } },
		{ prop: 'detail', label: '详情', component: { name: 'el-input' } },
		{ prop: 'actionTime', label: '操作时间', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.audit.auditLog
	},
	app => {
		app.refresh();
	}
);
</script>
