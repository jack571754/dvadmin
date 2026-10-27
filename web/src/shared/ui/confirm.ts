import { i18n } from '/@/i18n/index';
import { confirmFeedback } from './feedback';
import { deleteConfirmOptions } from './feedbackCore';

const translate = (key: string, params?: Record<string, unknown>) =>
  (params ? i18n.global.t(key, params) : i18n.global.t(key)) as string;

/**
 * 删除确认的统一入口。返回 true 表示用户确认了。
 * 传对象名（单个删除）或条数（批量删除），文案与按钮由门面统一。
 * 各页面不要再自己拼 ElMessageBox.confirm 的文案。
 */
export function confirmDelete(target: string | number): Promise<boolean> {
  return confirmFeedback(deleteConfirmOptions(target, translate));
}
