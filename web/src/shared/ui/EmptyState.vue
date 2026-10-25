<template>
	<div class="empty-state">
		<div class="empty-state-icon">
			<slot name="icon">
				<svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
					<rect width="20" height="16" x="2" y="4" rx="2"/>
					<path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
				</svg>
			</slot>
		</div>
		<h4 class="empty-state-title">{{ title || '暂无数据' }}</h4>
		<p v-if="description" class="empty-state-desc">{{ description }}</p>
		<div v-if="actionText || $slots.action" class="empty-state-action">
			<slot name="action">
				<el-button type="primary" @click="$emit('action')">{{ actionText }}</el-button>
			</slot>
		</div>
	</div>
</template>

<script setup lang="ts" name="EmptyState">
defineProps<{
	title?: string;
	description?: string;
	actionText?: string;
}>();

defineEmits<{
	(e: 'action'): void;
}>();
</script>

<style scoped lang="scss">
.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 48px 24px;
	text-align: center;

	&-icon {
		color: var(--admin-muted);
		margin-bottom: 12px;
		opacity: 0.6;
	}

	&-title {
		font-size: 15px;
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
}
</style>
