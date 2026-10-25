<template>
	<div class="login-wrapper" :class="{ 'has-custom-bg': Boolean(siteBg) }">
		<!-- 后台自定义配置的背景图（如有） -->
		<img v-if="siteBg" :src="siteBg" class="login-custom-bg" alt="login-background" />

		<!-- 顶部顶栏：系统品牌与工具操作（语言切换、深色模式） -->
		<header class="login-header-bar">
			<div class="login-header-brand">
				<img :src="siteLogo" class="login-brand-logo" alt="logo" />
				<span class="login-brand-name">{{ getSystemConfig['login.site_title'] || getThemeConfig.globalViceTitle || 'DVAdmin' }}</span>
			</div>
			<div class="login-header-actions">
				<!-- 深浅模式切换 -->
				<button
					type="button"
					class="login-action-btn"
					:title="themeConfig.isIsDark ? '切换至浅色模式' : '切换至深色模式'"
					@click="onToggleDarkMode"
				>
					<el-icon :size="16">
						<ele-Sunny v-if="themeConfig.isIsDark" />
						<ele-Moon v-else />
					</el-icon>
				</button>

				<!-- 国际化语言切换 -->
				<el-dropdown trigger="click" @command="onLanguageChange">
					<button type="button" class="login-action-btn login-lang-btn" title="切换语言">
						<el-icon :size="16"><ele-Promotion /></el-icon>
						<span class="login-lang-text">{{ currentLangLabel }}</span>
					</button>
					<template #dropdown>
						<el-dropdown-menu>
							<el-dropdown-item
								v-for="item in languageLabels"
								:key="item.command"
								:command="item.command"
								:disabled="locale === item.command"
							>
								{{ item.label }}
							</el-dropdown-item>
						</el-dropdown-menu>
					</template>
				</el-dropdown>
			</div>
		</header>

		<!-- 登录主视口 -->
		<main class="login-main-container">
			<!-- 左侧品牌展示看板（屏幕宽度小于 960px 时自适应折叠） -->
			<section class="login-hero-panel">
				<div class="hero-content">
					<div class="hero-badge">
						<span class="status-dot"></span>
						<span>v3.2 Enterprise Edition</span>
					</div>
					<h1 class="hero-title">
						{{ getSystemConfig['login.site_name'] || '企业级后台快速开发平台' }}
					</h1>
					<p class="hero-desc">
						基于 Django 4 与 Vue 3 构建的高性能中后台解决方案，开箱即用，安全可靠。
					</p>

					<!-- 特性亮点卡片 -->
					<div class="hero-features">
						<div class="hero-feature-item">
							<div class="feature-icon-box">
								<el-icon :size="18"><ele-Cpu /></el-icon>
							</div>
							<div class="feature-text">
								<h4>现代前后端分离架构</h4>
								<p>Vue 3 · Vite · TypeScript · Pinia · Element Plus</p>
							</div>
						</div>
						<div class="hero-feature-item">
							<div class="feature-icon-box">
								<el-icon :size="18"><ele-Lock /></el-icon>
							</div>
							<div class="feature-text">
								<h4>细粒度 RBAC 权限体系</h4>
								<p>角色、菜单、按钮及数据列的多维度精细授权</p>
							</div>
						</div>
						<div class="hero-feature-item">
							<div class="feature-icon-box">
								<el-icon :size="18"><ele-Connection /></el-icon>
							</div>
							<div class="feature-text">
								<h4>异步与动态接口基座</h4>
								<p>Celery 任务调度、WebSocket 实时推送与自动化 API</p>
							</div>
						</div>
					</div>
				</div>

				<!-- 背景微光氛围装饰 -->
				<div class="hero-ambient-glow"></div>
			</section>

			<!-- 右侧表单卡片 -->
			<section class="login-card-panel">
				<div class="login-card">
					<div class="login-card-header">
						<h2 class="login-card-title">
							{{ userInfos.pwd_change_count === 0 ? $t('message.pages.login.validation.firstLoginChangePwd') : $t('message.pages.login.signInText') }}
						</h2>
						<p class="login-card-subtitle">
							{{ userInfos.pwd_change_count === 0 ? '首次登录系统，请先完成密码初始化' : '请输入您的系统账号及凭证以继续访问' }}
						</p>
					</div>

					<div class="login-card-body">
						<div v-if="userInfos.pwd_change_count === 0">
							<ChangePwd />
						</div>
						<div v-else>
							<el-tabs v-model="state.tabsActiveName" class="login-custom-tabs">
								<el-tab-pane :label="$t('message.pages.login.label.one1')" name="account">
									<Account />
								</el-tab-pane>
								<el-tab-pane :label="$t('message.pages.login.label.two3')" name="scan">
									<Scan />
								</el-tab-pane>
							</el-tabs>
						</div>

						<OAuth2 />
					</div>
				</div>
			</section>
		</main>

		<!-- 底部授权与备案声明 -->
		<footer class="login-footer">
			<p class="footer-copyright">
				Copyright © {{ copyrightText }} 版权所有
			</p>
			<p class="footer-links">
				<a v-if="keepRecord" href="https://beian.miit.gov.cn" target="_blank" rel="noopener noreferrer">{{ keepRecord }}</a>
				<span v-if="keepRecord" class="footer-divider">|</span>
				<a :href="getSystemConfig['login.help_url'] || '#'" target="_blank" rel="noopener noreferrer">{{ $t('message.pages.login.footer.help') }}</a>
				<span class="footer-divider">|</span>
				<a :href="getSystemConfig['login.privacy_url'] ? getBaseURL(getSystemConfig['login.privacy_url']) : '#'" rel="noopener noreferrer">{{ $t('message.pages.login.footer.privacy') }}</a>
				<span class="footer-divider">|</span>
				<a :href="getSystemConfig['login.clause_url'] ? getBaseURL(getSystemConfig['login.clause_url']) : '#'" rel="noopener noreferrer">{{ $t('message.pages.login.footer.clause') }}</a>
			</p>
		</footer>
	</div>
</template>

<script setup lang="ts" name="loginIndex">
import { defineAsyncComponent, onMounted, reactive, computed, watch } from 'vue';
import { storeToRefs } from 'pinia';
import { useI18n } from 'vue-i18n';
import _ from 'lodash-es';
import { useThemeConfig } from '/@/stores/themeConfig';
import { useUserInfo } from '/@/stores/userInfo';
import { SystemConfigStore } from '/@/stores/systemConfig';
import { NextLoading } from '/@/utils/loading';
import { getBaseURL } from '/@/utils/baseUrl';
import { Local } from '/@/utils/storage';
import { changeThemeMode } from '/@/shared/access/themePresets';
import logoMini from '/@/assets/logo-mini.svg';

// 引入子组件
const Account = defineAsyncComponent(() => import('/@/views/system/login/component/account.vue'));
const Scan = defineAsyncComponent(() => import('/@/views/system/login/component/scan.vue'));
const ChangePwd = defineAsyncComponent(() => import('/@/views/system/login/component/changePwd.vue'));
const OAuth2 = defineAsyncComponent(() => import('/@/views/system/login/component/oauth2.vue'));

const { locale } = useI18n();
const { userInfos } = storeToRefs(useUserInfo());
const storesThemeConfig = useThemeConfig();
const { themeConfig } = storeToRefs(storesThemeConfig);
const systemConfigStore = SystemConfigStore();
const { systemConfig } = storeToRefs(systemConfigStore);

const state = reactive({
	tabsActiveName: 'account',
});

watch(
	() => userInfos.value.pwd_change_count,
	(val) => {
		if (val === 0) {
			state.tabsActiveName = 'changePwd';
		} else {
			state.tabsActiveName = 'account';
		}
	},
	{ deep: true, immediate: true }
);

const getThemeConfig = computed(() => themeConfig.value);
const getSystemConfig = computed(() => systemConfig.value);

const siteLogo = computed(() => {
	if (!_.isEmpty(getSystemConfig.value['login.site_logo'])) {
		return getSystemConfig.value['login.site_logo'];
	}
	return logoMini;
});

const siteBg = computed(() => {
	if (!_.isEmpty(getSystemConfig.value['login.login_background'])) {
		return getSystemConfig.value['login.login_background'];
	}
	return '';
});

// 语言选项
const languageLabels = [
	{ label: '简体中文', command: 'zh-cn' },
	{ label: 'English', command: 'en' },
	{ label: '繁體中文', command: 'zh-tw' },
];

const currentLangLabel = computed(() => {
	const current = languageLabels.find((item) => item.command === locale.value);
	return current ? current.label : '中文';
});

// 切换深浅模式
const onToggleDarkMode = () => {
	changeThemeMode(themeConfig.value, !themeConfig.value.isIsDark);
	Local.set('themeConfig', themeConfig.value);
};

// 切换语言
const onLanguageChange = (lang: string) => {
	themeConfig.value.globalI18n = lang;
	Local.set('themeConfig', themeConfig.value);
	locale.value = lang;
};

// 备案与版权
const copyrightText = computed(() => {
	const custom = getSystemConfig.value['login.copyright'];
	if (custom) return custom;
	const year = new Date().getFullYear();
	return `2021-${year} django-vue-admin.com`;
});

const keepRecord = computed(() => {
	return getSystemConfig.value['login.keep_record'] || '晋ICP备18005113号-3';
});

onMounted(() => {
	NextLoading.done();
	// 获取最新系统配置（标题、Logo、备案等）
	void systemConfigStore.getSystemConfigs().catch(() => {});
});
</script>

<style scoped lang="scss">
.login-wrapper {
	min-height: 100vh;
	display: flex;
	flex-direction: column;
	background-color: var(--admin-canvas, #ffffff);
	color: var(--admin-text, #0a0a0a);
	position: relative;
	overflow-x: hidden;
	transition: background-color 0.25s ease, color 0.25s ease;

	&.has-custom-bg {
		.login-custom-bg {
			position: fixed;
			inset: 0;
			width: 100%;
			height: 100%;
			object-fit: cover;
			z-index: 0;
			opacity: 0.85;
		}
	}
}

.login-header-bar {
	position: relative;
	z-index: 20;
	height: 64px;
	padding: 0 36px;
	display: flex;
	align-items: center;
	justify-content: space-between;

	.login-header-brand {
		display: flex;
		align-items: center;
		gap: 12px;

		.login-brand-logo {
			width: 32px;
			height: 32px;
			object-fit: contain;
		}

		.login-brand-name {
			font-size: 18px;
			font-weight: 600;
			letter-spacing: 0.5px;
			color: var(--admin-text, #0a0a0a);
		}
	}

	.login-header-actions {
		display: flex;
		align-items: center;
		gap: 10px;

		.login-action-btn {
			height: 34px;
			padding: 0 10px;
			display: inline-flex;
			align-items: center;
			justify-content: center;
			gap: 6px;
			border: 1px solid var(--admin-border, #e5e5e5);
			border-radius: var(--admin-radius, 8px);
			background: var(--admin-surface, #ffffff);
			color: var(--admin-text-secondary, #525252);
			cursor: pointer;
			transition: all 0.2s ease;
			font-size: 13px;

			&:hover {
				background: var(--admin-hover, #f5f5f5);
				border-color: var(--admin-border-strong, #d4d4d4);
				color: var(--admin-text, #0a0a0a);
			}

			.login-lang-text {
				font-size: 12px;
				font-weight: 500;
			}
		}
	}
}

.login-main-container {
	position: relative;
	z-index: 10;
	flex: 1;
	display: flex;
	width: 100%;
	max-width: 1360px;
	margin: 0 auto;
	align-items: center;
	padding: 20px 36px 36px;
}

.login-hero-panel {
	flex: 1.15;
	padding: 40px 64px 40px 24px;
	position: relative;

	.hero-content {
		position: relative;
		z-index: 2;
		max-width: 540px;

		.hero-badge {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 4px 12px;
			border-radius: var(--admin-radius-full, 9999px);
			background: var(--admin-surface-2, #f5f5f5);
			border: 1px solid var(--admin-border, #e5e5e5);
			font-size: 12px;
			font-weight: 500;
			color: var(--admin-text-secondary, #525252);
			margin-bottom: 24px;

			.status-dot {
				width: 7px;
				height: 7px;
				border-radius: 50%;
				background: #16a34a;
				box-shadow: 0 0 0 3px rgba(22, 163, 74, 0.2);
			}
		}

		.hero-title {
			font-size: 34px;
			font-weight: 700;
			line-height: 1.25;
			letter-spacing: -0.5px;
			color: var(--admin-text, #0a0a0a);
			margin-bottom: 16px;
		}

		.hero-desc {
			font-size: 15px;
			line-height: 1.6;
			color: var(--admin-muted, #737373);
			margin-bottom: 36px;
		}

		.hero-features {
			display: flex;
			flex-direction: column;
			gap: 14px;

			.hero-feature-item {
				display: flex;
				align-items: center;
				gap: 14px;
				padding: 14px 18px;
				border-radius: var(--admin-radius-lg, 10px);
				background: var(--admin-surface, #ffffff);
				border: 1px solid var(--admin-border, #e5e5e5);
				box-shadow: var(--admin-shadow-xs);
				transition: transform 0.2s ease, border-color 0.2s ease;

				&:hover {
					border-color: var(--admin-border-strong, #d4d4d4);
					transform: translateX(4px);
				}

				.feature-icon-box {
					width: 38px;
					height: 38px;
					border-radius: var(--admin-radius, 8px);
					background: var(--admin-accent-soft, #f5f5f5);
					color: var(--admin-accent, #171717);
					display: flex;
					align-items: center;
					justify-content: center;
					flex-shrink: 0;
				}

				.feature-text {
					h4 {
						font-size: 14px;
						font-weight: 600;
						color: var(--admin-text, #0a0a0a);
						margin-bottom: 3px;
					}

					p {
						font-size: 12px;
						color: var(--admin-muted, #737373);
						line-height: 1.4;
					}
				}
			}
		}
	}

	.hero-ambient-glow {
		position: absolute;
		top: 20%;
		left: 10%;
		width: 360px;
		height: 360px;
		background: radial-gradient(circle, color-mix(in srgb, var(--el-color-primary) 12%, transparent) 0%, transparent 70%);
		filter: blur(40px);
		pointer-events: none;
		z-index: 1;
	}
}

.login-card-panel {
	flex: 1;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 16px;

	.login-card {
		width: 100%;
		max-width: 440px;
		background: var(--admin-surface, #ffffff);
		border: 1px solid var(--admin-border, #e5e5e5);
		border-radius: var(--admin-radius-xl, 14px);
		box-shadow: var(--admin-shadow, 0 4px 6px -1px rgba(0, 0, 0, 0.07));
		padding: 38px 34px 34px;
		transition: background-color 0.25s ease, border-color 0.25s ease;

		.login-card-header {
			margin-bottom: 24px;
			text-align: left;

			.login-card-title {
				font-size: 22px;
				font-weight: 600;
				letter-spacing: -0.2px;
				color: var(--admin-text, #0a0a0a);
				margin-bottom: 6px;
			}

			.login-card-subtitle {
				font-size: 13px;
				color: var(--admin-muted, #737373);
				line-height: 1.5;
			}
		}

		.login-custom-tabs {
			:deep(.el-tabs__nav-wrap::after) {
				height: 1px;
				background-color: var(--admin-border, #e5e5e5);
			}

			:deep(.el-tabs__item) {
				font-size: 14px;
				color: var(--admin-muted, #737373);
				font-weight: 500;
				padding: 0 16px 12px;

				&.is-active {
					color: var(--el-color-primary);
					font-weight: 600;
				}
			}

			:deep(.el-tabs__active-bar) {
				height: 2px;
				background-color: var(--el-color-primary);
			}
		}
	}
}

.login-footer {
	position: relative;
	z-index: 10;
	padding: 18px 24px;
	text-align: center;
	font-size: 12px;
	color: var(--admin-muted, #737373);
	line-height: 1.8;

	.footer-copyright {
		margin-bottom: 4px;
	}

	.footer-links {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-wrap: wrap;
		gap: 6px;

		a {
			color: var(--admin-muted, #737373);
			text-decoration: none;
			transition: color 0.2s ease;

			&:hover {
				color: var(--el-color-primary);
			}
		}

		.footer-divider {
			color: var(--admin-border-strong, #d4d4d4);
		}
	}
}

@media (max-width: 960px) {
	.login-hero-panel {
		display: none;
	}

	.login-main-container {
		justify-content: center;
		padding: 20px 16px;
	}

	.login-card-panel {
		width: 100%;
		padding: 0;

		.login-card {
			max-width: 100%;
			box-shadow: none;
			border: 1px solid var(--admin-border, #e5e5e5);
		}
	}

	.login-header-bar {
		padding: 0 20px;
	}
}

@media (max-width: 480px) {
	.login-header-bar {
		padding: 0 16px;

		.login-lang-text {
			display: none;
		}
	}
}
</style>
