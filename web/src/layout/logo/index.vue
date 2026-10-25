<template>
	<div class="layout-logo" v-if="setShowLogo" @click="onThemeConfigChange">
		<div class="layout-logo-brand">
			<img :src="siteLogo" class="layout-logo-img" alt="Logo" />
			<div class="layout-logo-text">
				<span class="layout-logo-title">{{ siteTitle }}</span>
				<span class="layout-logo-sub">{{ siteSubTitle }}</span>
			</div>
		</div>
	</div>
	<div class="layout-logo-collapsed" v-else @click="onThemeConfigChange" :title="siteTitle">
		<img :src="siteLogo" class="layout-logo-collapsed-img" alt="Logo" />
	</div>
</template>

<script setup lang="ts" name="layoutLogo">
import { computed } from 'vue';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import logoMini from '/@/assets/logo-mini.svg';
import { SystemConfigStore } from '/@/stores/systemConfig';

// 定义变量内容
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);

// 设置 logo 的显示。横向布局的 logo 在顶栏，不在这里
const setShowLogo = computed(() => {
	let { isCollapse, layout } = themeConfig.value;
	return !isCollapse || layout === 'transverse' || document.body.clientWidth < 1000;
});

// logo 点击实现菜单展开/收起
const onThemeConfigChange = () => {
	if (themeConfig.value.layout === 'transverse') return false;
	themeConfig.value.isCollapse = !themeConfig.value.isCollapse;
};

const systemConfigStore = SystemConfigStore();
const { systemConfig } = storeToRefs(systemConfigStore);
const getSystemConfig = computed(() => {
	return systemConfig.value || {};
});

const siteTitle = computed(() => {
	return getSystemConfig.value['login.site_title'] || themeConfig.value.globalTitle || 'DVAdmin';
});

const siteSubTitle = computed(() => {
	return getSystemConfig.value['login.site_sub_title'] || '管理控制台';
});

const siteLogo = computed(() => {
	return getSystemConfig.value?.['login.site_logo'] || logoMini;
});
</script>

<style scoped lang="scss">
.layout-logo {
	width: 100%;
	height: 48px;
	display: flex;
	align-items: center;
	padding: 0 16px;
	cursor: pointer;
	user-select: none;
	transition: background 0.15s ease;

	&:hover {
		.layout-logo-title {
			color: var(--admin-text);
		}
	}

	&-brand {
		display: flex;
		align-items: center;
		gap: 10px;
		min-width: 0;
	}

	&-img {
		width: 32px;
		height: 32px;
		border-radius: var(--admin-radius-sm, 6px);
		flex-shrink: 0;
		object-fit: contain;
	}

	&-text {
		display: flex;
		flex-direction: column;
		min-width: 0;
		line-height: 1.2;
	}

	&-title {
		font-size: 14.5px;
		font-weight: 600;
		letter-spacing: -0.015em;
		color: var(--admin-text);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
		transition: color 0.15s ease;
	}

	&-sub {
		font-size: 11px;
		color: var(--admin-muted);
		font-weight: 400;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
}

.layout-logo-collapsed {
	width: 100%;
	height: 48px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	user-select: none;

	&-img {
		width: 32px;
		height: 32px;
		border-radius: var(--admin-radius-sm, 6px);
		object-fit: contain;
		transition: transform 0.2s ease;

		&:hover {
			transform: scale(1.05);
		}
	}
}
</style>
