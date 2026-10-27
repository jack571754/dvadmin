<template>
	<div class="h100" v-show="!isTagsViewCurrenFull">
		<el-aside class="layout-aside" :class="setCollapseStyle">
			<Logo v-if="setShowLogo" />
			<el-scrollbar class="flex-auto layout-aside-scrollbar" ref="layoutAsideScrollbarRef">
				<Vertical :menuList="state.menuList" />
			</el-scrollbar>
			<NavUser :is-collapse="themeConfig.isCollapse" />
		</el-aside>
	</div>
</template>

<script setup lang="ts" name="layoutAside">
import { defineAsyncComponent, reactive, computed, watch, onBeforeMount, onUnmounted, ref } from 'vue';
import { storeToRefs } from 'pinia';
import { useRoutesList } from '/@/stores/routesList';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import mittBus from '/@/utils/mitt';
import { createEventSubscriptions } from '/@/shared/access/eventSubscriptions';
const events = createEventSubscriptions(mittBus);
onUnmounted(() => events.clear());

// 引入组件
const Logo = defineAsyncComponent(() => import('/@/layout/logo/index.vue'));
const Vertical = defineAsyncComponent(() => import('/@/layout/navMenu/vertical.vue'));
const NavUser = defineAsyncComponent(() => import('/@/layout/component/NavUser.vue'));

// 定义变量内容
const layoutAsideScrollbarRef = ref();
const stores = useRoutesList();
const storesThemeConfig = useThemeConfig();
const storesTagsViewRoutes = useTagsViewRoutes();
const { routesList } = storeToRefs(stores);
const { themeConfig } = storeToRefs(storesThemeConfig);
const { isTagsViewCurrenFull } = storeToRefs(storesTagsViewRoutes);
const state = reactive<AsideState>({
	menuList: [],
	clientWidth: 0,
});

// 设置菜单展开/收起时的宽度
const setCollapseStyle = computed(() => {
	const { isCollapse } = themeConfig.value;
	// 判断是否是手机端
	if (state.clientWidth <= 1000) {
		if (isCollapse) {
			document.body.setAttribute('class', 'el-popup-parent--hidden');
			const asideEle = document.querySelector('.layout-container') as HTMLElement;
			const modeDivs = document.createElement('div');
			modeDivs.setAttribute('class', 'layout-aside-mobile-mode');
			asideEle.appendChild(modeDivs);
			modeDivs.addEventListener('click', closeLayoutAsideMobileMode);
			return ['layout-aside-mobile', 'layout-aside-mobile-open'];
		} else {
			// 关闭弹窗
			closeLayoutAsideMobileMode();
			return ['layout-aside-mobile', 'layout-aside-mobile-close'];
		}
	}
	return [isCollapse ? 'layout-aside-pc-collapsed' : 'layout-aside-pc-expanded'];
});

// 设置显示/隐藏 logo（横向布局的 logo 在顶栏，不在侧栏）
const setShowLogo = computed(() => {
	const { layout, isShowLogo } = themeConfig.value;
	return isShowLogo && layout === 'defaults';
});

// 关闭移动端蒙版
const closeLayoutAsideMobileMode = () => {
	const el = document.querySelector('.layout-aside-mobile-mode');
	el?.setAttribute('style', 'animation: error-img-two 0.3s');
	setTimeout(() => {
		el?.parentNode?.removeChild(el);
	}, 300);
	const clientWidth = document.body.clientWidth;
	if (clientWidth < 1000) themeConfig.value.isCollapse = false;
	document.body.setAttribute('class', '');
};

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

// 设置菜单导航是否固定（移动端）
const initMenuFixed = (clientWidth: number) => {
	state.clientWidth = clientWidth;
};

// 页面加载前
onBeforeMount(() => {
	initMenuFixed(document.body.clientWidth);
	setFilterRoutes();
	events.on('getBreadcrumbIndexSetFilterRoutes', () => {
		setFilterRoutes();
	});
	events.on('layoutMobileResize', (res: LayoutMobileResize) => {
		initMenuFixed(res.clientWidth);
		closeLayoutAsideMobileMode();
	});
});

// 监听 routesList 变化（语言切换时重新刷新菜单）
watch(routesList, () => {
	setFilterRoutes();
});
watch(themeConfig.value, (val) => {
	if (val.isShowLogoChange !== val.isShowLogo) {
		if (layoutAsideScrollbarRef.value) layoutAsideScrollbarRef.value.update();
	}
});
</script>

<style scoped lang="scss">
.layout-aside {
	display: flex;
	flex-direction: column;
	height: 100%;
}
.layout-aside-scrollbar {
	flex: 1;
	min-height: 0;
}
</style>
