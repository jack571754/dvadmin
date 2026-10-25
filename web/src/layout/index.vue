<template>
	<component :is="layouts[currentLayout]" />
</template>

<script setup lang="ts" name="layout">
import { computed, onBeforeMount, onUnmounted, defineAsyncComponent } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { Local } from '/@/utils/storage';
import mittBus from '/@/utils/mitt';

// 引入组件。经典（classic）与分栏（columns）布局已在 V2 收敛时移除。
const layouts: any = {
	defaults: defineAsyncComponent(() => import('/@/layout/main/defaults.vue')),
	transverse: defineAsyncComponent(() => import('/@/layout/main/transverse.vue')),
};

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 存储里可能残留已删除的布局名；没有对应组件时回落 defaults，避免整页空白
const currentLayout = computed(() => (layouts[themeConfig.value.layout] ? themeConfig.value.layout : 'defaults'));

// 窗口大小改变时(适配移动端)
const onLayoutResize = () => {
	if (!Local.get('oldLayout')) Local.set('oldLayout', themeConfig.value.layout);
	const clientWidth = document.body.clientWidth;
	if (clientWidth < 1000) {
		themeConfig.value.isCollapse = false;
		mittBus.emit('layoutMobileResize', {
			layout: 'defaults',
			clientWidth,
		});
	} else {
		const stored = Local.get('oldLayout');
		mittBus.emit('layoutMobileResize', {
			layout: layouts[stored] ? stored : themeConfig.value.layout,
			clientWidth,
		});
	}
};
// 页面加载前
onBeforeMount(() => {
	onLayoutResize();
	window.addEventListener('resize', onLayoutResize);
});
// 页面卸载时
onUnmounted(() => {
	window.removeEventListener('resize', onLayoutResize);
});
</script>
