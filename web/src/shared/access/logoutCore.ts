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
	/** true = 真的离开了当前页；false = 被路由守卫拦下（例如编辑器有未保存改动） */
	replaceRoute: (path: string) => Promise<boolean>;
	notify: (key: string) => void;
	/** 软跳转被拦下时的兜底：整页跳到登录页 */
	hardRedirect?: (path: string) => void;
}

export async function runLogout(deps: LogoutDeps): Promise<void> {
	deps.clearSession();
	const left = await deps.replaceRoute(LOGOUT_REDIRECT);
	if (!left) {
		// 用户已经确认退出、token 也已删除，但路由守卫把页面留下了。
		// 停在原页面只会让下一次保存撞 401，并把未保存的内容晾在半空，
		// 所以这里改成整页跳转（顺带丢掉内存里的旧页面状态），且不再弹成功提示。
		deps.hardRedirect?.(LOGOUT_REDIRECT);
		return;
	}
	deps.notify(LOGOUT_NOTICE_KEY);
}
