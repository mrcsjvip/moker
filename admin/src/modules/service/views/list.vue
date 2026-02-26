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

import { reactive } from 'vue';
import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useCool } from '/@/cool';

const { service } = useCool();

const categoryDict = reactive<{ list: { label: string; value: number }[] }>({ list: [] });

function loadCategoryOptions() {
	service.service.service_category
		.list()
		.then((res: any[]) => {
			const list = Array.isArray(res) ? res : [];
			categoryDict.list = list
				.sort((a: any, b: any) => (a.orderNum ?? 0) - (b.orderNum ?? 0))
				.map((c: any) => ({ label: c.name, value: c.id }));
		})
		.catch(() => {
			categoryDict.list = [];
		});
}

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ label: '服务分类', prop: 'categoryId', minWidth: 120, dict: categoryDict.list },
		{ label: '服务名称', prop: 'name', minWidth: 160 },
		{ label: '指导价', prop: 'guidePrice', minWidth: 120 },
		{ label: '施工时长(分钟)', prop: 'duration', minWidth: 140 },
		{ label: '创建时间', prop: 'createTime', sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});

const Upsert = useUpsert({
	items: [
		{
			prop: 'categoryId',
			label: '服务分类',
			component: {
				name: 'el-select',
				options: [],
				props: { placeholder: '请选择分类', clearable: true, style: { width: '100%' } }
			}
		},
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
	],
	onOpen() {
		loadCategoryOptions();
		service.service.service_category.list().then((res: any[]) => {
			const list = Array.isArray(res) ? res : [];
			Upsert.value?.setOptions(
				'categoryId',
				list
					.sort((a: any, b: any) => (a.orderNum ?? 0) - (b.orderNum ?? 0))
					.map((c: any) => ({ label: c.name, value: c.id }))
			);
		});
	}
});

const Search = useSearch();

const Crud = useCrud(
	{
		service: service.service.service
	},
	app => {
		app.refresh();
		loadCategoryOptions();
	}
);
</script>
