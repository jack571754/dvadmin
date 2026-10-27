/**
 * 退出登录的唯一实现（纯决策层，不碰 Element / router，可在 Node 下单测）。
 *
 * 侧栏用户卡（layout/component/NavUser.vue）和顶栏用户菜单（layout/navBars/breadcrumb/user.vue）
 * 曾经各写一套：假延迟 500ms / 700ms，跳转一边是整页刷新、一边是 router.replace，
 * 提示一边有、一边没有。这里收成一条路径：清会话 → 跳登录页 → 提示一次。
 */
export const LOGOUT_REDIRECT = '/login';
export const LOGOUT_NOTICE_KEY = 'message.common.logoutSuccess';

export interface LogoutDeps {
	clearSession: () => void;
	replaceRoute: (path: string) => Promise<unknown>;
	notify: (key: string) => void;
}

export async function runLogout(deps: LogoutDeps): Promise<void> {
	deps.clearSession();
	await deps.replaceRoute(LOGOUT_REDIRECT);
	deps.notify(LOGOUT_NOTICE_KEY);
}
