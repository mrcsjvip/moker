<template>
	<cl-crud ref="Crud">
		<cl-row>
			<!-- 刷新按钮 -->
			<cl-refresh-btn />
			<!-- 删除按钮 -->
			<cl-multi-delete-btn />
			<cl-flex1 />

			<!-- 搜索 -->
			<cl-search ref="Search" />
		</cl-row>

		<cl-row>
			<!-- 数据表格 -->
			<cl-table ref="Table">
				<template #slot-bind="{ scope }">
					<el-button text type="primary" @click="openBindDialog(scope.row)">
						绑定账号
					</el-button>
				</template>
			</cl-table>
		</cl-row>

		<cl-row>
			<cl-flex1 />
			<!-- 分页控件 -->
			<cl-pagination />
		</cl-row>

		<!-- 新增、编辑 -->
		<cl-upsert ref="Upsert" />
	</cl-crud>

	<el-dialog
		v-model="bindDialog.visible"
		title="账号绑定"
		width="540px"
		:close-on-click-modal="false"
	>
		<el-form label-width="110px" v-loading="bindDialog.loading">
			<el-form-item label="C端用户">
				<el-text>{{ bindDialog.appUserLabel || '--' }}</el-text>
			</el-form-item>

			<el-form-item label="后台账号">
				<el-select
					v-model="bindDialog.adminUserId"
					filterable
					clearable
					placeholder="请选择后台账号"
					style="width: 100%"
				>
					<el-option
						v-for="item in bindDialog.adminUserOptions"
						:key="item.id"
						:label="item.label"
						:value="item.id"
					/>
				</el-select>
			</el-form-item>

			<el-form-item label="备注">
				<el-input
					v-model="bindDialog.remark"
					type="textarea"
					:rows="2"
					placeholder="选填"
				/>
			</el-form-item>

			<el-form-item label="当前绑定">
				<el-text>{{ bindDialog.currentBindLabel || '未绑定' }}</el-text>
			</el-form-item>

			<el-form-item label="角色能力">
				<el-tag :type="bindDialog.isEmployee ? 'success' : 'info'" class="mr-2">
					员工：{{ bindDialog.isEmployee ? '是' : '否' }}
				</el-tag>
				<el-tag :type="bindDialog.isManager ? 'success' : 'info'">
					店长：{{ bindDialog.isManager ? '是' : '否' }}
				</el-tag>
			</el-form-item>
		</el-form>

		<template #footer>
			<el-button @click="bindDialog.visible = false">取消</el-button>
			<el-button type="danger" plain :disabled="!bindDialog.currentBindId" @click="unbindAccount">
				解除绑定
			</el-button>
			<el-button type="primary" :loading="bindDialog.submitting" @click="saveBind">
				保存绑定
			</el-button>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup>
defineOptions({
	name: 'user-list'
});

import { useCrud, useSearch, useTable, useUpsert } from '@cool-vue/crud';
import { useI18n } from 'vue-i18n';
import { useCool } from '/@/cool';
import { reactive } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';

const { t } = useI18n();
const { service } = useCool();

const bindDialog = reactive({
	visible: false,
	loading: false,
	submitting: false,
	appUserId: 0,
	appUserLabel: '',
	adminUserId: undefined as number | undefined,
	remark: '',
	currentBindId: 0,
	currentBindLabel: '',
	isEmployee: false,
	isManager: false,
	adminUserOptions: [] as Array<{ id: number; label: string }>
});

async function loadAdminUserOptions() {
	const res = await service.base.sys.user.page({
		page: 1,
		size: 1000
	});

	const list = res?.list || [];
	bindDialog.adminUserOptions = list.map((e: any) => {
		const name = e.name || e.nickName || '-';
		const phone = e.phone || '-';
		return {
			id: e.id,
			label: `${name}（${e.username} / ${phone}）`
		};
	});
}

async function openBindDialog(row: Eps.UserInfoEntity) {
	bindDialog.visible = true;
	bindDialog.loading = true;
	bindDialog.appUserId = row.id!;
	bindDialog.appUserLabel = `${row.nickName || '-'}（${row.phone || '-'}）`;
	bindDialog.adminUserId = undefined;
	bindDialog.remark = '';
	bindDialog.currentBindId = 0;
	bindDialog.currentBindLabel = '';
	bindDialog.isEmployee = false;
	bindDialog.isManager = false;

	try {
		await loadAdminUserOptions();

		const bindInfo = await service.request({
			url: '/admin/user/account_bind/bindInfo',
			params: {
				appUserId: row.id
			}
		});

		if (bindInfo) {
			bindDialog.currentBindId = bindInfo.id || 0;
			bindDialog.adminUserId = bindInfo.adminUserId;
			bindDialog.remark = bindInfo.remark || '';
			const option = bindDialog.adminUserOptions.find(e => e.id === bindInfo.adminUserId);
			bindDialog.currentBindLabel = option?.label || `后台用户ID: ${bindInfo.adminUserId}`;
		}

		const access = await service.request({
			url: '/admin/user/account_bind/roleAccess',
			params: {
				appUserId: row.id
			}
		});
		bindDialog.isEmployee = !!access?.isEmployee;
		bindDialog.isManager = !!access?.isManager;
	} catch (err: any) {
		ElMessage.error(err.message || '加载绑定信息失败');
	} finally {
		bindDialog.loading = false;
	}
}

async function saveBind() {
	if (!bindDialog.adminUserId) {
		ElMessage.warning('请先选择后台账号');
		return;
	}

	bindDialog.submitting = true;
	try {
		await service.request({
			url: '/admin/user/account_bind/save',
			method: 'POST',
			data: {
				appUserId: bindDialog.appUserId,
				adminUserId: bindDialog.adminUserId,
				remark: bindDialog.remark
			}
		});
		ElMessage.success('绑定成功');
		bindDialog.visible = false;
		Crud.value?.refresh();
	} catch (err: any) {
		ElMessage.error(err.message || '绑定失败');
	} finally {
		bindDialog.submitting = false;
	}
}

async function unbindAccount() {
	if (!bindDialog.currentBindId) {
		return;
	}

	await ElMessageBox.confirm('确认解除当前绑定吗？', '提示', {
		type: 'warning'
	});

	try {
		await service.request({
			url: '/admin/user/account_bind/unbind',
			method: 'POST',
			data: {
				appUserId: bindDialog.appUserId
			}
		});
		ElMessage.success('已解除绑定');
		bindDialog.visible = false;
		Crud.value?.refresh();
	} catch (err: any) {
		ElMessage.error(err.message || '解除绑定失败');
	}
}

const options = reactive({
	loginType: [
		{
			label: t('小程序'),
			value: 0,
			type: 'danger'
		},
		{
			label: t('公众号'),
			value: 1,
			type: 'success'
		},
		{
			label: t('H5'),
			value: 2
		}
	],
	gender: [
		{
			label: t('未知'),
			value: 0,
			type: 'info'
		},
		{
			label: t('男'),
			value: 1,
			type: 'success'
		},
		{
			label: t('女'),
			value: 2,
			type: 'danger'
		}
	],
	status: [
		{
			label: t('禁用'),
			value: 0,
			type: 'danger'
		},
		{
			label: t('正常'),
			value: 1,
			type: 'success'
		},
		{
			label: t('已注销'),
			value: 2,
			type: 'warning'
		}
	]
});

// cl-table
const Table = useTable({
	columns: [
		{
			type: 'selection',
			width: 60
		},
		{
			label: t('昵称'),
			prop: 'nickName',
			minWidth: 150
		},
		{
			label: t('头像'),
			prop: 'avatarUrl',
			minWidth: 100,
			component: {
				name: 'cl-avatar'
			}
		},
		{
			label: t('手机号'),
			prop: 'phone',
			minWidth: 120
		},
		{
			label: t('性别'),
			prop: 'gender',
			dict: options.gender,
			minWidth: 120
		},
		{
			label: t('登录方式'),
			prop: 'loginType',
			dict: options.loginType,
			minWidth: 120
		},
		{
			label: t('状态'),
			prop: 'status',
			minWidth: 120,
			dict: options.status
		},
		{
			label: t('创建时间'),
			prop: 'createTime',
			sortable: 'desc',
			minWidth: 170
		},
		{
			type: 'op'
			,
			buttons: ['slot-bind', 'edit', 'delete']
		}
	]
});

// cl-upsert
const Upsert = useUpsert({
	items: [
		{
			prop: 'avatarUrl',
			label: t('头像'),
			component: { name: 'cl-upload' }
		},
		{
			prop: 'nickName',
			label: t('昵称'),
			component: { name: 'el-input' },
			required: true
		},
		{
			prop: 'phone',
			label: t('手机号'),
			component: {
				name: 'el-input',
				props: {
					maxlength: 11
				}
			}
		},
		{
			prop: 'gender',
			label: t('性别'),
			value: 1,
			component: {
				name: 'el-radio-group',
				options: options.gender
			}
		},
		{
			prop: 'status',
			label: t('状态'),
			value: 1,
			component: {
				name: 'el-radio-group',
				options: options.status
			}
		}
	]
});

// cl-search
const Search = useSearch();

// cl-crud
const Crud = useCrud(
	{
		service: service.user.info
	},
	app => {
		app.refresh();
	}
);
</script>
