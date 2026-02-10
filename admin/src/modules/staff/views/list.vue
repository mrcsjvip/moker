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
	name: 'staff-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '系统用户ID', prop: 'userId', minWidth: 140 },
		{ label: '岗位', prop: 'position', minWidth: 140 },
		{ label: '星级', prop: 'starLevel', minWidth: 120 },
		{ label: '提成规则', prop: 'commissionRule', minWidth: 160 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'userId', label: '系统用户ID', component: { name: 'el-input' }, required: true },
		{ prop: 'position', label: '岗位', component: { name: 'el-input' } },
		{ prop: 'starLevel', label: '星级', component: { name: 'el-input-number', props: { min: 0 } } },
		{ prop: 'commissionRule', label: '提成规则', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.staff.staffProfile
	},
	app => {
		app.refresh();
	}
);
</script>
