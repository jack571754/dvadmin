import type { Univer } from '@univerjs/presets';
import type { IRender } from '@univerjs/preset-sheets-core';
import { IRenderManagerService, ISheetSelectionRenderService } from '@univerjs/preset-sheets-core';

interface WorkbookFacade {
	getId: () => string;
}

interface SubscriptionLike {
	unsubscribe: () => void;
}

const RANGE_MOVE_INTERCEPTOR_PRIORITY = 1_000;

const disableSelectionAutoFill = (selectionService: ISheetSelectionRenderService) => {
	for (const control of selectionService.getSelectionControls()) {
		// Univer 0.25.1 does not expose a public setter for the selection autofill handle.
		Reflect.set(control, '_enableAutoFill', false);
		control.fillControl.hide();
	}
};

const blockSelectionMove = (selectionService: ISheetSelectionRenderService) => {
	const { RANGE_MOVE_PERMISSION_CHECK } = selectionService.interceptor.getInterceptPoints();
	return selectionService.interceptor.intercept(RANGE_MOVE_PERMISSION_CHECK, {
		id: 'product-spec.block-range-move',
		priority: RANGE_MOVE_INTERCEPTOR_PRIORITY,
		handler: () => false,
	});
};

export const bindSelectionInteractionGuard = (univer: Univer, workbook: WorkbookFacade) => {
	const renderManager = univer.__getInjector().get(IRenderManagerService);
	const workbookId = workbook.getId();
	let selectionSubscriptions: SubscriptionLike[] = [];
	let disposeRangeMoveBlocker: (() => boolean) | null = null;
	let isBound = false;

	const bindRender = (render: IRender) => {
		if (isBound || render.unitId !== workbookId) return;

		const selectionService = render.with(ISheetSelectionRenderService);
		const disableAutoFill = () => disableSelectionAutoFill(selectionService);
		disposeRangeMoveBlocker = blockSelectionMove(selectionService);
		selectionSubscriptions = [
			selectionService.selectionMoveStart$.subscribe(disableAutoFill),
			selectionService.selectionMoving$.subscribe(disableAutoFill),
			selectionService.selectionMoveEnd$.subscribe(disableAutoFill),
		];
		isBound = true;
		disableAutoFill();
	};

	const renderSubscription = renderManager.created$.subscribe(bindRender);
	const existingRender = renderManager.getRenderById(workbookId);
	if (existingRender) bindRender(existingRender);

	return () => {
		renderSubscription.unsubscribe();
		disposeRangeMoveBlocker?.();
		for (const subscription of selectionSubscriptions) {
			subscription.unsubscribe();
		}
	};
};
