<template>
	<div class="admin-card" :class="[customClass, { 'is-bordered': bordered }]">
		<div v-if="title || $slots.header || $slots.extra" class="admin-card-header">
			<div class="admin-card-header-main">
				<h3 v-if="title" class="admin-card-title">{{ title }}</h3>
				<p v-if="description" class="admin-card-description">{{ description }}</p>
				<slot name="header" />
			</div>
			<div v-if="$slots.extra" class="admin-card-header-extra">
				<slot name="extra" />
			</div>
		</div>
		<div class="admin-card-content" :style="bodyStyle">
			<slot />
		</div>
		<div v-if="$slots.footer" class="admin-card-footer">
			<slot name="footer" />
		</div>
	</div>
</template>

<script setup lang="ts" name="AdminCard">
import type { CSSProperties } from 'vue';

withDefaults(
	defineProps<{
		title?: string;
		description?: string;
		bordered?: boolean;
		customClass?: string;
		bodyStyle?: CSSProperties;
	}>(),
	{
		bordered: true,
	}
);
</script>

<style scoped lang="scss">
.admin-card {
	background: var(--admin-surface);
	border-radius: var(--admin-radius-lg, 10px);
	box-shadow: var(--admin-shadow-xs);
	color: var(--admin-text);
	display: flex;
	flex-direction: column;
	transition: all 0.15s ease;

	&.is-bordered {
		border: 1px solid var(--admin-border);
	}

	&-header {
		padding: 16px 20px 12px;
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 12px;

		&-main {
			flex: 1;
			min-width: 0;
		}

		&-extra {
			display: flex;
			align-items: center;
			gap: 8px;
		}
	}

	&-title {
		font-size: 15px;
		font-weight: 600;
		letter-spacing: -0.01em;
		color: var(--admin-text);
		margin: 0;
		line-height: 1.3;
	}

	&-description {
		font-size: 12.5px;
		color: var(--admin-muted);
		margin: 4px 0 0;
		line-height: 1.4;
	}

	&-content {
		padding: 0 20px 20px;
		flex: 1;
	}

	&-footer {
		padding: 12px 20px;
		border-top: 1px solid var(--admin-border);
		background: var(--admin-surface-2);
		border-radius: 0 0 var(--admin-radius-lg, 10px) var(--admin-radius-lg, 10px);
	}
}
</style>
