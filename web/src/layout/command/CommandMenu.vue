<template>
	<transition name="command-fade">
		<div v-if="isOpen" class="command-overlay" @click.self="close">
			<div
				ref="dialogRef"
				class="command-dialog"
				role="dialog"
				aria-modal="true"
				:aria-label="$t('message.user.title2')"
				@keydown.down.prevent="navigateDown"
				@keydown.up.prevent="navigateUp"
				@keydown.enter.prevent="executeSelected"
				@keydown.tab="handleTab"
			>
				<!-- Search input header -->
				<div class="command-header">
					<svg class="command-search-icon" xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<circle cx="11" cy="11" r="8"></circle>
						<line x1="21" y1="21" x2="16.65" y2="16.65"></line>
					</svg>
					<input
						ref="inputRef"
						v-model="query"
						type="text"
						class="command-input"
						:placeholder="$t('message.user.searchPlaceholder')"
						@keydown.esc="close"
					/>
					<kbd class="command-kbd">ESC</kbd>
				</div>

				<!-- Command items list -->
				<div class="command-body" ref="bodyRef">
					<template v-if="filteredPages.length > 0">
						<div class="command-group-heading">{{ $t('message.router.system') || '页面导航' }}</div>
						<div
							v-for="(item, index) in filteredPages"
							:key="item.path"
							class="command-item"
							:class="{ 'is-selected': selectedIndex === index }"
							@mouseenter="selectedIndex = index"
							@click="selectItem(item)"
						>
							<div class="command-item-icon">
								<SvgIcon :name="item.icon || 'ele-Document'" />
							</div>
							<div class="command-item-label">{{ item.title }}</div>
							<div class="command-item-path">{{ item.path }}</div>
						</div>
					</template>

					<template v-if="filteredActions.length > 0">
						<div class="command-group-heading">快捷操作</div>
						<div
							v-for="(action, idx) in filteredActions"
							:key="action.id"
							class="command-item"
							:class="{ 'is-selected': selectedIndex === filteredPages.length + idx }"
							@mouseenter="selectedIndex = filteredPages.length + idx"
							@click="executeAction(action)"
						>
							<div class="command-item-icon">
								<SvgIcon :name="action.icon" />
							</div>
							<div class="command-item-label">{{ action.title }}</div>
							<kbd v-if="action.shortcut" class="command-kbd">{{ action.shortcut }}</kbd>
						</div>
					</template>

					<div v-if="totalItems === 0" class="command-empty">
						无匹配项
					</div>
				</div>

				<!-- Command footer -->
				<div class="command-footer">
					<div class="command-shortcut-hint">
						<kbd class="command-kbd">↑</kbd>
						<kbd class="command-kbd">↓</kbd>
						<span>选择</span>
					</div>
					<div class="command-shortcut-hint">
						<kbd class="command-kbd">↵</kbd>
						<span>确认</span>
					</div>
					<div class="command-shortcut-hint">
						<kbd class="command-kbd">ESC</kbd>
						<span>退出</span>
					</div>
				</div>
			</div>
		</div>
	</transition>
</template>

<script setup lang="ts" name="CommandMenu">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useRoutesList } from '/@/stores/routesList';
import { useThemeConfig } from '/@/stores/themeConfig';
import { changeThemeMode } from '/@/shared/access/themePresets';
import screenfull from 'screenfull';
import mittBus from '/@/utils/mitt';
import { FOCUSABLE_SELECTOR, wrapFocusIndex } from '/@/shared/ui/focusTrap';

const { t } = useI18n();
const router = useRouter();
const routesStore = useRoutesList();
const themeConfigStore = useThemeConfig();
const { routesList } = storeToRefs(routesStore);
const { themeConfig } = storeToRefs(themeConfigStore);

const isOpen = ref(false);
const query = ref('');
const selectedIndex = ref(0);
const inputRef = ref<HTMLInputElement | null>(null);
const bodyRef = ref<HTMLDivElement | null>(null);
const dialogRef = ref<HTMLDivElement | null>(null);
// 关闭时把焦点还给打开它的那个元素，键盘用户不会掉回页面顶部
let restoreFocusTo: HTMLElement | null = null;

interface FlatPage {
	title: string;
	path: string;
	icon: string;
}

interface CommandAction {
	id: string;
	title: string;
	icon: string;
	shortcut?: string;
	action: () => void;
}

// 扁平化路由菜单
const flattenRoutes = (list: any[], result: FlatPage[] = []): FlatPage[] => {
	for (const item of list) {
		if (item.meta && !item.meta.isHide) {
			const title = item.meta.title ? (item.meta.title.startsWith('message.') ? t(item.meta.title) : item.meta.title) : item.path;
			if (item.path && !item.children?.length) {
				result.push({
					title,
					path: item.path,
					icon: item.meta.icon || 'ele-Document',
				});
			}
		}
		if (item.children?.length) {
			flattenRoutes(item.children, result);
		}
	}
	return result;
};

const allPages = computed(() => flattenRoutes(routesList.value));

const filteredPages = computed(() => {
	const q = query.value.trim().toLowerCase();
	if (!q) return allPages.value.slice(0, 8);
	return allPages.value.filter(
		p => p.title.toLowerCase().includes(q) || p.path.toLowerCase().includes(q)
	).slice(0, 10);
});

// 内置快捷操作
const actions = computed<CommandAction[]>(() => [
	{
		id: 'toggle-dark',
		title: themeConfig.value.isIsDark ? '切换至明亮模式' : '切换至暗色模式',
		icon: themeConfig.value.isIsDark ? 'ele-Sunny' : 'ele-Moon',
		shortcut: '⌘D',
		action: () => {
			changeThemeMode(themeConfig.value, !themeConfig.value.isIsDark);
			mittBus.emit('layoutMobileResize', {
				layout: themeConfig.value.layout,
				clientWidth: document.body.clientWidth,
			});
			close();
		},
	},
	{
		id: 'toggle-fullscreen',
		title: '切换全屏',
		icon: 'ele-FullScreen',
		action: () => {
			if (screenfull.isEnabled) screenfull.toggle();
			close();
		},
	},
	{
		id: 'go-profile',
		title: '个人中心',
		icon: 'ele-User',
		action: () => {
			router.push('/personal');
			close();
		},
	},
	{
		id: 'refresh-view',
		title: '重新加载当前页面',
		icon: 'ele-Refresh',
		shortcut: '⌘R',
		action: () => {
			mittBus.emit('onTagsViewRefreshRouterView', router.currentRoute.value.fullPath);
			close();
		},
	},
]);

const filteredActions = computed(() => {
	const q = query.value.trim().toLowerCase();
	if (!q) return actions.value;
	return actions.value.filter(a => a.title.toLowerCase().includes(q));
});

const totalItems = computed(() => filteredPages.value.length + filteredActions.value.length);

watch(totalItems, () => {
	if (selectedIndex.value >= totalItems.value) {
		selectedIndex.value = Math.max(0, totalItems.value - 1);
	}
});

const open = () => {
	restoreFocusTo = document.activeElement as HTMLElement | null;
	query.value = '';
	selectedIndex.value = 0;
	isOpen.value = true;
	nextTick(() => {
		inputRef.value?.focus();
	});
};

const close = () => {
	if (!isOpen.value) return;
	isOpen.value = false;
	restoreFocusTo?.focus?.();
	restoreFocusTo = null;
};

// Tab 只在两端回环，中间交给浏览器（见 shared/ui/focusTrap.ts）
const handleTab = (e: KeyboardEvent) => {
	const items = dialogRef.value ? Array.from(dialogRef.value.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR)) : [];
	const target = wrapFocusIndex({
		key: e.key,
		shiftKey: e.shiftKey,
		count: items.length,
		currentIndex: items.indexOf(document.activeElement as HTMLElement),
	});
	if (target === null) return;
	e.preventDefault();
	items[target]?.focus();
};

const navigateDown = () => {
	if (totalItems.value === 0) return;
	selectedIndex.value = (selectedIndex.value + 1) % totalItems.value;
	scrollSelectedIntoView();
};

const navigateUp = () => {
	if (totalItems.value === 0) return;
	selectedIndex.value = (selectedIndex.value - 1 + totalItems.value) % totalItems.value;
	scrollSelectedIntoView();
};

const scrollSelectedIntoView = () => {
	nextTick(() => {
		const el = bodyRef.value?.querySelector('.command-item.is-selected') as HTMLElement;
		el?.scrollIntoView({ block: 'nearest' });
	});
};

const selectItem = (item: FlatPage) => {
	router.push(item.path);
	close();
};

const executeAction = (action: CommandAction) => {
	action.action();
};

const executeSelected = () => {
	const pagesCount = filteredPages.value.length;
	if (selectedIndex.value < pagesCount) {
		const item = filteredPages.value[selectedIndex.value];
		if (item) selectItem(item);
	} else {
		const actionIdx = selectedIndex.value - pagesCount;
		const action = filteredActions.value[actionIdx];
		if (action) executeAction(action);
	}
};

const handleKeyDown = (e: KeyboardEvent) => {
	if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
		e.preventDefault();
		if (isOpen.value) close();
		else open();
	} else if (e.key === 'Escape' && isOpen.value) {
		// 焦点不在输入框时（例如 Tab 到别处）Esc 也要能关
		e.preventDefault();
		close();
	} else if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) {
		e.preventDefault();
		open();
	}
};

onMounted(() => {
	window.addEventListener('keydown', handleKeyDown);
	mittBus.on('openCommandMenu', open);
});

onUnmounted(() => {
	window.removeEventListener('keydown', handleKeyDown);
	mittBus.off('openCommandMenu', open);
});

defineExpose({
	open,
	close,
});
</script>

<style scoped lang="scss">
.command-overlay {
	position: fixed;
	inset: 0;
	z-index: 2999;
	background: rgba(0, 0, 0, 0.45);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: flex-start;
	justify-content: center;
	padding-top: 14vh;
}

.command-dialog {
	width: 100%;
	max-width: 580px;
	background: var(--admin-surface);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-lg, 10px);
	box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
	overflow: hidden;
	display: flex;
	flex-direction: column;
	animation: commandZoom 0.14s ease-out;
}

@keyframes commandZoom {
	from {
		opacity: 0;
		transform: scale(0.96);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.command-header {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 12px 16px;
	border-bottom: 1px solid var(--admin-border);
}

.command-search-icon {
	color: var(--admin-muted);
	flex-shrink: 0;
}

.command-input {
	flex: 1;
	border: 0;
	outline: none;
	background: transparent;
	font-size: 14px;
	color: var(--admin-text);
	&::placeholder {
		color: var(--admin-muted);
	}
}

.command-kbd {
	font-family: inherit;
	font-size: 11px;
	font-weight: 500;
	color: var(--admin-muted);
	background: var(--admin-surface-2);
	border: 1px solid var(--admin-border);
	border-radius: 4px;
	padding: 2px 6px;
	line-height: 1;
}

.command-body {
	max-height: 340px;
	overflow-y: auto;
	padding: 8px;
}

.command-group-heading {
	padding: 6px 10px 4px;
	font-size: 11px;
	font-weight: 600;
	color: var(--admin-muted);
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.command-item {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 8px 10px;
	border-radius: 6px;
	cursor: pointer;
	font-size: 13px;
	color: var(--admin-text);
	transition: background 0.1s ease;

	&.is-selected {
		background: var(--admin-hover);
	}
}

.command-item-icon {
	display: flex;
	align-items: center;
	justify-content: center;
	width: 18px;
	color: var(--admin-muted);
}

.command-item-label {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
}

.command-item-path {
	font-size: 11px;
	color: var(--admin-muted);
}

.command-empty {
	padding: 24px;
	text-align: center;
	font-size: 13px;
	color: var(--admin-muted);
}

.command-footer {
	display: flex;
	align-items: center;
	gap: 14px;
	padding: 8px 16px;
	border-top: 1px solid var(--admin-border);
	background: var(--admin-surface-2);
	font-size: 11px;
	color: var(--admin-muted);
}

.command-shortcut-hint {
	display: flex;
	align-items: center;
	gap: 4px;
}

.command-fade-enter-active,
.command-fade-leave-active {
	transition: opacity 0.15s ease;
}

.command-fade-enter-from,
.command-fade-leave-to {
	opacity: 0;
}
</style>
