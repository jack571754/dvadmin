<template>
	<span class="status-badge" :class="[`status-${type}`, { 'has-dot': dot }]">
		<span v-if="dot" class="status-badge-dot" />
		<span class="status-badge-text">
			<slot>{{ text }}</slot>
		</span>
	</span>
</template>

<script setup lang="ts" name="StatusBadge">
withDefaults(
	defineProps<{
		type?: 'success' | 'warning' | 'danger' | 'info' | 'default';
		text?: string;
		dot?: boolean;
	}>(),
	{
		type: 'default',
		dot: true,
	}
);
</script>

<style scoped lang="scss">
.status-badge {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	padding: 2px 8px;
	border-radius: var(--admin-radius-full, 9999px);
	font-size: 12px;
	font-weight: 500;
	line-height: 1.4;
	border: 1px solid transparent;
	width: fit-content;

	&-dot {
		width: 6px;
		height: 6px;
		border-radius: 50%;
		flex-shrink: 0;
	}

	&.status-success {
		background: var(--admin-success-bg, #f0fdf4);
		border-color: color-mix(in srgb, var(--admin-success) 20%, transparent);
		color: var(--admin-success, #16a34a);

		.status-badge-dot {
			background: var(--admin-success, #16a34a);
		}
	}

	&.status-warning {
		background: var(--admin-warning-bg, #fffbeb);
		border-color: color-mix(in srgb, var(--admin-warning) 20%, transparent);
		color: var(--admin-warning, #d97706);

		.status-badge-dot {
			background: var(--admin-warning, #d97706);
		}
	}

	&.status-danger {
		background: var(--admin-danger-bg, #fef2f2);
		border-color: color-mix(in srgb, var(--admin-danger) 20%, transparent);
		color: var(--admin-danger, #dc2626);

		.status-badge-dot {
			background: var(--admin-danger, #dc2626);
		}
	}

	&.status-info,
	&.status-default {
		background: var(--admin-surface-2, #f5f5f5);
		border-color: var(--admin-border);
		color: var(--admin-muted, #737373);

		.status-badge-dot {
			background: var(--admin-muted, #737373);
		}
	}
}
</style>
