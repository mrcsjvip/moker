<template>
	<div class="view-app-banner">
		<el-scrollbar>
			<div class="p-[20px]">
				<div class="title">小程序轮播图配置</div>
				<el-alert
					class="mb-4"
					title="按当前登录管理员所属租户保存，小程序首页将按租户拉取对应轮播图展示。"
					type="info"
					:closable="false"
					show-icon
				/>

				<el-form label-width="100px" label-position="top">
					<el-form-item label="轮播项">
						<div class="banner-list">
							<div
								v-for="(item, index) in list"
								:key="index"
								class="banner-item"
							>
								<el-card shadow="hover">
									<el-form-item label="图片地址" :prop="`list.${index}.imageUrl`">
										<el-input
											v-model="item.imageUrl"
											placeholder="请输入图片 URL"
											clearable
										/>
									</el-form-item>
									<el-form-item label="跳转链接（选填）" :prop="`list.${index}.linkUrl`">
										<el-input
											v-model="item.linkUrl"
											placeholder="点击轮播图跳转的链接"
											clearable
										/>
									</el-form-item>
									<el-form-item label="标题（选填）" :prop="`list.${index}.title`">
										<el-input
											v-model="item.title"
											placeholder="展示用标题"
											clearable
										/>
									</el-form-item>
									<div class="item-actions">
										<el-button type="danger" link @click="remove(index)">删除</el-button>
										<el-button
											v-if="index > 0"
											type="primary"
											link
											@click="moveUp(index)"
										>
											上移
										</el-button>
										<el-button
											v-if="index < list.length - 1"
											type="primary"
											link
											@click="moveDown(index)"
										>
											下移
										</el-button>
									</div>
								</el-card>
							</div>
						</div>
						<el-button type="primary" plain @click="add">添加一项</el-button>
					</el-form-item>

					<el-form-item>
						<el-button type="primary" :loading="saving" @click="save">
							保存
						</el-button>
						<el-button :loading="loading" @click="load">刷新</el-button>
					</el-form-item>
				</el-form>
			</div>
		</el-scrollbar>
	</div>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'sys-app-banner'
});

import { ElMessage } from 'element-plus';
import { onMounted, ref } from 'vue';
import { useCool } from '/@/cool';

const { service } = useCool();

type BannerItem = { imageUrl: string; linkUrl?: string; title?: string };

const list = ref<BannerItem[]>([]);
const loading = ref(false);
const saving = ref(false);

const apiPrefix = '/admin/base/sys/appBanner';

async function load() {
	loading.value = true;
	try {
		const res = await service.request({
			url: apiPrefix,
			method: 'GET'
		});
		const data = res?.data ?? res;
		list.value = Array.isArray(data) ? [...data] : [];
	} catch (e: any) {
		ElMessage.error(e?.message ?? '加载失败');
		list.value = [];
	} finally {
		loading.value = false;
	}
}

async function save() {
	const valid = list.value.filter(item => item?.imageUrl?.trim());
	if (valid.length === 0) {
		ElMessage.warning('请至少添加一项且填写图片地址');
		return;
	}
	saving.value = true;
	try {
		await service.request({
			url: apiPrefix,
			method: 'POST',
			data: { list: valid }
		});
		ElMessage.success('保存成功');
		list.value = valid;
	} catch (e: any) {
		ElMessage.error(e?.message ?? '保存失败');
	} finally {
		saving.value = false;
	}
}

function add() {
	list.value.push({ imageUrl: '', linkUrl: '', title: '' });
}

function remove(index: number) {
	list.value.splice(index, 1);
}

function moveUp(index: number) {
	if (index <= 0) return;
	;[list.value[index - 1], list.value[index]] = [list.value[index], list.value[index - 1]];
}

function moveDown(index: number) {
	if (index >= list.value.length - 1) return;
	;[list.value[index], list.value[index + 1]] = [list.value[index + 1], list.value[index]];
}

onMounted(() => {
	load();
});
</script>

<style lang="scss" scoped>
.view-app-banner {
	background-color: var(--el-bg-color);
	height: 100%;
	box-sizing: border-box;
	border-radius: 6px;
}

.title {
	margin-bottom: 20px;
	font-size: 15px;
	font-weight: bold;
}

.banner-list {
	display: flex;
	flex-direction: column;
	gap: 16px;
	margin-bottom: 16px;
}

.banner-item {
	.el-card {
		max-width: 560px;
	}
}

.item-actions {
	display: flex;
	gap: 8px;
	margin-top: 8px;
}
</style>
