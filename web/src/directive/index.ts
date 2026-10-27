import type { App } from 'vue';
import { authDirective } from '/@/directive/authDirective';

/**
 * 导出指令方法：v-xxx
 * @methods authDirective 用户权限指令，用法：v-auth
 *
 * 曾经的 v-waves（按钮波纹）、v-drag（弹窗拖动）、v-resizeOb（尺寸监听）全站零使用，
 * 已随 waves.scss 一并删除；需要时从 git 历史取回。
 */
export function directive(app: App) {
	// 用户权限指令
	authDirective(app);
}
