<template>
	<div class="stat-card">
		<div class="stat-card-header">
			<span class="stat-card-title">{{ title }}</span>
			<div v-if="icon || $slots.icon" class="stat-card-icon">
				<slot name="icon">
					<SvgIcon :name="icon!" />
				</slot>
			</div>
		</div>
		<div class="stat-card-value">{{ value }}</div>
		<div v-if="hint || change !== undefined" class="stat-card-footer">
			<span
				v-if="change !== undefined"
				class="stat-card-change"
				:class="changeTypeClass"
			>
				{{ changeSymbol }}{{ Math.abs(change) }}%
			</span>
			<span v-if="hint" class="stat-card-hint">{{ hint }}</span>
		</div>
	</div>
</template>

<script setup lang="ts" name="StatCard">
import { computed } from 'vue';

const props = withDefaults(
	defineProps<{
		title: string;
		value: string | number;
		icon?: string;
		change?: number;
		changeType?: 'increase' | 'decrease' | 'neutral';
		hint?: string;
	}>(),
	{
		changeType: 'neutral',
	}
);

const changeTypeClass = computed(() => {
	if (props.changeType === 'increase') return 'is-increase';
	if (props.changeType === 'decrease') return 'is-decrease';
	return 'is-neutral';
});

const changeSymbol = computed(() => {
	if (props.change === undefined) return '';
	if (props.change > 0) return '+';
	if (props.change < 0) return '-';
	return '';
});
</script>

<style scoped lang="scss">
.stat-card {
	background: var(--admin-surface);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-lg, 10px);
	padding: 18px 20px 16px;
	box-shadow: var(--admin-shadow-xs);
	display: flex;
	flex-direction: column;
	gap: 6px;
	transition: all 0.15s ease;

	&:hover {
		border-color: var(--admin-border-strong);
	}

	&-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	&-title {
		font-size: 13px;
		font-weight: 500;
		color: var(--admin-muted);
	}

	&-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		color: var(--admin-muted);
		font-size: 16px;
	}

	&-value {
		font-size: 26px;
		font-weight: 700;
		letter-spacing: -0.02em;
		color: var(--admin-text);
		line-height: 1.2;
	}

	&-footer {
		display: flex;
		align-items: center;
		gap: 6px;
		font-size: 12px;
		margin-top: 2px;
	}

	&-change {
		font-weight: 600;
		display: inline-flex;
		align-items: center;

		&.is-increase {
			color: var(--admin-success, #16a34a);
		}

		&.is-decrease {
			color: var(--admin-danger, #dc2626);
		}

		&.is-neutral {
			color: var(--admin-muted);
		}
	}

	&-hint {
		color: var(--admin-muted);
	}
}
</style>
