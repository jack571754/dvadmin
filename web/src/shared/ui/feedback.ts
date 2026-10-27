import { ElMessage, ElMessageBox, ElNotification } from 'element-plus';
import { i18n } from '/@/i18n/index';
import { createFeedback, type FeedbackEmitter, type FeedbackPayload } from './feedbackCore';

// vue-i18n 的模板字面量重载会递归推不出来，运行时只需要字符串键
const translate = (key: string, params?: Record<string, unknown>) =>
  (params ? i18n.global.t(key, params) : i18n.global.t(key)) as string;

function elementOptions(payload: FeedbackPayload) {
  return {
    message: payload.message,
    type: payload.tone,
    duration: payload.duration,
    ...(payload.title ? { title: payload.title } : {}),
  };
}

const emitter: FeedbackEmitter = {
  // grouping 让连续相同的 toast 合并，避免连点产生一摞
  toast: payload => ElMessage({ ...elementOptions(payload), grouping: true }),
  notification: payload => ElNotification(elementOptions(payload)),
  dialog: async payload => {
    try {
      await ElMessageBox.confirm(payload.message, payload.title ?? translate('message.common.prompt'), {
        type: payload.tone,
        confirmButtonText: payload.confirmText ?? translate('message.common.ok'),
        cancelButtonText: payload.cancelText ?? translate('message.common.cancel'),
      });
      return true;
    } catch {
      // 取消、关闭、按 Esc 都走 reject
      return false;
    }
  },
};

export const { feedback, confirmFeedback } = createFeedback(emitter, translate);
export type { FeedbackOptions, FeedbackLevel, FeedbackTone } from './feedbackCore';
