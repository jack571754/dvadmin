<template>
	<div class="home-container admin-workspace">
		<!-- Page Header -->
		<div class="workspace-header">
			<div class="workspace-header-left">
				<h1 class="workspace-title">{{ t('message.design.welcome', { name: userInfo.name || userInfo.username }) }}</h1>
				<p class="workspace-subtitle">
					<span>{{ today }}</span>
					<span class="intro-dot">·</span>
					<span>{{ userInfo.dept_info?.dept_name || 'DVAdmin' }}</span>
					<span class="intro-dot">·</span>
					<span>{{ roleNames || '系统用户' }}</span>
				</p>
			</div>
			<div class="workspace-header-actions">
				<el-button :icon="User" @click="router.push('/personal')">{{ t('message.design.profile') || '个人中心' }}</el-button>
			</div>
		</div>

		<!-- SectionCards: 4 Core KPIs -->
		<div class="workspace-kpi-grid">
			<StatCard
				title="活跃用户总数"
				:value="stats.total_users || 0"
				hint="系统中处于启用状态的账户"
			>
				<template #icon>
					<el-icon><User /></el-icon>
				</template>
			</StatCard>

			<StatCard
				title="今日系统访问"
				:value="stats.active_today || 0"
				hint="今日用户成功认证与登录次数"
			>
				<template #icon>
					<el-icon><Grid /></el-icon>
				</template>
			</StatCard>

			<StatCard
				title="系统操作审计"
				:value="stats.total_operations || 0"
				hint="业务变更与操作日志总数"
			>
				<template #icon>
					<el-icon><Operation /></el-icon>
				</template>
			</StatCard>

			<StatCard
				title="待读通知"
				:value="unread"
				:hint="unread > 0 ? '您有未读的系统消息' : '暂无未读消息'"
			>
				<template #icon>
					<el-icon><Bell /></el-icon>
				</template>
			</StatCard>
		</div>

		<!-- Main Workspace Grid -->
		<div class="workspace-content-grid">
			<!-- Left Area (Chart + Quick Access) -->
			<div class="workspace-content-left">
				<!-- Area Trend Chart -->
				<AreaTrendChart :on-data-loaded="onSummaryLoaded" />

				<!-- Quick Access Shortcuts -->
				<div class="admin-surface workspace-section">
					<div class="workspace-section-heading">
						<div class="section-heading-left">
							<h2>{{ t('message.design.quickAccess') || '常用功能' }}</h2>
							<span>{{ t('message.design.quickHint') || '快速直达核心功能模块' }}</span>
						</div>
					</div>
					<div v-if="shortcuts.length" class="workspace-shortcuts">
						<button
							v-for="entry in shortcuts"
							:key="entry.path"
							class="workspace-shortcut"
							type="button"
							@click="router.push(entry.path)"
						>
							<span class="shortcut-icon"><component :is="entry.icon" /></span>
							<span class="shortcut-text">
								<strong>{{ entry.title }}</strong>
								<small>{{ t('message.design.open') || '进入' }}</small>
							</span>
							<ArrowRight class="shortcut-arrow" />
						</button>
					</div>
					<EmptyState v-else title="暂无快捷功能" description="请联系管理员为您配置菜单权限" />
				</div>
			</div>

			<!-- Right Area (Identity Card + Notices) -->
			<div class="workspace-content-right">
				<!-- Account Profile Card -->
				<div class="admin-surface workspace-account-card">
					<div class="account-card-header">
						<div class="account-avatar">{{ initials }}</div>
						<div class="account-meta">
							<strong class="account-name">{{ userInfo.name || userInfo.username }}</strong>
							<span class="account-username">@{{ userInfo.username }}</span>
						</div>
						<el-icon class="account-badge"><Lock /></el-icon>
					</div>

					<div class="account-details">
						<div class="detail-row">
							<span class="detail-label">{{ t('message.design.department') || '归属部门' }}</span>
							<span class="detail-value">{{ userInfo.dept_info?.dept_name || '未分配' }}</span>
						</div>
						<div class="detail-row">
							<span class="detail-label">{{ t('message.design.roles') || '关联角色' }}</span>
							<span class="detail-value">{{ roleNames || '未分配' }}</span>
						</div>
						<div class="detail-row">
							<span class="detail-label">授权路由数</span>
							<span class="detail-value font-medium">{{ availableRoutes.length }} 个页面</span>
						</div>
					</div>
				</div>

				<!-- Recent Notices Card -->
				<div class="admin-surface workspace-section workspace-updates">
					<div class="workspace-section-heading">
						<div class="section-heading-left">
							<h2>
								{{ t('message.design.notifications') || '系统公告' }}
								<span v-if="unread > 0" class="unread-pill">{{ unread }}</span>
							</h2>
						</div>
						<el-button v-if="canReadMessages" link type="primary" @click="router.push('/messageCenter')">
							{{ t('message.design.viewAll') || '全部' }}
							<el-icon><ArrowRight /></el-icon>
						</el-button>
					</div>

					<el-skeleton v-if="loading" :rows="3" animated />
					<div v-else-if="failed" class="workspace-empty">
						<el-icon class="text-xl text-[var(--admin-muted)]"><Bell /></el-icon>
						<strong>{{ t('message.design.loadFailed') || '加载失败' }}</strong>
						<el-button link type="primary" @click="loadMessages">{{ t('message.design.retry') || '重试' }}</el-button>
					</div>
					<ul v-else-if="notices.length" class="workspace-notices">
						<li v-for="notice in notices" :key="notice.id" class="notice-item">
							<span class="notice-marker"></span>
							<div class="notice-body">
								<strong class="notice-title">{{ notice.title }}</strong>
								<small class="notice-creator">{{ notice.creator_name || '系统' }}</small>
							</div>
							<time class="notice-time">{{ notice.create_datetime?.slice(0, 10) }}</time>
						</li>
					</ul>
					<div v-else class="workspace-empty">
						<EmptyState
							title="暂无新消息"
							description="当前没有待处理的系统公告或通知"
						/>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="home">
import { computed, onMounted, ref, reactive } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { User, ArrowRight, Bell, Lock, Setting, Folder, Tickets, Operation, Grid } from '@element-plus/icons-vue';
import StatCard from '/@/shared/ui/StatCard.vue';
import EmptyState from '/@/shared/ui/EmptyState.vue';
import AreaTrendChart from './components/AreaTrendChart.vue';
import { useRoutesList } from '/@/stores/routesList';
import { useUserInfo } from '/@/stores/userInfo';
import { messageCenterStore } from '/@/stores/messageCenter';
import { request } from '/@/utils/service';

interface NavigationEntry {
	path: string;
	children?: NavigationEntry[];
	meta?: { title?: string; isHide?: boolean; isLink?: string };
}

interface Notice {
	id: number;
	title: string;
	creator_name?: string;
	create_datetime?: string;
}

const { t, te, locale } = useI18n();
const router = useRouter();
const routes = useRoutesList();
const user = useUserInfo();
const messages = messageCenterStore();

const userInfo = computed(() => user.userInfos);
const unread = computed(() => Number(messages.unread) || 0);
const roleNames = computed(() => userInfo.value.role_info?.map((role) => role.name).join(' / ') || '');
const initials = computed(() => (userInfo.value.name || userInfo.value.username || 'AD').slice(0, 2).toUpperCase());
const today = computed(() =>
	new Intl.DateTimeFormat(locale.value === 'en' ? 'en' : locale.value, {
		month: 'long',
		day: 'numeric',
		weekday: 'long',
	}).format(new Date())
);

const stats = reactive({
	total_users: 0,
	active_today: 0,
	total_operations: 0,
});

const onSummaryLoaded = (summary: { total_users: number; active_today: number; total_operations: number }) => {
	stats.total_users = summary.total_users;
	stats.active_today = summary.active_today;
	stats.total_operations = summary.total_operations;
};

const availableRoutes = computed(() => {
	const result: NavigationEntry[] = [];
	const visit = (items: NavigationEntry[]) =>
		items.forEach((item) => {
			if (item.meta?.isHide) return;
			if (item.children?.length) visit(item.children);
			else if (item.path?.startsWith('/') && !item.path.startsWith('//') && item.path !== '/home' && !item.meta?.isLink)
				result.push(item);
		});
	visit(routes.routesList as unknown as NavigationEntry[]);
	return result;
});

const icons = [User, Lock, Operation, Setting, Folder, Tickets, Grid];
const shortcuts = computed(() =>
	availableRoutes.value.slice(0, 6).map((entry, index) => ({
		path: entry.path,
		title: entry.meta?.title && te(entry.meta.title) ? t(entry.meta.title) : entry.meta?.title || entry.path,
		icon: icons[index % icons.length],
	}))
);

const canReadMessages = computed(() => availableRoutes.value.some((entry) => entry.path === '/messageCenter'));
const notices = ref<Notice[]>([]);
const loading = ref(false);
const failed = ref(false);

async function loadMessages() {
	if (!canReadMessages.value) return;
	loading.value = true;
	failed.value = false;
	try {
		const response = (await request({
			url: '/api/system/message_center/get_self_receive/',
			method: 'get',
			params: { page: 1, limit: 4 },
		})) as { data: Notice[] };
		notices.value = Array.isArray(response.data) ? response.data.slice(0, 4) : [];
	} catch {
		failed.value = true;
	} finally {
		loading.value = false;
	}
}

onMounted(loadMessages);
</script>

<style scoped lang="scss">
.home-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.workspace-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding-bottom: 4px;

	&-left {
		display: flex;
		flex-direction: column;
		gap: 4px;
	}
}

.workspace-title {
	font-size: 20px;
	font-weight: 700;
	letter-spacing: -0.02em;
	color: var(--admin-text);
	margin: 0;
	line-height: 1.2;
}

.workspace-subtitle {
	font-size: 13px;
	color: var(--admin-muted);
	margin: 0;
	display: flex;
	align-items: center;
	gap: 6px;
}

.intro-dot {
	opacity: 0.5;
}

/* 4 KPI Grid */
.workspace-kpi-grid {
	display: grid;
	grid-template-columns: repeat(4, minmax(0, 1fr));
	gap: 16px;
}

/* Content Grid (2 columns: 8fr + 4fr) */
.workspace-content-grid {
	display: grid;
	grid-template-columns: 2fr 1fr;
	gap: 20px;
	align-items: flex-start;
}

.workspace-content-left {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

.workspace-content-right {
	display: flex;
	flex-direction: column;
	gap: 20px;
}

/* Section Common */
.workspace-section {
	padding: 18px 20px;
	background: var(--admin-surface);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-lg, 10px);
	box-shadow: var(--admin-shadow-xs);
}

.workspace-section-heading {
	display: flex;
	align-items: center;
	justify-content: space-between;
	margin-bottom: 14px;

	.section-heading-left {
		h2 {
			font-size: 15px;
			font-weight: 600;
			color: var(--admin-text);
			margin: 0;
			line-height: 1.2;
			display: flex;
			align-items: center;
			gap: 8px;
		}

		span {
			font-size: 12px;
			color: var(--admin-muted);
			display: block;
			margin-top: 3px;
		}
	}
}

.unread-pill {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	padding: 0 6px;
	height: 18px;
	background: var(--admin-primary);
	color: var(--admin-primary-foreground);
	border-radius: 9999px;
	font-size: 11px;
	font-weight: 600;
}

/* Shortcuts Grid */
.workspace-shortcuts {
	display: grid;
	grid-template-columns: repeat(3, minmax(0, 1fr));
	gap: 12px;
}

.workspace-shortcut {
	display: flex;
	align-items: center;
	gap: 12px;
	padding: 12px 14px;
	background: var(--admin-surface-2);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-sm, 6px);
	cursor: pointer;
	text-align: left;
	transition: all 0.12s ease;

	&:hover {
		background: var(--admin-hover);
		border-color: var(--admin-border-strong);
		transform: translateY(-1px);

		.shortcut-arrow {
			color: var(--admin-text);
			transform: translateX(2px);
		}
	}

	.shortcut-icon {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 32px;
		height: 32px;
		border-radius: 6px;
		background: var(--admin-surface);
		border: 1px solid var(--admin-border);
		color: var(--admin-text);
		font-size: 16px;
		flex-shrink: 0;
	}

	.shortcut-text {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;

		strong {
			font-size: 13px;
			font-weight: 550;
			color: var(--admin-text);
			overflow: hidden;
			text-overflow: ellipsis;
			white-space: nowrap;
		}

		small {
			font-size: 11px;
			color: var(--admin-muted);
			margin-top: 2px;
		}
	}

	.shortcut-arrow {
		width: 14px;
		height: 14px;
		color: var(--admin-muted);
		transition: all 0.12s ease;
		flex-shrink: 0;
	}
}

/* Account Profile Card */
.workspace-account-card {
	padding: 20px;
	background: var(--admin-surface);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-lg, 10px);
	box-shadow: var(--admin-shadow-xs);

	.account-card-header {
		display: flex;
		align-items: center;
		gap: 12px;
		padding-bottom: 16px;
		border-bottom: 1px solid var(--admin-border);
	}

	.account-avatar {
		width: 44px;
		height: 44px;
		border-radius: var(--admin-radius-sm, 6px);
		background: var(--admin-surface-2);
		border: 1px solid var(--admin-border);
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 15px;
		font-weight: 600;
		color: var(--admin-text);
		flex-shrink: 0;
	}

	.account-meta {
		flex: 1;
		min-width: 0;

		.account-name {
			font-size: 14px;
			font-weight: 600;
			color: var(--admin-text);
			display: block;
			line-height: 1.2;
		}

		.account-username {
			font-size: 12px;
			color: var(--admin-muted);
			margin-top: 2px;
			display: block;
		}
	}

	.account-badge {
		color: var(--admin-muted);
		font-size: 16px;
	}

	.account-details {
		padding-top: 14px;
		display: flex;
		flex-direction: column;
		gap: 10px;

		.detail-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			font-size: 12.5px;

			.detail-label {
				color: var(--admin-muted);
			}

			.detail-value {
				color: var(--admin-text);
				font-weight: 500;
			}
		}
	}
}

/* Notices List */
.workspace-notices {
	list-style: none;
	padding: 0;
	margin: 0;
	display: flex;
	flex-direction: column;
	gap: 10px;

	.notice-item {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 8px 10px;
		border-radius: var(--admin-radius-sm, 6px);
		background: var(--admin-surface-2);
		transition: background 0.12s ease;

		&:hover {
			background: var(--admin-hover);
		}

		.notice-marker {
			width: 6px;
			height: 6px;
			border-radius: 50%;
			background: var(--admin-primary);
			flex-shrink: 0;
		}

		.notice-body {
			flex: 1;
			min-width: 0;
			display: flex;
			flex-direction: column;

			.notice-title {
				font-size: 12.5px;
				font-weight: 500;
				color: var(--admin-text);
				overflow: hidden;
				text-overflow: ellipsis;
				white-space: nowrap;
			}

			.notice-creator {
				font-size: 11px;
				color: var(--admin-muted);
				margin-top: 1px;
			}
		}

		.notice-time {
			font-size: 11px;
			color: var(--admin-muted);
			flex-shrink: 0;
		}
	}
}

.workspace-empty {
	padding: 20px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	gap: 8px;
}

@media (max-width: 1200px) {
	.workspace-kpi-grid {
		grid-template-columns: repeat(2, minmax(0, 1fr));
	}
	.workspace-content-grid {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 768px) {
	.workspace-kpi-grid {
		grid-template-columns: 1fr;
	}
	.workspace-shortcuts {
		grid-template-columns: 1fr;
	}
}
</style>
