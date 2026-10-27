<template>
	<div class="layout-navbars-breadcrumb-user pr15" :style="{ flex: layoutUserFlexNum }">
		<!-- Command Palette trigger -->
		<div class="command-trigger-btn" @click="onSearchClick" :title="`${$t('message.user.title2')} (⌘K)`">
			<el-icon class="mr5"><ele-Search /></el-icon>
			<span class="command-trigger-text">{{ $t('message.user.searchPlaceholder') }}</span>
			<kbd class="command-trigger-kbd">⌘K</kbd>
		</div>

		<!-- Dark / Light toggle button -->
		<div class="layout-navbars-breadcrumb-user-icon" @click="onToggleDarkMode" :title="themeConfig.isIsDark ? '切换至明亮模式' : '切换至暗色模式'">
			<el-icon :size="16">
				<ele-Sunny v-if="themeConfig.isIsDark" />
				<ele-Moon v-else />
			</el-icon>
		</div>

		<!-- Language select -->
		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onLanguageChange">
			<div class="layout-navbars-breadcrumb-user-icon">
				<i
					class="iconfont"
					:class="state.disabledI18n === 'en' ? 'icon-fuhao-yingwen' : 'icon-fuhao-zhongwen'"
					:title="$t('message.user.title1')"
				></i>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item v-for="item in languageLabels" :key="item.command" :command="item.command" :disabled="state.disabledI18n === item.command">{{ item.label }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<!-- Component size select -->
		<el-dropdown :show-timeout="70" :hide-timeout="50" trigger="click" @command="onComponentSizeChange">
			<div class="layout-navbars-breadcrumb-user-icon">
				<i class="iconfont icon-ziti" :title="$t('message.user.title0')"></i>
			</div>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="large" :disabled="state.disabledSize === 'large'">{{ $t('message.user.dropdownLarge') }}</el-dropdown-item>
					<el-dropdown-item command="default" :disabled="state.disabledSize === 'default'">{{ $t('message.user.dropdownDefault') }}</el-dropdown-item>
					<el-dropdown-item command="small" :disabled="state.disabledSize === 'small'">{{ $t('message.user.dropdownSmall') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<!-- Theme settings drawer -->
		<div class="layout-navbars-breadcrumb-user-icon" @click="onLayoutSetingClick">
			<i class="icon-skin iconfont" :title="$t('message.user.title3')"></i>
		</div>

		<!-- Notifications -->
		<div class="layout-navbars-breadcrumb-user-icon">
			<el-popover placement="bottom" trigger="hover" transition="el-zoom-in-top" :width="300" :persistent="false">
				<template #reference>
					<el-badge :value="messageCenter.unread" :hidden="messageCenter.unread === 0">
						<el-icon :title="$t('message.user.title4')">
							<ele-Bell />
						</el-icon>
					</el-badge>
				</template>
				<template #default>
					<UserNews />
				</template>
			</el-popover>
		</div>

		<!-- Fullscreen toggle -->
		<div class="layout-navbars-breadcrumb-user-icon mr10" @click="onScreenfullClick">
			<i
				class="iconfont"
				:title="state.isScreenfull ? $t('message.user.title6') : $t('message.user.title5')"
				:class="!state.isScreenfull ? 'icon-fullscreen' : 'icon-tuichuquanping'"
			></i>
		</div>

		<!-- User avatar & dropdown -->
		<el-dropdown :show-timeout="70" :hide-timeout="50" @command="onHandleCommandClick">
			<span class="layout-navbars-breadcrumb-user-link">
				<el-badge 
					is-dot 
					class="item" 
					:class="{'online-status': isSocketOpen, 'online-down': !isSocketOpen}"
				>
					<img :src="userInfos.avatar" class="layout-navbars-breadcrumb-user-link-photo mr5" />
				</el-badge>
				<span class="user-display-name">{{ userInfos.username === '' ? $t('message.user.defaultUsername') : (userInfos.name || userInfos.username) }}</span>
				<el-icon class="el-icon--right">
					<ele-ArrowDown />
				</el-icon>
			</span>
			<template #dropdown>
				<el-dropdown-menu>
					<el-dropdown-item command="/home">{{ $t('message.user.dropdown1') }}</el-dropdown-item>
					<el-dropdown-item command="/personal">{{ $t('message.user.dropdown2') }}</el-dropdown-item>
					<el-dropdown-item command="/versionUpgradeLog">{{ $t('message.user.versionLog') }}</el-dropdown-item>
					<el-dropdown-item divided command="logOut">{{ $t('message.user.dropdown5') }}</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>

		<!-- CommandMenu (Replaces legacy search dialog) -->
		<CommandMenu ref="commandMenuRef" />
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbUser">
import { defineAsyncComponent, ref, computed, reactive, onMounted } from 'vue';
import { warningMessage } from '/@/utils/message';
import { useRouter } from 'vue-router';
import screenfull from 'screenfull';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useUserInfo } from '/@/stores/userInfo';
import { useThemeConfig } from '/@/stores/themeConfig';
import { changeThemeMode } from '/@/shared/access/themePresets';
import { refreshRoutesForI18n } from '/@/router/backEnd';
import { request } from '/@/utils/service';
import other from '/@/utils/other';
import mittBus from '/@/utils/mitt';
import { Session, Local } from '/@/utils/storage';
import { confirmLogout, logout } from '/@/shared/access/logout';

// 引入组件
const UserNews = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/userNews.vue'));
const CommandMenu = defineAsyncComponent(() => import('/@/layout/command/CommandMenu.vue'));

// 定义变量内容
const { locale, t } = useI18n();
const router = useRouter();
const stores = useUserInfo();
const storesThemeConfig = useThemeConfig();
const { userInfos, isSocketOpen } = storeToRefs(stores);
const { themeConfig } = storeToRefs(storesThemeConfig);
const commandMenuRef = ref();

// 语言切换下拉选项
const languageLabels = [
	{ command: 'zh-cn', label: '简体中文' },
	{ command: 'en', label: 'English' },
	{ command: 'zh-tw', label: '繁體中文' },
];

const state = reactive({
	isScreenfull: false,
	disabledI18n: 'zh-cn',
	disabledSize: 'large',
});

// 设置分割样式
const layoutUserFlexNum = computed(() => {
	const { layout } = themeConfig.value;
	return layout === 'defaults' ? '1' : '';
});

// 切换暗色模式
const onToggleDarkMode = () => {
	changeThemeMode(themeConfig.value, !themeConfig.value.isIsDark);
	mittBus.emit('layoutMobileResize', {
		layout: themeConfig.value.layout,
		clientWidth: document.body.clientWidth,
	});
};

// 全屏点击时
const onScreenfullClick = () => {
	if (!screenfull.isEnabled) {
		warningMessage(t('message.user.fullscreenNotSupported'));
		return false;
	}
	screenfull.toggle();
	screenfull.on('change', () => {
		if (screenfull.isFullscreen) state.isScreenfull = true;
		else state.isScreenfull = false;
	});
};

// 布局配置 icon 点击时
const onLayoutSetingClick = () => {
	mittBus.emit('openSetingsDrawer');
};

// 下拉菜单点击时
const onHandleCommandClick = async (path: string) => {
	if (path === 'logOut') {
		if (!(await confirmLogout(t))) return;
		await logout(router);
	} else if (path === 'wareHouse') {
		window.open('https://gitee.com/huge-dream/django-vue3-admin');
	} else if (path === '/versionUpgradeLog') {
		window.open('https://gitee.com/huge-dream/django-vue3-admin/blob/master/CHANGELOG.md');
	} else {
		router.push(path);
	}
};

// 呼出命令面板 / 搜索
const onSearchClick = () => {
	commandMenuRef.value?.open();
};

// 组件大小改变
const onComponentSizeChange = (size: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalComponentSize = size;
	Local.set('themeConfig', themeConfig.value);
	initI18nOrSize('globalComponentSize', 'disabledSize');
	window.location.reload();
};

// 语言切换
const onLanguageChange = async (lang: string) => {
	Local.remove('themeConfig');
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
	other.useTitle();
	initI18nOrSize('globalI18n', 'disabledI18n');
	await refreshRoutesForI18n();
	try {
		await request({ url: '/api/system/user/update_language/', method: 'put', data: { language: lang } });
	} catch (e) {
		console.warn('Failed to persist language preference:', e);
	}
};

// 初始化组件大小/i18n
const initI18nOrSize = (value: string, attr: keyof typeof state) => {
	const themeConfig = Local.get('themeConfig') as { [key: string]: any } | null;
	const configValue = ((themeConfig && themeConfig[value]) as string) || '';
	state[attr] = configValue as unknown as never;
};

// 页面加载时
onMounted(() => {
	if (Local.get('themeConfig')) {
		initI18nOrSize('globalComponentSize', 'disabledSize');
		initI18nOrSize('globalI18n', 'disabledI18n');
	}
	getMessageCenterCount();
});

// 消息中心的未读数量
import { messageCenterStore } from '/@/stores/messageCenter';
import { getBaseURL } from '/@/utils/baseUrl';
const messageCenter = messageCenterStore();
let eventSource: EventSource | null = null;
const isConnected = ref(false);
const getMessageCenterCount = () => {
	const token = Session.get('token');
	if (!token) {
		console.warn('SSE 连接失败：缺少 token');
		return;
	}
	eventSource = new EventSource(`${getBaseURL()}sse/?token=${token}`);
	eventSource.onopen = function () {
		if (!isConnected.value) {
			isConnected.value = true;
		}
	};
	eventSource.onmessage = function (event) {
		messageCenter.setUnread(+event.data);
	};
	eventSource.onerror = function () {
		if (eventSource !== null && eventSource.readyState === EventSource.CLOSED) {
			// closed quietly
		}
	};
};
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-user {
	display: flex;
	align-items: center;
	justify-content: flex-end;
	gap: 4px;

	&-link {
		height: 36px;
		display: flex;
		align-items: center;
		white-space: nowrap;
		cursor: pointer;
		padding: 0 6px;
		border-radius: var(--admin-radius-sm, 6px);
		transition: background 0.15s ease;

		&:hover {
			background: var(--admin-hover);
		}

		&-photo {
			width: 24px;
			height: 24px;
			border-radius: 50%;
			border: 1px solid var(--admin-border);
		}
	}

	.user-display-name {
		font-size: 13px;
		font-weight: 500;
		color: var(--admin-text);
		max-width: 110px;
		overflow: hidden;
		text-overflow: ellipsis;
	}

	&-icon {
		padding: 0 8px;
		cursor: pointer;
		color: var(--admin-muted);
		height: 34px;
		width: 34px;
		border-radius: var(--admin-radius-sm, 6px);
		display: flex;
		align-items: center;
		justify-content: center;
		transition: all 0.15s ease;

		&:hover {
			background: var(--admin-hover);
			color: var(--admin-text);
		}
	}

	:deep(.el-badge) {
		display: flex;
		align-items: center;
	}

	:deep(.el-badge__content.is-fixed) {
		top: 4px;
		right: 4px;
	}

	.online-status {
		:deep(.el-badge__content.is-fixed) {
			background-color: var(--admin-success, #16a34a);
		}
	}

	.online-down {
		:deep(.el-badge__content.is-fixed) {
			background-color: var(--admin-muted, #737373);
		}
	}
}

.command-trigger-btn {
	display: flex;
	align-items: center;
	gap: 6px;
	padding: 5px 10px;
	margin-right: 8px;
	background: var(--admin-surface-2);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-sm, 6px);
	cursor: pointer;
	font-size: 12px;
	color: var(--admin-muted);
	transition: all 0.15s ease;
	user-select: none;
	width: 176px;

	&:hover {
		background: var(--admin-hover);
		color: var(--admin-text);
		border-color: var(--admin-border-strong);
	}
}

.command-trigger-text {
	flex: 1;
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	text-align: left;
}

.command-trigger-kbd {
	font-family: inherit;
	font-size: 10px;
	font-weight: 600;
	padding: 1px 4px;
	background: var(--admin-surface);
	border: 1px solid var(--admin-border);
	border-radius: 3px;
	color: var(--admin-muted);
	line-height: 1.2;
	flex-shrink: 0;
}

@media (max-width: 768px) {
	.command-trigger-text,
	.command-trigger-kbd {
		display: none;
	}
	.command-trigger-btn {
		padding: 6px;
		margin-right: 2px;
	}
	.user-display-name {
		display: none;
	}
}
</style>
