import { nextTick } from 'vue';

/**
 * 表单提交失败后把用户带到第一个出错字段。
 *
 * el-form 的 scrollToField 只在字段 prop 与 rules 都对得上时才有效，
 * 字段被字段权限隐藏或列被 remove 掉时会静默不动，所以拿不到时退回到表单顶部——
 * 让用户至少看见"这里出错了"，而不是点了保存毫无反应。
 */
interface ScrollableForm {
  scrollToField?: (field: string) => void;
  $el?: { scrollIntoView?: (options?: ScrollIntoViewOptions) => void };
}

export async function focusFirstError(formRef: ScrollableForm | null | undefined, field?: string): Promise<void> {
  await nextTick();
  if (!formRef) return;

  if (field && typeof formRef.scrollToField === 'function') {
    formRef.scrollToField(field);
    return;
  }
  formRef.$el?.scrollIntoView?.({ block: 'start', behavior: 'smooth' });
}
