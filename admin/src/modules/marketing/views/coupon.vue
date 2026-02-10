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
	name: 'marketing-coupon'
});

import { reactive } from 'vue';
import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const options = reactive({
	status: [
		{ label: '停用', value: 0, type: 'danger' },
		{ label: '启用', value: 1, type: 'success' }
	],
	type: [
		{ label: '满减', value: 0, type: 'success' },
		{ label: '折扣', value: 1, type: 'warning' }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '券名称', prop: 'name', minWidth: 160 },
		{ label: '券码', prop: 'code', minWidth: 120 },
		{ label: '类型', prop: 'type', dict: options.type, minWidth: 120 },
		{ label: '面值/折扣', prop: 'value', minWidth: 120 },
		{ label: '最低消费', prop: 'minSpend', minWidth: 120 },
		{ label: '有效期', prop: 'startTime', minWidth: 160 },
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 120 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'name', label: '券名称', component: { name: 'el-input' }, required: true },
		{ prop: 'code', label: '券码', component: { name: 'el-input' } },
		{
			prop: 'type',
			label: '类型',
			value: 0,
			component: { name: 'el-radio-group', options: options.type }
		},
		{
			prop: 'value',
			label: '面值/折扣',
			component: { name: 'el-input-number', props: { min: 0, precision: 2 } }
		},
		{
			prop: 'minSpend',
			label: '最低消费',
			component: { name: 'el-input-number', props: { min: 0, precision: 2 } }
		},
		{ prop: 'startTime', label: '开始时间', component: { name: 'el-input' } },
		{ prop: 'endTime', label: '结束时间', component: { name: 'el-input' } },
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
		service: service.marketing.coupon
	},
	app => {
		app.refresh();
	}
);
</script>
