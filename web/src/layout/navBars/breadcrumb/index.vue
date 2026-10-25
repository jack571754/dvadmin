<template>
	<div class="layout-navbars-breadcrumb-index">
		<Logo v-if="setIsShowLogo" />
		<Breadcrumb />
		<Horizontal :menuList="state.menuList" v-if="isLayoutTransverse" />
		<User />
	</div>
</template>

<script setup lang="ts" name="layoutBreadcrumbIndex">
import { defineAsyncComponent, computed, reactive, onMounted, onUnmounted, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoutesList } from '/@/stores/routesList';
import { useThemeConfig } from '/@/stores/themeConfig';
import mittBus from '/@/utils/mitt';
import { createEventSubscriptions } from '/@/shared/access/eventSubscriptions';
const events = createEventSubscriptions(mittBus);
onUnmounted(() => events.clear());

// 引入组件
const Breadcrumb = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/breadcrumb.vue'));
const User = defineAsyncComponent(() => import('/@/layout/navBars/breadcrumb/user.vue'));
const Logo = defineAsyncComponent(() => import('/@/layout/logo/index.vue'));
const Horizontal = defineAsyncComponent(() => import('/@/layout/navMenu/horizontal.vue'));

// 定义变量内容
const stores = useRoutesList();
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const { routesList } = storeToRefs(stores);
const state = reactive({
	menuList: [] as RouteItems,
});

// 设置 logo 显示/隐藏（横向布局的 logo 在顶栏）
const setIsShowLogo = computed(() => {
	let { isShowLogo, layout } = themeConfig.value;
	return isShowLogo && layout === 'transverse';
});
// 设置是否显示横向导航菜单
const isLayoutTransverse = computed(() => themeConfig.value.layout === 'transverse');
// 设置/过滤路由（非静态路由/是否显示在菜单中）
const setFilterRoutes = () => {
	state.menuList = filterRoutesFun(routesList.value);
};
// 路由过滤递归函数
const filterRoutesFun = <T extends RouteItem>(arr: T[]): T[] => {
	return arr
		.filter((item: T) => !item.meta?.isHide)
		.map((item: T) => {
			item = Object.assign({}, item);
			if (item.children) item.children = filterRoutesFun(item.children);
			return item;
		});
};
// 页面加载时
onMounted(() => {
	setFilterRoutes();
	events.on('getBreadcrumbIndexSetFilterRoutes', () => {
		setFilterRoutes();
	});
});
// 监听 routesList 变化（动态路由载入或语言切换时同步更新横向菜单）
watch(routesList, () => {
	setFilterRoutes();
});
</script>

<style scoped lang="scss">
.layout-navbars-breadcrumb-index {
	height: 48px;
	display: flex;
	align-items: center;
	background: var(--admin-navigation);
	--admin-text: var(--next-bg-topBarColor);
	--admin-muted: var(--next-bg-topBarColor);
	border-bottom: 1px solid var(--admin-border);
	padding: 0 12px;

	:deep(.layout-logo) {
		width: auto;
		max-width: 220px;
		flex-shrink: 0;
		padding: 0 16px 0 4px;
	}
}
</style>
