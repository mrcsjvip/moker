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
	name: 'appointment-list'
});

import { reactive } from 'vue';
import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const options = reactive({
	status: [
		{ label: '待确认', value: 0, type: 'info' },
		{ label: '已确认', value: 1, type: 'success' },
		{ label: '已取消', value: 2, type: 'danger' },
		{ label: '已完成', value: 3, type: 'warning' }
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '客户ID', prop: 'customerId', minWidth: 120 },
		{ label: '门店ID', prop: 'storeId', minWidth: 120 },
		{ label: '车辆ID', prop: 'vehicleId', minWidth: 120 },
		{ label: '服务ID', prop: 'serviceId', minWidth: 120 },
		{ label: '预约时间', prop: 'appointmentTime', minWidth: 170 },
		{ label: '状态', prop: 'status', dict: options.status, minWidth: 120 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{ prop: 'customerId', label: '客户ID', component: { name: 'el-input' }, required: true },
		{ prop: 'storeId', label: '门店ID', component: { name: 'el-input' } },
		{ prop: 'vehicleId', label: '车辆ID', component: { name: 'el-input' } },
		{ prop: 'serviceId', label: '服务ID', component: { name: 'el-input' } },
		{ prop: 'technicianId', label: '技师ID', component: { name: 'el-input' } },
		{ prop: 'appointmentTime', label: '预约时间', component: { name: 'el-input' } },
		{
			prop: 'status',
			label: '状态',
			value: 0,
			component: { name: 'el-radio-group', options: options.status }
		},
		{ prop: 'remark', label: '备注', component: { name: 'el-input' } }
	]
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.appointment.appointment
	},
	app => {
		app.refresh();
	}
);
</script>
