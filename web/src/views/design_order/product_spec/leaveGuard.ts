/**
 * 规格书编辑器要不要在离开前拦一道。
 *
 * 只读工单（已提交、无编辑权）拦了没意义——用户本来就改不动，也就没有会丢的东西；
 * 保存中离开同样不拦，改动已经在路上，再问一次只是添堵。
 */
export interface LeaveGuardState {
  isDirty: boolean;
  canEdit: boolean;
  isSaving?: boolean;
}

export function needsLeaveConfirm({ isDirty, canEdit, isSaving = false }: LeaveGuardState): boolean {
  return isDirty && canEdit && !isSaving;
}
