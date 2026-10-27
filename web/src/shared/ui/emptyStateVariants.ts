/**
 * 空态四分：真没数据 / 筛选无结果 / 加载失败 / 无权限。
 * 四种情形给不同的标题和动作，用户才知道下一步该做什么。
 * 文案走 i18n；不含任何组件依赖，便于单测。
 */

export const EMPTY_STATE_VARIANTS = ['empty', 'filtered', 'error', 'forbidden'] as const;
export type EmptyStateVariant = (typeof EMPTY_STATE_VARIANTS)[number];

export interface EmptyStateContent {
  title: string;
  description: string;
  actionText: string;
}

export interface EmptyStateOverrides {
  title?: string;
  description?: string;
  actionText?: string;
}

type Translate = (key: string) => string;

const SPECS: Record<EmptyStateVariant, { title: string; description: string; actionText: string }> = {
  empty: { title: 'message.common.noData', description: '', actionText: 'message.common.create' },
  filtered: { title: 'message.common.noMatches', description: '', actionText: 'message.common.clearFilters' },
  error: { title: 'message.common.loadFailed', description: 'message.common.loadFailedHint', actionText: 'message.common.retry' },
  // 无权限时给重试只会让用户反复撞墙，动作留给页面自定（通常是"返回"）
  forbidden: { title: 'message.common.forbidden', description: 'message.common.forbiddenHint', actionText: '' },
};

function pick(value: string | undefined, fallback: string, translate?: Translate): string {
  if (value !== undefined) return value;
  if (!fallback) return '';
  return translate ? translate(fallback) : fallback;
}

export function resolveEmptyState(
  variant: EmptyStateVariant | string,
  translate?: Translate,
  overrides: EmptyStateOverrides = {},
): EmptyStateContent {
  const spec = SPECS[variant as EmptyStateVariant] ?? SPECS.empty;
  return {
    title: pick(overrides.title, spec.title, translate),
    description: pick(overrides.description, spec.description, translate),
    actionText: pick(overrides.actionText, spec.actionText, translate),
  };
}
