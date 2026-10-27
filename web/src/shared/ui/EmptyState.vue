<template>
	<div class="empty-state" :class="`empty-state--${variant || 'empty'}`" role="status">
		<div class="empty-state-icon">
			<slot name="icon">
				<svg v-if="variant === 'filtered'" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="11" cy="11" r="8"/>
					<path d="m21 21-4.3-4.3"/>
				</svg>
				<svg v-else-if="variant === 'error'" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
					<path d="M12 9v4"/>
					<path d="M12 17h.01"/>
				</svg>
				<svg v-else-if="variant === 'forbidden'" xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<rect width="18" height="11" x="3" y="11" rx="2" ry="2"/>
					<path d="M7 11V7a5 5 0 0 1 10 0v4"/>
				</svg>
				<svg v-else xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/>
					<path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/>
				</svg>
			</slot>
		</div>
		<h4 class="empty-state-title">{{ content.title }}</h4>
		<p v-if="content.description" class="empty-state-desc">{{ content.description }}</p>
		<div v-if="content.actionText || $slots.action" class="empty-state-action">
			<slot name="action">
				<el-button type="primary" @click="$emit('action')">{{ content.actionText }}</el-button>
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts" name="EmptyState">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { resolveEmptyState, type EmptyStateVariant } from './emptyStateVariants';

const props = defineProps<{
	/** empty 真没数据｜filtered 筛选无结果｜error 加载失败｜forbidden 无权限 */
	variant?: EmptyStateVariant;
	title?: string;
	description?: string;
	actionText?: string;
}>();

defineEmits<{
	(e: 'action'): void;
}>();

const { t } = useI18n();
const content = computed(() =>
	resolveEmptyState(props.variant || 'empty', key => t(key), {
		title: props.title,
		description: props.description,
		actionText: props.actionText,
	}),
);
</script>

<style scoped lang="scss">
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 44px 24px;
	text-align: center;

	&-icon {
		color: var(--admin-muted);
		margin-bottom: 12px;
		opacity: 0.6;
		line-height: 0;
	}

	&-title {
		font-size: 14px;
		font-weight: 600;
		color: var(--admin-text);
		margin: 0;
	}

	&-desc {
		font-size: 13px;
		color: var(--admin-muted);
		margin: 6px 0 0;
		max-width: 320px;
	}

	&-action {
		margin-top: 16px;
	}

	/* 出错不是"空白"，图标用告警色但保持轻量，避免整块变成警示条 */
	&--error &-icon {
		color: var(--admin-warning);
	}
}
</style>
