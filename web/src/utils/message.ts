import { ElMessage, ElNotification, MessageOptions } from 'element-plus';
import { i18n } from '/@/i18n/index';

function resolveMessage(key: string, params?: Record<string, unknown>): string {
	if (!key) return '';
	// If the key contains Chinese characters, treat as raw string (backward compatibility)
	// Otherwise treat as translation key
	if (/[\u4e00-\u9fff]/.test(key)) return key;
	return params ? (i18n.global.t(key, params) as string) : (i18n.global.t(key) as string);
}

export function message(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	ElMessage({ message: resolveMessage(key, params), ...option });
}
export function successMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	ElMessage({ message: resolveMessage(key, params), type: 'success', ...option });
}
export function warningMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	ElMessage({ message: resolveMessage(key, params), type: 'warning', ...option });
}
export function errorMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	ElMessage({ message: resolveMessage(key, params), type: 'error', ...option });
}
export function infoMessage(key: string, params?: Record<string, unknown>, option?: MessageOptions) {
	ElMessage({ message: resolveMessage(key, params), type: 'info', ...option });
}

export function notification(key: string, params?: Record<string, unknown>) {
	ElNotification({ message: resolveMessage(key, params) });
}
export function successNotification(key: string, params?: Record<string, unknown>) {
	ElNotification({ message: resolveMessage(key, params), type: 'success' });
}
export function warningNotification(key: string, params?: Record<string, unknown>) {
	ElNotification({ message: resolveMessage(key, params), type: 'warning' });
}
export function errorNotification(key: string, params?: Record<string, unknown>) {
	ElNotification({ message: resolveMessage(key, params), type: 'error' });
}
export function infoNotification(key: string, params?: Record<string, unknown>) {
	ElNotification({ message: resolveMessage(key, params), type: 'info' });
}
