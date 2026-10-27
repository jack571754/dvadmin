import { ElMessageBox } from 'element-plus';
import type { Router } from 'vue-router';
import { Local, Session } from '/@/utils/storage';
import { successMessage } from '/@/utils/message';
import { runLogout } from './logoutCore';

/** 确认后到关闭弹窗之间的反馈停留：只为了让「正在退出…」被看见，不是等任何接口 */
const CONFIRM_FEEDBACK_MS = 400;

export type Translate = (key: string) => string;

/**
 * 退出确认。不可逆动作走 dialog 档，点遮罩和 Esc 都不算确认。
 */
export function confirmLogout(t: Translate): Promise<boolean> {
	return ElMessageBox({
		closeOnClickModal: false,
		closeOnPressEscape: false,
		title: t('message.user.logOutTitle'),
		message: t('message.user.logOutMessage'),
		showCancelButton: true,
		confirmButtonText: t('message.user.logOutConfirm'),
		cancelButtonText: t('message.user.logOutCancel'),
		beforeClose: (action, instance, done) => {
			if (action !== 'confirm') {
				done();
				return;
			}
			instance.confirmButtonLoading = true;
			instance.confirmButtonText = t('message.user.logOutExit');
			setTimeout(() => {
				done();
				setTimeout(() => {
					instance.confirmButtonLoading = false;
				}, 300);
			}, CONFIRM_FEEDBACK_MS);
		},
	})
		.then(() => true)
		.catch(() => false);
}

/** 清会话 → 跳登录页 → 提示一次（决策在 logoutCore.ts） */
export function logout(router: Router): Promise<void> {
	return runLogout({
		clearSession: () => {
			Session.clear();
			Local.remove('token');
			Local.remove('routesList');
		},
		replaceRoute: path => router.replace(path),
		notify: key => successMessage(key),
	});
}
