<template>
	<cl-crud v-if="config" ref="Crud" :key="moduleKey">
		<cl-row>
			<cl-refresh-btn />
			<cl-add-btn />
			<cl-multi-delete-btn />
			<cl-flex1 />
			<cl-search-key v-if="config.searchPlaceholder" :placeholder="$t(config.searchPlaceholder)" />
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

	<el-empty v-else :description="$t('页面配置不存在')" />
</template>

<script lang="ts" setup>
defineOptions({
	name: 'dynamic-crud'
});

import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useTable, useUpsert, useCrud } from '@cool-vue/crud';
import { useCool } from '/@/cool';
import { useI18n } from 'vue-i18n';
import { getCrudPageConfig } from '../config/crud-pages';

const route = useRoute();
const { service } = useCool();
const { t } = useI18n();

const moduleKey = computed(() => {
	const path = route.path || '';
	const parts = path.split('/').filter(Boolean);
	const idx = parts.indexOf('dynamic');
	return idx >= 0 && parts[idx + 1] ? parts[idx + 1] : '';
});

const config = computed(() => getCrudPageConfig(moduleKey.value));

function getServiceByPath(path: string) {
	const keys = path.split('.');
	let s: any = service;
	for (const k of keys) {
		s = s?.[k];
		if (s == null) return undefined;
	}
	return s;
}

const tableColumns = computed(() => {
	if (!config.value) return [];
	return config.value.columns.map(col => ({
		...col,
		label: typeof col.label === 'string' ? t(col.label) : col.label
	}));
});

const formItems = computed(() => {
	if (!config.value) return [];
	return config.value.formItems.map(item => ({
		...item,
		label: typeof item.label === 'string' ? t(item.label) : item.label,
		component: {
			...item.component,
			props: {
				...(item.component.props || {}),
				placeholder: item.component.props?.placeholder ? t(item.component.props.placeholder) : undefined
			}
		}
	}));
});

const crudService = computed(() => (config.value ? getServiceByPath(config.value.servicePath) : {}));

const Crud = useCrud(
	{ service: crudService.value || {} },
	(app: any) => app?.refresh?.()
);

const upsertOptions = computed(() => ({
	dialog: { width: config.value?.dialogWidth || '560px' },
	items: formItems.value,
	onOpen() {
		const opts = config.value?.formOptions;
		if (!opts?.length || !Upsert?.value) return;
		opts.forEach((opt: any) => {
			const listSvc = getServiceByPath(opt.listPath);
			const method = opt.listMethod || 'list';
			listSvc?.[method]?.()?.then((res: any[]) => {
				Upsert.value?.setOptions?.(
					opt.prop,
					(res || []).map((e: any) => ({
						label: opt.labelKey ? e[opt.labelKey] : e.name,
						value: opt.valueKey ? e[opt.valueKey] : e.id
					}))
				);
			});
		});
	}
}));

const Upsert = useUpsert(upsertOptions.value);

const Table = useTable({
	columns: tableColumns
});
</script>
