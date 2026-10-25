<template>
	<div class="pccm-item" v-if="state.fields.value.length > 0">
		<div class="menu-form-alert">
			<el-button size="small" :loading="state.writing.value" :disabled="!state.dirty.value || state.loading.value || !state.allowed('fields')" @click="state.saveFields()">{{ $t('message.design.roleSaveFields') }}</el-button>
      <el-button size="small" :disabled="!state.dirty.value || state.writing.value" @click="state.discardFields()">{{ $t('message.design.roleDiscard') }}</el-button>
      <span>{{ state.dirty.value ? $t('message.design.roleUnsaved') : $t('message.design.roleSaved') }}</span>
			{{ $t('message.design.roleFieldHint') }}
		</div>

		<ul class="columns-list">
			<li class="columns-head">
				<div class="width-txt">
					<span>{{ $t('message.design.roleField') }}</span>
				</div>
				<div v-for="(head, hIndex) in headers" :key="hIndex" class="width-check">
					<el-checkbox :model-value="allChecked(head.value)" :indeterminate="partChecked(head.value)" :disabled="state.writing.value || state.loading.value || !state.allowed('fields')" @change="handleColumnChange($event, head.value, head.disabled)">
						<span>{{ head.label }}</span>
					</el-checkbox>
				</div>
			</li>
			<div class="columns-content">
				<li v-for="(c_item, c_index) in state.fields.value" :key="c_index" class="columns-item">
					<div class="width-txt">{{ c_item.title }}</div>
					<div v-for="(col, cIndex) in headers" :key="cIndex" class="width-check">
						<el-checkbox v-model="c_item[col.value]" class="ci-checkout" :disabled="c_item[col.disabled] || state.writing.value || state.loading.value || !state.allowed('fields')"></el-checkbox>
					</div>
				</li>
			</div>
		</ul>
	</div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import { roleAuthorizationKey } from '/@/features/roles/authorization';

const state = inject(roleAuthorizationKey)!;
const { t } = useI18n();
const headers = computed(() => [
  { value: 'is_create', disabled: 'disabled_create', label: t('message.design.roleFieldCreate') },
  { value: 'is_update', disabled: 'disabled_update', label: t('message.design.roleFieldUpdate') },
  { value: 'is_query', disabled: 'disabled_query', label: t('message.design.roleFieldQuery') },
]);
const allChecked = (key: string) => state.fields.value.length > 0 && state.fields.value.every(row => !!row[key]);
const partChecked = (key: string) => !allChecked(key) && state.fields.value.some(row => !!row[key]);
const handleColumnChange = (val: boolean, key: string, disabled: string) => {
  if (state.writing.value || state.loading.value) return;
  for (const row of state.fields.value) if (!row[disabled]) row[key] = val;
};
</script>

<style lang="scss" scoped>
.pccm-item {
	margin-bottom: 10px;
	.menu-form-alert {
		color: #fff;
		line-height: 24px;
		padding: 8px 16px;
		margin-bottom: 20px;
		border-radius: 4px;
		background-color: var(--el-color-primary);
	}
	.menu-form-btn {
		margin-left: 10px;
		height: 40px;
		padding: 8px 16px;
		margin-bottom: 20px;
	}

	.btn-item {
		display: flex;
		align-items: center;

		span {
			margin-left: 5px;
		}
	}

	.columns-list {
		.width-txt {
			width: 200px;
		}

		.width-check {
			width: 100px;
		}

		.width-icon {
			cursor: pointer;
		}

		.columns-head {
			display: flex;
			align-items: center;
			padding: 6px 0;
			border-bottom: 1px solid #ebeef5;
			box-sizing: border-box;

			span {
				font-weight: 900;
			}
		}
		.columns-content {
			max-height: calc(100vh - 240px); /* 视口高度 */
			overflow-y: auto; /* 当内容超出高度时显示垂直滚动条 */
			.columns-item {
				display: flex;
				align-items: center;
				padding: 6px 0;
				box-sizing: border-box;

				.ci-checkout {
					height: auto !important;
				}
			}
		}
	}
}
</style>
