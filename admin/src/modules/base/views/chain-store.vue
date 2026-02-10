<template>
	<div class="page-crud-wrap">
		<cl-crud ref="Crud">
			<cl-row>
				<cl-refresh-btn />
				<cl-add-btn />
				<cl-multi-delete-btn />
				<cl-flex1 />
				<el-select
					v-model="headquartersId"
					:placeholder="$t('按总部筛选')"
					clearable
					class="headquarters-select"
					@change="onHeadquartersChange"
				>
					<el-option
						v-for="item in headquartersList"
						:key="item.id"
						:label="item.name"
						:value="item.id"
					/>
				</el-select>
				<cl-search-key :placeholder="$t('搜索门店名称、地址、电话')" />
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
	name: 'chain-store'
});

import { ref, onMounted } from 'vue';
import { useTable, useUpsert, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const { service } = useCool();

const headquartersId = ref<number | null>(null);
const headquartersList = ref<{ id: number; name: string }[]>([]);

const Crud = useCrud(
	{
		service: service.base.sys.chain_store,
		onRefresh(params, { next }) {
			const req =
				headquartersId.value != null
					? { ...params, headquartersId: headquartersId.value }
					: params;
			next(req);
		}
	},
	app => {
		app.refresh();
	}
);

function onHeadquartersChange() {
	Crud.value?.refresh({ headquartersId: headquartersId.value ?? undefined });
}

onMounted(() => {
	service.base.sys.chain_headquarters
		.list()
		.then((res: any[]) => {
			headquartersList.value = res || [];
		})
		.catch(() => {
			headquartersList.value = [];
		});
});

const Upsert = useUpsert({
	dialog: { width: '560px' },
	items: [
		{
			prop: 'headquartersId',
			label: t('所属总部'),
			span: 24,
			required: true,
			value: null,
			component: {
				name: 'el-select',
				options: [],
				props: {
					placeholder: t('请选择总部'),
					style: { width: '100%' }
				}
			}
		},
		{
			prop: 'name',
			label: t('门店名称'),
			span: 24,
			required: true,
			component: { name: 'el-input' }
		},
		{
			prop: 'address',
			label: t('地址'),
			span: 24,
			component: { name: 'el-input' }
		},
		{
			prop: 'contact',
			label: t('联系电话'),
			span: 24,
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
	],
	onOpen() {
		service.base.sys.chain_headquarters.list().then((res: any[]) => {
			Upsert.value?.setOptions(
				'headquartersId',
				(res || []).map(e => ({ label: e.name, value: e.id }))
			);
		});
	}
});

const Table = useTable({
	columns: [
		{ type: 'selection', width: 60 },
		{ prop: 'name', label: t('门店名称'), minWidth: 120 },
		{ prop: 'headquartersName', label: t('所属总部'), minWidth: 120 },
		{ prop: 'address', label: t('地址'), showOverflowTooltip: true, minWidth: 180 },
		{ prop: 'contact', label: t('联系电话'), minWidth: 120 },
		{ prop: 'remark', label: t('备注'), showOverflowTooltip: true, minWidth: 120 },
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

	.headquarters-select {
		width: 180px;
		margin-right: 8px;
	}
}
</style>
