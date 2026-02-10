<template>
	<div class="page-crud-wrap">
		<cl-crud ref="Crud">
			<cl-row>
				<cl-refresh-btn />
				<cl-add-btn />
				<cl-multi-delete-btn />
				<cl-flex1 />
				<cl-search-key :placeholder="$t('搜索名称')" />
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
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'chain-headquarters'
});

import { useTable, useUpsert, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { service } = useCool();

const Crud = useCrud({ service: service.base.sys.chain_headquarters }, app => {
	app.refresh();
});

const Upsert = useUpsert({
	dialog: { width: '560px' },
	items: [
		{
			prop: 'name',
			label: t('总部名称'),
			span: 24,
			required: true,
			component: { name: 'el-input' }
		},
		{
			prop: 'remark',
			label: t('备注'),
			span: 24,
			component: {
				name: 'el-input',
				props: { type: 'textarea', rows: 4 }
			}
		}
	]
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ prop: 'name', label: t('总部名称'), minWidth: 150 },
		{ prop: 'remark', label: t('备注'), showOverflowTooltip: true, minWidth: 200 },
		{ prop: 'createTime', label: t('创建时间'), sortable: 'desc', minWidth: 170 },
		{ type: 'op' }
	]
});
</script>

<style lang="scss" scoped>
.page-crud-wrap {
	height: 100%;
	min-height: 0;
	overflow: hidden;
}
</style>
