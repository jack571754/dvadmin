<template>
	<div class="row-actions">
		<!-- Main primary actions -->
		<slot name="primary" />

		<!-- More actions dropdown -->
		<el-dropdown v-if="$slots.more" trigger="click" @command="handleCommand">
			<button class="row-actions-more-btn" type="button" title="更多操作">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
					<circle cx="12" cy="12" r="1"/>
					<circle cx="19" cy="12" r="1"/>
					<circle cx="5" cy="12" r="1"/>
				</svg>
			</button>
			<template #dropdown>
				<el-dropdown-menu class="row-actions-menu">
					<slot name="more" />
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>

<script setup lang="ts" name="RowActions">
const emit = defineEmits<{
	(e: 'command', command: string | number | object): void;
}>();

const handleCommand = (command: string | number | object) => {
	emit('command', command);
};
</script>

<style scoped lang="scss">
.row-actions {
	display: inline-flex;
	align-items: center;
	gap: 6px;

	&-more-btn {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 28px;
		height: 28px;
		padding: 0;
		border: 1px solid var(--admin-border);
		border-radius: var(--admin-radius-sm, 6px);
		background: var(--admin-surface);
		color: var(--admin-muted);
		cursor: pointer;
		transition: all 0.12s ease;

		&:hover {
			background: var(--admin-hover);
			color: var(--admin-text);
			border-color: var(--admin-border-strong);
		}
	}
}
</style>
