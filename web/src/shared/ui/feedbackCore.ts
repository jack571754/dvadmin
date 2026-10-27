/**
 * 反馈门面的决策层：不含任何 Element Plus 依赖，便于单测。
 * 真正的渲染在 ./feedback.ts 里，通过 emitter 注入。
 *
 * 硬规则（见 docs/frontend-refactor-design.md §5.2）：
 *   一个动作，只回一次声。同一动作只能出现在一档。
 */

export type FeedbackLevel = 'inline' | 'toast' | 'notification' | 'dialog';
export type FeedbackTone = 'success' | 'warning' | 'error' | 'info';

export interface FeedbackOptions {
  /** 默认 toast。inline 不由门面派发（属组件内状态） */
  level?: FeedbackLevel;
  tone?: FeedbackTone;
  /** i18n key；含中文时按原样输出（沿用 utils/message.ts 的兼容规则） */
  message?: string;
  /** 原样输出的文案，优先级高于 message */
  text?: string;
  params?: Record<string, unknown>;
  duration?: number;
  /** 只有显式拉长到数秒的 toast 才需要手动关闭，默认不带关闭按钮 */
  showClose?: boolean;
  /** 相同 dedupeKey 在窗口内只响一次，用于抑制并发请求刷屏 */
  dedupeKey?: string;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface FeedbackPayload {
  message: string;
  tone: FeedbackTone;
  duration: number;
  showClose?: boolean;
  title?: string;
  confirmText?: string;
  cancelText?: string;
}

export interface FeedbackEmitter {
  toast(payload: FeedbackPayload): void;
  notification(payload: FeedbackPayload): void;
  dialog(payload: FeedbackPayload): Promise<boolean>;
}

export type Translate = (key: string, params?: Record<string, unknown>) => string;

export const FEEDBACK_DURATIONS = { toast: 2000, notification: 4500 } as const;
/** 并发失败在 1.5s 内合并成一次，超过则认为是用户重新触发 */
export const FEEDBACK_DEDUPE_WINDOW_MS = 1500;

const CJK = /[一-鿿]/;

export interface FeedbackApi {
  feedback(options: FeedbackOptions): void | Promise<boolean>;
  confirmFeedback(options: FeedbackOptions): Promise<boolean>;
}

/**
 * 删除确认的唯一文案：标题带对象名（用户要知道删的是哪一个），
 * 按钮是「删除/取消」而不是通用的「确定/取消」，warning 档。
 */
export function deleteConfirmOptions(target: string | number, translate: Translate): FeedbackOptions {
  const label = typeof target === 'number' ? '' : (target ?? '').trim();
  const title =
    typeof target === 'number'
      ? translate('message.common.deleteCountTitle', { count: target })
      : label
        ? translate('message.common.deleteTitle', { name: label })
        : translate('message.common.delete');
  return {
    level: 'dialog',
    tone: 'warning',
    title,
    message: translate('message.common.deleteConfirm'),
    confirmText: translate('message.common.delete'),
    cancelText: translate('message.common.cancel'),
  };
}

export function createFeedback(emit: FeedbackEmitter, translate: Translate, now: () => number = () => Date.now()): FeedbackApi {
  const lastSeen = new Map<string, number>();

  function resolveText(options: FeedbackOptions): string {
    if (options.text) return options.text;
    const key = options.message ?? '';
    if (!key) return '';
    if (CJK.test(key)) return key;
    return translate(key, options.params);
  }

  function suppressed(options: FeedbackOptions): boolean {
    if (!options.dedupeKey) return false;
    const at = now();
    const last = lastSeen.get(options.dedupeKey);
    lastSeen.set(options.dedupeKey, at);
    return last !== undefined && at - last < FEEDBACK_DEDUPE_WINDOW_MS;
  }

  function feedback(options: FeedbackOptions): void | Promise<boolean> {
    const level = options.level ?? 'toast';
    // inline 是组件内的状态渲染，不是一次派发
    if (level === 'inline') return;
    if (suppressed(options)) return;

    const payload: FeedbackPayload = {
      message: resolveText(options),
      tone: options.tone ?? 'info',
      duration: options.duration ?? (level === 'notification' ? FEEDBACK_DURATIONS.notification : FEEDBACK_DURATIONS.toast),
      showClose: options.showClose,
      title: options.title,
      confirmText: options.confirmText,
      cancelText: options.cancelText,
    };

    if (level === 'dialog') return emit.dialog(payload);
    if (level === 'notification') {
      emit.notification(payload);
      return;
    }
    emit.toast(payload);
  }

  function confirmFeedback(options: FeedbackOptions): Promise<boolean> {
    const result = feedback({ ...options, level: 'dialog' });
    return result instanceof Promise ? result : Promise.resolve(false);
  }

  return { feedback, confirmFeedback };
}
