import { MessageOptions } from 'element-plus';
import { feedback } from '/@/shared/ui/feedback';
import type { FeedbackTone } from '/@/shared/ui/feedback';

/**
 * 兼容层：历史调用点保留原签名，内部一律转调 shared/ui/feedback 的反馈门面。
 * 新代码请直接 import { feedback }；同一动作只回一次声，见 docs/frontend-refactor-design.md §5.2。
 */
function toast(key: string, tone: FeedbackTone, params?: Record<string, unknown>, option?: MessageOptions) {
	feedback({ level: 'toast', tone, message: key, params, duration: option?.duration as number | undefined });
}
function notify(key: string, tone: FeedbackTone, params?: Record<string, unknown>) {
	feedback({ level: 'notification', tone, message: key, params });
}

export function message(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	toast(key, 'info', params, option);
}
export function successMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	toast(key, 'success', params, option);
}
export function warningMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	toast(key, 'warning', params, option);
}
export function errorMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	toast(key, 'error', params, option);
}
export function infoMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	toast(key, 'info', params, option);
}

export function notification(key: string, params?: Record<string, unknown>) {
	notify(key, 'info', params);
}
export function successNotification(key: string, params?: Record<string, unknown>) {
	notify(key, 'success', params);
}
export function warningNotification(key: string, params?: Record<string, unknown>) {
	notify(key, 'warning', params);
}
export function errorNotification(key: string, params?: Record<string, unknown>) {
	notify(key, 'error', params);
}
export function infoNotification(key: string, params?: Record<string, unknown>) {
	notify(key, 'info', params);
}
