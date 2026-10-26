import type { IconRef } from './iconRefs';
import { getProductCoords } from './utils';
import IconSlotGrid from './components/IconSlotGrid.vue';

const DRAWING_ID_PREFIX = 'product-spec-icon:';
const COMPONENT_KEY = 'product-spec-icon-slot-grid';
const MAX_ICON_IMAGES = 5;
const ICON_ROW_MIN_HEIGHT = 140;

export interface IconImageUrlItem {
	fileId: number;
	url: string;
}

export interface IconSlotData {
	iconId: number;
	label: string;
	imageUrl: string;
}

export interface IconDrawingRenderOptions {
	rowsPerBlock: number;
	columnsPerBlock: number;
	iconRelativeRow: number;
	iconRefsByCard: Readonly<Record<number, readonly IconRef[]>>;
	resolveImageUrls: (fileIds: number[]) => Promise<readonly IconImageUrlItem[]>;
}

interface IconDrawingPanel {
	cardIndex: number;
	row: number;
	column: number;
	refs: readonly IconRef[];
}

const isPositiveInteger = (value: unknown): value is number => (
	Number.isInteger(value) && Number(value) > 0
);

const collectPanels = (options: IconDrawingRenderOptions): IconDrawingPanel[] => {
	const panels: IconDrawingPanel[] = [];
	const entries = Object.entries(options.iconRefsByCard)
		.map(([cardIndex, refs]) => [Number(cardIndex), refs] as const)
		.filter(([cardIndex]) => isPositiveInteger(cardIndex + 1))
		.sort(([left], [right]) => left - right);
	for (const [cardIndex, refs] of entries) {
		const visibleRefs = refs.slice(0, MAX_ICON_IMAGES);
		if (!visibleRefs.length) continue;
		const coordinates = getProductCoords(
			cardIndex,
			options.rowsPerBlock,
			options.columnsPerBlock,
		);
		panels.push({
			cardIndex,
			row: coordinates.blockStartRow + options.iconRelativeRow,
			column: coordinates.blockCol,
			refs: visibleRefs,
		});
	}
	return panels;
};

const normalizeUrlItems = (items: readonly IconImageUrlItem[]): Map<number, string> => {
	const urls = new Map<number, string>();
	for (const item of items) {
		const fileId = Number(item?.fileId);
		const url = String(item?.url || '').trim();
		if (isPositiveInteger(fileId) && url) urls.set(fileId, url);
	}
	return urls;
};

const getRuntimeImages = (worksheet: any): any[] => (
	worksheet?.getImages?.().filter((image: any) => (
		String(image.getId?.() || '').startsWith(DRAWING_ID_PREFIX)
	)) || []
);

const clearRuntimeImages = (workbook: any): void => {
	const worksheet = workbook?.getActiveSheet?.();
	const images = getRuntimeImages(worksheet);
	if (images.length) worksheet.deleteImages(images);
};

const clearRuntimeFloatDoms = (worksheet: any): void => {
	const floatDoms = worksheet?.getAllFloatDoms?.() || [];
	for (const floatDom of floatDoms) {
		if (String(floatDom?.id || '').startsWith(DRAWING_ID_PREFIX)) {
			worksheet.removeFloatDom(floatDom.id);
		}
	}
};

const ensureIconRowHeight = (worksheet: any, panel: IconDrawingPanel): void => {
	const currentHeight = Number(worksheet.getRowHeight(panel.row)) || 0;
	if (currentHeight < ICON_ROW_MIN_HEIGHT) {
		worksheet.setRowHeight(panel.row, ICON_ROW_MIN_HEIGHT);
	}
};

const readPanelLabels = (worksheet: any, panel: IconDrawingPanel): string[] => {
	const cellData = worksheet.getRange(panel.row, panel.column, 1, 1).getCellData() || {};
	return String(cellData.v || '')
		.replace(/^\n+/, '')
		.split(/\r?\n/)
		.map((label) => label.trim())
		.filter(Boolean);
};

export const buildIconSlots = (
	refs: readonly IconRef[],
	labels: readonly string[],
	urls: ReadonlyMap<number, string>,
): IconSlotData[] => refs.slice(0, MAX_ICON_IMAGES).map((ref, index) => ({
	iconId: ref.id,
	label: String(labels[index] || ref.shortName || '').trim(),
	imageUrl: isPositiveInteger(ref.fileId) ? urls.get(ref.fileId) || '' : '',
}));

const addPanel = (worksheet: any, panel: IconDrawingPanel, urls: Map<number, string>) => {
	ensureIconRowHeight(worksheet, panel);
	const range = worksheet.getRange(panel.row, panel.column, 1, 1);
	const result = worksheet.addFloatDomToRange(
		range,
		{
			componentKey: COMPONENT_KEY,
			allowTransform: false,
			eventPassThrough: true,
			data: { slots: buildIconSlots(panel.refs, readPanelLabels(worksheet, panel), urls) },
		},
		{},
		`${DRAWING_ID_PREFIX}${panel.cardIndex}`,
	);
	if (!result) {
		throw new Error(`Icon 固定槽位创建失败，商品序号：${panel.cardIndex + 1}`);
	}
	return result.dispose;
};

export const formatIconDrawingText = (text: string, refs: readonly IconRef[]): string => {
	if (!text || !refs.length) return text;
	return text.replace(/^\n+/, '');
};

export const normalizeIconImageUrlResponse = (response: any): IconImageUrlItem[] => (
	(response?.data?.items || []).map((item: any) => ({
		fileId: Number(item?.file_id ?? item?.fileId),
		url: String(item?.url || '').trim(),
	}))
);

export const createIconDrawingRenderer = () => {
	let generation = 0;
	let componentRegistration: any = null;
	let registeredUniverAPI: any = null;
	let panelDisposers: Array<() => void> = [];

	const registerComponent = (univerAPI: any): void => {
		if (registeredUniverAPI === univerAPI) return;
		componentRegistration?.dispose?.();
		componentRegistration = univerAPI.registerComponent(
			COMPONENT_KEY,
			IconSlotGrid,
			{ framework: 'vue3' },
		);
		registeredUniverAPI = univerAPI;
	};

	const clearPanels = (workbook: any): void => {
		for (const dispose of panelDisposers.splice(0)) dispose();
		const worksheet = workbook?.getActiveSheet?.();
		clearRuntimeFloatDoms(worksheet);
		clearRuntimeImages(workbook);
	};

	const clear = (workbook: any): void => {
		generation += 1;
		clearPanels(workbook);
	};

	const render = async (
		workbook: any,
		univerAPI: any,
		options: IconDrawingRenderOptions,
	): Promise<void> => {
		const currentGeneration = ++generation;
		clearPanels(workbook);
		const worksheet = workbook?.getActiveSheet?.();
		if (!worksheet) return;
		registerComponent(univerAPI);
		const panels = collectPanels(options);
		if (!panels.length) return;
		const fileIds = [...new Set(panels.flatMap((panel) => (
			panel.refs
				.map((ref) => ref.fileId)
				.filter(isPositiveInteger)
		)))];
		const urlItems = fileIds.length ? await options.resolveImageUrls(fileIds) : [];
		const urls = normalizeUrlItems(urlItems);
		if (currentGeneration !== generation) return;
		const missingFileIds = fileIds.filter((fileId) => !urls.has(fileId));
		if (missingFileIds.length) {
			console.warn('部分 Icon 图片文件无法解析:', missingFileIds);
		}
		panelDisposers = panels.map((panel) => addPanel(worksheet, panel, urls));
	};

	const dispose = (workbook: any): void => {
		clear(workbook);
		componentRegistration?.dispose?.();
		componentRegistration = null;
		registeredUniverAPI = null;
	};

	return { clear, dispose, render };
};
