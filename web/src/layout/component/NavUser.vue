<template>
	<div class="nav-user-container" :class="{ 'is-collapse': isCollapse }">
		<el-dropdown trigger="click" placement="top-start" @command="handleCommand">
			<div class="nav-user-button">
				<div class="nav-user-avatar">
					<img v-if="userInfos.avatar" :src="userInfos.avatar" alt="Avatar" />
					<span v-else class="nav-user-fallback">{{ avatarFallback }}</span>
				</div>
				<div v-if="!isCollapse" class="nav-user-info">
					<div class="nav-user-name">{{ displayName }}</div>
					<div class="nav-user-role">{{ roleName }}</div>
				</div>
				<div v-if="!isCollapse" class="nav-user-caret">
					<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
						<path d="m7 15 5 5 5-5"/>
						<path d="m7 9 5-5 5 5"/>
					</svg>
				</div>
			</div>
			<template #dropdown>
				<el-dropdown-menu class="nav-user-dropdown">
					<div class="nav-user-dropdown-header">
						<div class="font-medium text-sm text-[var(--admin-text)]">{{ displayName }}</div>
						<div class="text-xs text-[var(--admin-muted)]">{{ userInfos.email || roleName }}</div>
					</div>
					<el-dropdown-item command="/personal">
						<el-icon><ele-User /></el-icon>
						<span>{{ $t('message.user.dropdown2') || '个人中心' }}</span>
					</el-dropdown-item>
					<el-dropdown-item command="/versionUpgradeLog">
						<el-icon><ele-Document /></el-icon>
						<span>{{ $t('message.user.versionLog') || '更新日志' }}</span>
					</el-dropdown-item>
					<el-dropdown-item divided command="logOut" class="text-red-500">
						<el-icon><ele-SwitchButton /></el-icon>
						<span>{{ $t('message.user.dropdown5') || '退出登录' }}</span>
					</el-dropdown-item>
				</el-dropdown-menu>
			</template>
		</el-dropdown>
	</div>
</template>

<script setup lang="ts" name="NavUser">
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { ElMessageBox, ElMessage } from 'element-plus';
import { useI18n } from 'vue-i18n';
import { useUserInfo } from '/@/stores/userInfo';
import { Session, Local } from '/@/utils/storage';

defineProps<{
	isCollapse?: boolean;
}>();

const { t } = useI18n();
const router = useRouter();
const userInfoStore = useUserInfo();
const { userInfos } = storeToRefs(userInfoStore);

const displayName = computed(() => {
	return userInfos.value.name || userInfos.value.username || '管理员';
});

const roleName = computed(() => {
	if (userInfos.value.role_info && userInfos.value.role_info.length > 0) {
		return userInfos.value.role_info.map((r: any) => r.name).filter(Boolean).join(', ') || 'DVAdmin';
	}
	return userInfos.value.dept_info?.dept_name || 'DVAdmin';
});

const avatarFallback = computed(() => {
	const name = displayName.value;
	return name.slice(0, 1).toUpperCase();
});

const handleCommand = (command: string) => {
	if (command === 'logOut') {
		ElMessageBox({
			closeOnClickModal: false,
			closeOnPressEscape: false,
			title: t('message.user.logOutTitle') || '提示',
			message: t('message.user.logOutMessage') || '确定要退出当前系统吗？',
			showCancelButton: true,
			confirmButtonText: t('message.user.logOutConfirm') || '退出',
			cancelButtonText: t('message.user.logOutCancel') || '取消',
			beforeClose: (action, instance, done) => {
				if (action === 'confirm') {
					instance.confirmButtonLoading = true;
					instance.confirmButtonText = t('message.user.logOutExit') || '正在退出...';
					setTimeout(() => {
						done();
						setTimeout(() => {
							instance.confirmButtonLoading = false;
						}, 300);
					}, 500);
				} else {
					done();
				}
			},
		}).then(async () => {
			Session.clear();
			Local.remove('token');
			Local.remove('routesList');
			ElMessage.success(t('message.user.logOutSuccess') || '退出成功');
			setTimeout(() => {
				window.location.href = '';
			}, 300);
		}).catch(() => {});
	} else if (command.startsWith('/')) {
		router.push(command);
	}
};
</script>

<style scoped lang="scss">
.nav-user-container {
	padding: 8px;
	border-top: 1px solid var(--admin-border);
	background: var(--admin-sidebar);

	:deep(.el-dropdown) {
		width: 100%;
		display: block;
	}
}

.nav-user-button {
	display: flex;
	align-items: center;
	gap: 10px;
	width: 100%;
	padding: 8px;
	border-radius: var(--admin-radius, 8px);
	cursor: pointer;
	user-select: none;
	transition: background 0.15s ease;

	&:hover {
		background: var(--admin-hover);
	}
}

.nav-user-avatar {
	width: 32px;
	height: 32px;
	border-radius: var(--admin-radius-sm, 6px);
	overflow: hidden;
	flex-shrink: 0;
	background: var(--admin-surface-2);
	display: flex;
	align-items: center;
	justify-content: center;
	border: 1px solid var(--admin-border);

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
	}
}

.nav-user-fallback {
	font-size: 13px;
	font-weight: 600;
	color: var(--admin-text);
}

.nav-user-info {
	flex: 1;
	min-width: 0;
	text-align: left;
}

.nav-user-name {
	font-size: 13px;
	font-weight: 550;
	color: var(--admin-text);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	line-height: 1.2;
}

.nav-user-role {
	font-size: 11px;
	color: var(--admin-muted);
	overflow: hidden;
	text-overflow: ellipsis;
	white-space: nowrap;
	line-height: 1.2;
	margin-top: 2px;
}

.nav-user-caret {
	color: var(--admin-muted);
	flex-shrink: 0;
}

.nav-user-container.is-collapse {
	padding: 8px 4px;

	.nav-user-button {
		justify-content: center;
		padding: 6px 0;
	}
}

.nav-user-dropdown {
	min-width: 190px;
}

.nav-user-dropdown-header {
	padding: 8px 12px;
	border-bottom: 1px solid var(--admin-border);
	margin-bottom: 4px;
}
</style>
