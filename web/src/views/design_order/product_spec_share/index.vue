<template>
	<div class="share-page">
		<header class="share-header">
			<div>
				<h1>{{ title }}</h1>
				<p>{{ subtitle }}</p>
			</div>
			<el-tag v-if="statusText" type="info" effect="plain">{{ statusText }}</el-tag>
		</header>

		<el-alert v-if="errorMessage" :title="errorMessage" type="error" show-icon :closable="false" class="share-alert" />

		<main class="share-main">
			<div v-loading="loading" class="sheet-wrapper">
				<div id="share-univer-container" ref="univerContainerRef" class="sheet-container"></div>
			</div>
		</main>
	</div>
</template>

<script setup lang="ts" name="productSpecShare">
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing';
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/lib/locales/zh-CN';
import '@univerjs/sheets-ui/lib/facade';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/preset-sheets-core/lib/index.css';
import '@univerjs/preset-sheets-drawing/lib/index.css';
import { GetSharedSpec } from '/@/api/design_order/product_spec_share';
import { buildStylesDict } from '/@/views/design_order/product_spec/constants';
import { normalizeIconRefs, type IconRef } from '/@/views/design_order/product_spec/iconRefs';
import {
	createIconDrawingRenderer,
} from '/@/views/design_order/product_spec/iconDrawings';
import { cleanFootnotesAndDetails } from '/@/views/design_order/product_spec/snapshot';

const route = useRoute();
const univerContainerRef = ref<HTMLElement | null>(null);
const loading = ref(false);
const errorMessage = ref('');
const shareData = ref<any>(null);
let univerAPI: any = null;
let disposed = false;
let renderRevision = 0;
const initializationTimers = new Set<ReturnType<typeof setTimeout>>();
let workbook: any = null;
const iconDrawingRenderer = createIconDrawingRenderer();

const title = computed(() => shareData.value?.name || '规格提报分享');
const subtitle = computed(() => {
	const shop = shareData.value?.shop ? `店铺：${shareData.value.shop}` : '只读查看';
	return shareData.value?.shop ? `${shop} · 只读分享` : '只读分享';
});
const statusText = computed(() => shareData.value?.status === 'submitted' ? '已提交' : '草稿');

const loadShare = async () => {
	loading.value = true;
	errorMessage.value = '';
	try {
		const shareCode = String(route.params.shareCode || '');
		const result: any = await GetSharedSpec(shareCode);
		if (disposed) return;
		shareData.value = result.data;
		await renderWorkbook(
			syncSnapshotStyles(result.data?.snapshot),
			result.data?.templateSchema,
		);
	} catch (error: any) {
		errorMessage.value = error?.msg || error?.message || '分享内容加载失败';
	} finally {
		loading.value = false;
	}
};

const getIconRefsByCard = (): Record<number, IconRef[]> => Object.fromEntries(
	(shareData.value?.productIconRefs || []).map((item: any) => [
		Number(item.cardIndex),
		normalizeIconRefs(item.iconRefs),
	]),
);

// 图片直链随分享接口一起下发：分享页免登录，调不了需要鉴权的 resolve-image-urls。
const resolveIconDrawingUrls = async (fileIds: number[]) => {
	const urlByFileId = new Map<number, string>(
		(shareData.value?.iconImageUrls || []).map((item: any) => [
			Number(item.fileId ?? item.file_id),
			String(item.url || '').trim(),
		]),
	);
	return fileIds
		.map((fileId) => ({ fileId, url: urlByFileId.get(fileId) || '' }))
		.filter((item) => item.url);
};

const renderIconDrawings = async (schema: any): Promise<void> => {
	const iconField = (schema?.fields || []).find((field: any) => field.key === 'icon');
	if (!iconField) return;
	await iconDrawingRenderer.render(workbook, univerAPI, {
		rowsPerBlock: Number(schema.rowsPerBlock),
		columnsPerBlock: Number(schema.columnsPerBlock),
		iconRelativeRow: Number(iconField.row),
		iconRefsByCard: getIconRefsByCard(),
		resolveImageUrls: resolveIconDrawingUrls,
	});
};

const renderWorkbook = async (snapshot: any, schema: any) => {
	if (disposed || !univerContainerRef.value || !snapshot) return;
	if (!schema) throw new Error('分享数据缺少规格模板 Schema');
	disposeUniver();
	const result = createUniver({
		locale: LocaleType.ZH_CN,
		locales: { [LocaleType.ZH_CN]: UniverPresetSheetsCoreZhCN },
		presets: [
			UniverSheetsCorePreset({
				container: 'share-univer-container',
				header: false,
				footer: false,
				toolbar: false,
				contextMenu: false,
				sheets: {
					// 分享页只读，纯数字字符串触发的“强制字符串”提示对查看者无意义，直接禁用。
					disableForceStringAlert: true,
					disableForceStringMark: true,
				},
			}),
			UniverSheetsDrawingPreset(),
		],
	});
	result.univer.registerPlugin(UniverVue3AdapterPlugin);
	univerAPI = result.univerAPI;
	workbook = univerAPI.createWorkbook(snapshot);
	// Univer 的 addFloatDomToRange 需要 DOM 容器完成布局才能订阅 rect 变化，
	// 否则抛 "cannot subscribe to rect changes when container is not set"。
	// createWorkbook 返回时骨架未必就绪——先触发 resize 让容器量好尺寸，
	// 再延迟到骨架布局完成后渲染 Icon。绑 SheetSkeletonChanged 前先延迟，
	// 避免初始骨架事件在容器就绪前触发 Icon 渲染。
	window.dispatchEvent(new Event('resize'));
	const revision = renderRevision;
	const api = univerAPI;
	const isCurrent = () => !disposed && revision === renderRevision && univerAPI === api;
	const renderIcons = () => {
		if (isCurrent()) return renderIconDrawings(schema).catch((e) => console.warn('Icon 渲染重试失败:', e));
	};
	const defer = (callback: () => void, delay: number) => {
		const timer = setTimeout(() => {
			initializationTimers.delete(timer);
			if (isCurrent()) callback();
		}, delay);
		initializationTimers.add(timer);
	};
	defer(() => {
		void renderIcons();
		api.addEvent(api.Event.SheetSkeletonChanged, renderIcons);
	}, 300);
	defer(() => { void renderIcons(); }, 800);
	univerAPI.setPermissionDialogVisible?.(false);
	bindReadonlyGuard();
};

const syncSnapshotStyles = (snapshot: any) => {
	if (!snapshot?.sheets) return snapshot;
	stripDetailHintFromSnapshot(snapshot);
	return {
		...snapshot,
		styles: dropVerticalPadding({ ...buildStylesDict(), ...(snapshot.styles || {}) }),
	};
};

// Univer 的 fitTextSize 把 pd.t + pd.b 一起算进 actualHeight 后按居中求 offsetTop，
// 却只把结果当上边距用（下边距没留），于是 vt:2 的单元格里文字和光标会整体上偏 pd.t。
// 行高本来就是保存时按含内边距算好的 ah，这里去掉纵向内边距不改变行高与外观，
// 只让编辑器的居中算式成立。横向内边距保留，那是左右缩进。
const dropVerticalPadding = (styles: Record<string, any>) => {
	for (const style of Object.values(styles)) {
		if (style?.pd) style.pd = { ...style.pd, t: 0, b: 0 };
	}
	return styles;
};

// 旧快照的备注单元格可能带自动追加的“*具体说明见产品详情页”提示行，
// 分享展示时一并剔除，与编辑器生成逻辑保持一致。
const stripDetailHintFromSnapshot = (snapshot: any) => {
	for (const sheetData of Object.values(snapshot.sheets || {})) {
		const cellData = (sheetData as any)?.cellData;
		if (!cellData) continue;
		for (const cols of Object.values(cellData)) {
			for (const cell of Object.values(cols as Record<string, any>)) {
				if (cell && typeof cell.v === 'string' && cell.v.includes('具体说明见产品详情页')) {
					const cleaned = cleanFootnotesAndDetails(cell.v);
					cell.v = cleaned;
				}
			}
		}
	}
};

// 分享页要能进单元格编辑器里选中部分文字复制，所以不能用 setEditable(false)（那会连编辑器
// 一起禁掉）。改在命令层拦：Univer 的写入一律先走一条 CommandType.COMMAND，对应的 MUTATION
// 由它派生，掐掉 COMMAND 就写不进快照。OPERATION（选区/滚动/唤起编辑器）与 Icon 浮层不经过
// COMMAND，实测加载全程只有 doc.command-replace-snapshot 一条，放行即可。
const READONLY_ALLOWED_COMMANDS = new Set([
	'doc.command-replace-snapshot', // 用单元格内容填充编辑器
	// 复制走这一条：DocCopyCommand / SheetCopyCommand 都注册成 id: CopyCommand.id，
	// "doc.command.copy" / "sheet.command.copy" 只是它们的 name，按 name 放行会漏掉。
	'univer.command.copy',
	'doc.command.select-all',
	'sheet.command.select-all',
	'sheet.command.expand-selection',
	'sheet.command.move-selection',
	'sheet.command.move-selection-enter-tab',
	'sheet.command.scroll-view',
	'sheet.command.scroll-view-reset',
	'sheet.command.scroll-to-cell',
	'sheet.command.set-scroll-relative',
	'sheet.command.change-zoom-ratio',
	'sheet.command.set-zoom-ratio',
]);

const bindReadonlyGuard = () => {
	univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event: any) => {
		// 0 === CommandType.COMMAND
		if (event.type === 0 && !READONLY_ALLOWED_COMMANDS.has(event.id)) {
			event.cancel = true;
		}
	});
};

const disposeUniver = () => {
	renderRevision++;
	initializationTimers.forEach(timer => clearTimeout(timer));
	initializationTimers.clear();
	if (!univerAPI) return;
	iconDrawingRenderer.dispose(workbook);
	try {
		univerAPI.dispose();
	} finally {
		univerAPI = null;
		workbook = null;
	}
};

onMounted(async () => {
	await nextTick();
	loadShare();
});

onBeforeUnmount(() => {
	disposed = true;
	disposeUniver();
});
</script>

<style scoped>
.share-page {
	width: 100vw;
	height: 100vh;
	display: flex;
	flex-direction: column;
	background: #f1f5f9;
}

.share-header {
	height: 72px;
	display: flex;
	align-items: center;
	justify-content: space-between;
	gap: 16px;
	padding: 0 24px;
	background: #ffffff;
	border-bottom: 1px solid #e2e8f0;
}

.share-header h1 {
	margin: 0;
	font-size: 18px;
	font-weight: 700;
	color: #0f172a;
}

.share-header p {
	margin: 6px 0 0;
	font-size: 13px;
	color: #64748b;
}

.share-alert {
	margin: 12px 24px 0;
}

.share-main {
	flex: 1;
	min-height: 0;
	padding: 12px;
}

.sheet-wrapper,
.sheet-container {
	width: 100%;
	height: 100%;
}

.sheet-wrapper {
	overflow: hidden;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	background: #ffffff;
}

:deep(.univer-formula-bar),
:deep(.univer-toolbar),
:deep(.univer-sheet-bar) {
	display: none !important;
}
</style>
