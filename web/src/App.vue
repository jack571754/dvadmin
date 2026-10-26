<template>
	<el-config-provider :size="getGlobalComponentSize" :locale="getGlobalI18n">
		<!-- v-show="themeConfig.lockScreenTime > 1" -->
		<router-view v-if="isStaticPage || sessionViewReady" :key="sessionRevision" v-show="themeConfig.lockScreenTime > 1" />
		<StartupError v-else-if="startupStatus === 'failed'" :message="startupMessage" @retry="startupState.retry" />
		<LockScreen v-if="themeConfig.isLockScreen" />
		<Setings ref="setingsRef" v-show="themeConfig.lockScreenTime > 1" />
		<CloseFull v-if="!themeConfig.isLockScreen" />
<!--		<Upgrade v-if="getVersion" />-->
	</el-config-provider>
</template>

<script setup lang="ts" name="app">
import { defineAsyncComponent, computed, ref, onBeforeMount, onMounted, onUnmounted, nextTick, watch, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { storeToRefs } from 'pinia';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import { useThemeConfig } from '/@/stores/themeConfig';
import other from '/@/utils/other';
import { Local, Session } from '/@/utils/storage';
import mittBus from '/@/utils/mitt';
import { createEventSubscriptions } from '/@/shared/access/eventSubscriptions';
const events = createEventSubscriptions(mittBus);
onUnmounted(() => events.clear());
import setIntroduction from '/@/utils/setIconfont';
import websocket from '/@/utils/websocket';
import { sessionRevision, sessionViewReady } from './shared/access/sessionEvents';
import { startupState } from './shared/access/startup';
import StartupError from '/@/shared/ui/StartupError.vue';
import { migrateThemeVersion, migrateThemeConfig } from './shared/access/preferences';
import { applyTheme } from './shared/access/theme';
import { staticRoutes } from './router/route';
import { SystemConfigStore } from './stores/systemConfig';

// 引入组件
const LockScreen = defineAsyncComponent(() => import('/@/layout/lockScreen/index.vue'));
const Setings = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/setings.vue'));
const CloseFull = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/closeFull.vue'));
const Upgrade = defineAsyncComponent(() => import('/@/layout/upgrade/index.vue'));
import { ElMessageBox, ElNotification } from 'element-plus';
import { useCore } from '/@/utils/cores';
// 定义变量内容
const { messages, locale } = useI18n();
const setingsRef = ref();
const route = useRoute();
const isStaticPage = computed(() => route.matched.some(record => staticRoutes.some(page => page.name === record.name)));
const stores = useTagsViewRoutes();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const systemConfigStore = SystemConfigStore();
watch(() => systemConfigStore.systemConfig['login.site_logo'], () => other.useFavicon(), { immediate: true });
// Resolve preferences before rendering children; stale cssText never overrides a new palette.
migrateThemeVersion(window.localStorage, '1.0.0');
const storedThemeConfig = migrateThemeConfig(window.localStorage, themeConfig.value);
if (storedThemeConfig) storesThemeConfig.setThemeConfig({ themeConfig: storedThemeConfig });
Local.remove('themeConfigStyle');
applyTheme(themeConfig.value);
watch(themeConfig, config => {
	applyTheme(config);
	Local.set('themeConfig', config);
}, { deep: true });
const core = useCore();
const router = useRouter();
const { status: startupStatus, message: startupMessage } = startupState;
// 获取版本号
const getVersion = computed(() => {
	let isVersion = false;
	if (route.path !== '/login') {
		// @ts-ignore
		if ((Local.get('version') && Local.get('version') !== __VERSION__) || !Local.get('version')) isVersion = true;
	}
	return isVersion;
});
// 获取全局组件大小
const getGlobalComponentSize = computed(() => {
	return other.globalComponentSize();
});
// 获取全局 i18n
const getGlobalI18n = computed(() => {
	return messages.value[locale.value];
});
// 设置初始化，防止刷新时恢复默认
onBeforeMount(() => {
	// 设置批量第三方 icon 图标
	setIntroduction.cssCdn();
	// 设置批量第三方 js
	setIntroduction.jsCdn();
});
// 页面加载时
onMounted(() => {
	nextTick(() => {
		// 监听布局配'置弹窗点击打开
		events.on('openSetingsDrawer', () => {
			setingsRef.value.openDrawer();
		});
		// 获取缓存中的全屏配置
		if (Session.get('isTagsViewCurrenFull')) {
			stores.setCurrenFullscreen(Session.get('isTagsViewCurrenFull'));
		}
	});
});
// 监听路由的变化，设置网站标题
watch(
	() => route.path,
	() => {
		other.useTitle();
		if (!websocket.websocket) {
			// websocket 模块
			try {
				websocket.init(wsReceive);
			} catch (e) {
				console.log('websocket错误');
			}
		}
	}
);

// websocket相关代码
import { messageCenterStore } from '/@/stores/messageCenter';
const wsReceive = (message: any) => {
	const data = JSON.parse(message.data);
	const { unread } = data;
	const messageCenter = messageCenterStore();
	messageCenter.setUnread(unread);
	if (data.contentType === 'SYSTEM' && data.content !== '您已上线') {
		ElNotification({
			title: '系统消息',
			message: data.content,
			type: 'success',
			position: 'bottom-right',
			duration: 5000,
		});
	} else if (data.contentType === 'Content') {
		ElMessageBox.confirm(data.content, data.notificationTitle, {
			confirmButtonText: data.notificationButton,
			dangerouslyUseHTMLString: true,
			cancelButtonText: '关闭',
			type: 'info',
			closeOnClickModal: false,
		}).then(() => {
			ElMessageBox.close();
			const path = data.path;
			if (route.path === path) {
				core.bus.emit('onNewTask', { name: 'onNewTask' });
			} else {
				router.push({ path });
			}
		}).catch(() => {});
	}
};
onBeforeUnmount(() => {
	// 关闭连接
	websocket.close();
});
</script>
