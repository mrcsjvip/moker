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
	name: 'marketing-coupon-use'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '优惠券ID', prop: 'couponId', minWidth: 120 },
		{ label: '客户ID', prop: 'customerId', minWidth: 120 },
		{ label: '工单ID', prop: 'workOrderId', minWidth: 120 },
		{ label: '使用时间', prop: 'usedTime', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'couponId', label: '优惠券ID', component: { name: 'el-input' }, required: true },
		{ prop: 'customerId', label: '客户ID', component: { name: 'el-input' }, required: true },
		{ prop: 'workOrderId', label: '工单ID', component: { name: 'el-input' } },
		{ prop: 'usedTime', label: '使用时间', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.marketing.couponUse
	},
	app => {
		app.refresh();
	}
);
</script>
