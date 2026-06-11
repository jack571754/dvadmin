<template>
	<fs-page>
		<div class="product-spec-wrapper">
			<!-- 控制面板 -->
			<div class="control-panel" ref="controlPanelRef">
				<div class="logo-area">
					<el-button 
						size="small" 
						circle
						:icon="ArrowLeft" 
						@click="goBackToList" 
						title="返回历史列表"
						style="margin-right: 4px;"
					/>
					<div class="logo-icon">📊</div>
					<div class="title-container">
						<h1 ref="logoTextRef" v-if="!submissionId">美妆活动提报配置</h1>
						<h1 ref="logoTextRef" v-else>{{ submissionName || '未命名提报' }}</h1>
						<p v-if="submissionShop">店铺：{{ submissionShop }}</p>
						<p v-else>飞书/Airtable风格高协同对比矩阵</p>
					</div>
					<!-- 状态标识 -->
					<div class="status-badge-container" v-if="submissionId">
						<el-tag :type="submissionStatus === 'submitted' ? 'success' : 'info'" size="small" effect="dark">
							{{ submissionStatus === 'submitted' ? '已提交' : '草稿' }}
						</el-tag>
					</div>
				</div>
				<div class="actions-area">
					<!-- 元信息编辑区域 (仅在未提交状态下展示) -->
					<div class="meta-inputs-area" v-if="submissionStatus !== 'submitted'">
						<el-input
							v-model="submissionName"
							placeholder="请输入提报名称"
							size="small"
							style="width: 160px"
							clearable
						/>
						<el-input
							v-model="submissionShop"
							placeholder="请输入提报店铺"
							size="small"
							style="width: 130px"
							clearable
						/>
					</div>
					<div class="search-area">
						<el-input
							v-model="searchQuery"
							placeholder="搜索定位商品..."
							size="small"
							style="width: 140px"
							clearable
							@input="handleSearchColumn"
						>
							<template #prefix>
								<el-icon><Search /></el-icon>
							</template>
						</el-input>
					</div>
					<div class="theme-selector">
						<el-icon class="theme-icon"><Brush /></el-icon>
						<el-select v-model="currentTheme" size="small" style="width: 155px" @change="applyThemeToSheet">
							<el-option value="proya" label="企业经典 (飞书蓝)">
								<div class="theme-option-item">
									<span class="color-badge badge-proya"></span>
									<span>企业经典 (飞书蓝)</span>
								</div>
							</el-option>
							<el-option value="collgene" label="医研科技 (极光蓝)">
								<div class="theme-option-item">
									<span class="color-badge badge-collgene"></span>
									<span>医研科技 (极光蓝)</span>
								</div>
							</el-option>
							<el-option value="luxury" label="尊奢金致 (香槟金)">
								<div class="theme-option-item">
									<span class="color-badge badge-luxury"></span>
									<span>尊奢金致 (香槟金)</span>
								</div>
							</el-option>
						</el-select>
					</div>
					<el-button v-if="submissionStatus !== 'submitted'" type="primary" size="small" :icon="Plus" @click="appendNewProductColumn">添加商品列</el-button>
					<el-button v-if="submissionStatus !== 'submitted'" type="success" size="small" :icon="FolderChecked" @click="saveWorkbookData('draft')">保存草稿</el-button>
					<el-button v-if="submissionStatus === 'draft' && submissionId" type="danger" size="small" :icon="Checked" @click="submitWorkbookData正式">正式提交</el-button>
					<el-button type="warning" size="small" :icon="Download" @click="exportToCSV">导出数据</el-button>
				</div>
			</div>

			<!-- Univer 表格渲染区域 -->
			<div class="univer-area">
				<div class="univer-wrapper">
					<div id="univer-container" ref="univerContainerRef" style="width: 100%; height: 100%"></div>
				</div>
			</div>

			<!-- 赠品配置弹窗 -->
			<GiftConfigModal
				v-model="giftModalVisible"
				:gifts="giftList"
				:productNames="productNames"
				@confirm="confirmGiftModal"
			/>

			<!-- 选择提及产品的对话弹窗 -->
			<ProductSelectDialog
				v-model="productDialogVisible"
				:options="selectableProducts"
				@select="selectProductFromDialog"
				@close="closeProductDialog"
			/>
		</div>
	</fs-page>
</template>

<script lang="ts" setup name="productSpec">
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { request } from '/@/utils/service';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, FolderChecked, Download, Brush, Search, ArrowLeft, Checked } from '@element-plus/icons-vue';
import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import '@univerjs/sheets-data-validation/lib/facade';
import '@univerjs/sheets-ui/lib/facade';
import '@univerjs/preset-sheets-data-validation/lib/index.css';
import '@univerjs/preset-sheets-core/lib/index.css';

// 导入外部定义
import { GiftInfo, DBProductItem, SelectableProduct } from './types';
import { PRODUCT_DATABASE, PRODUCT_KEYWORDS, LABEL_DATA, buildStylesDict } from './constants';
import { getCleanNickname, getProductCoords, getCursorOffsetInContainer, setCaretPosition, escapeRegExp } from './utils';

// 导入子组件
import GiftConfigModal from './components/GiftConfigModal.vue';
import ProductSelectDialog from './components/ProductSelectDialog.vue';
import { GetPermission } from '/@/api/design_order/product_spec';

const permissionData = ref<Record<string, { is_query: boolean; is_create: boolean; is_update: boolean }>>({});

const ROW_TO_FIELD_MAP: Record<number, string> = {
	1: 'brand',
	2: 'nickname',
	3: 'full_name',
	4: 'specification',
	5: 'efficacy',
	6: 'gifts',
	7: 'threshold_a',
	8: 'member_gift',
	9: 'member_value',
	10: 'selling_point',
	11: 'price',
	12: 'start_date',
	13: 'remarks'
};

const getPermittedVal = (rowNum: number, defaultVal: string) => {
	const fieldName = ROW_TO_FIELD_MAP[rowNum];
	if (fieldName) {
		const perm = permissionData.value[fieldName];
		if (perm && !perm.is_query) {
			return '***';
		}
	}
	return defaultVal;
};

const migrateSnapshotTo15Rows = (snapshot: any) => {
	if (!snapshot || !snapshot.sheets) return snapshot;
	for (const sheetId of Object.keys(snapshot.sheets)) {
		const sheetData = snapshot.sheets[sheetId];
		if (!sheetData.cellData) continue;
		const cellData = sheetData.cellData;
		const rowKeys = Object.keys(cellData).map(Number);
		if (rowKeys.length === 0) continue;

		// Check format: in old 16-row layout, row 13 is "活动结束日期". In 15-row layout, it is "运营备注说明".
		const row13Col0 = cellData[13]?.[0];
		const is16RowFormat = row13Col0 && (row13Col0.v === '活动结束日期' || row13Col0.v === '活动结束时间');

		if (!is16RowFormat) {
			continue;
		}

		console.log('Detecting old 16-row snapshot format. Migrating to 15-row format...');
		const newCellData: Record<number, Record<number, any>> = {};
		const maxRow = Math.max(...rowKeys);
		const totalBlocks = Math.ceil((maxRow + 1) / 16);

		for (let b = 0; b < totalBlocks; b++) {
			const oldBlockStart = b * 16;
			const newBlockStart = b * 15;

			// Row 0: Header
			if (cellData[oldBlockStart]) {
				newCellData[newBlockStart] = cellData[oldBlockStart];
			}

			// Rows 1..11: Copy directly
			for (let r = 1; r <= 11; r++) {
				const oldR = oldBlockStart + r;
				const newR = newBlockStart + r;
				if (cellData[oldR]) {
					newCellData[newR] = cellData[oldR];
				}
			}

			// Row 12: Combine old row 12 (startDate) and row 13 (endDate)
			const oldRow12 = cellData[oldBlockStart + 12];
			const oldRow13 = cellData[oldBlockStart + 13];
			const newRow12: Record<number, any> = {};

			const labelCell = oldRow12?.[0];
			if (labelCell) {
				newRow12[0] = { ...labelCell, v: '活动时间范围' };
			}

			const colKeys = new Set([
				...Object.keys(oldRow12 || {}).map(Number),
				...Object.keys(oldRow13 || {}).map(Number)
			]);

			for (const col of colKeys) {
				if (col === 0) continue;
				const val12Obj = oldRow12?.[col];
				const val13Obj = oldRow13?.[col];

				const v12 = val12Obj && typeof val12Obj === 'object' ? val12Obj.v : val12Obj;
				const v13 = val13Obj && typeof val13Obj === 'object' ? val13Obj.v : val13Obj;

				let combinedValue = '';
				if (v12 && v13) {
					let d1 = String(v12).trim();
					let d2 = String(v13).trim();
					if (d1 && !d1.includes(':') && d1.length === 10) d1 += ' 00:00';
					if (d2 && !d2.includes(':') && d2.length === 10) d2 += ' 00:00';
					combinedValue = `${d1} ~ ${d2}`;
				} else if (v12) {
					let d1 = String(v12).trim();
					if (d1 && !d1.includes(':') && d1.length === 10) d1 += ' 00:00';
					combinedValue = d1;
				} else if (v13) {
					let d2 = String(v13).trim();
					if (d2 && !d2.includes(':') && d2.length === 10) d2 += ' 00:00';
					combinedValue = d2;
				}

				const style = val12Obj?.s || val13Obj?.s;
				newRow12[col] = { v: combinedValue, s: style };
			}
			newCellData[newBlockStart + 12] = newRow12;

			// Row 13: Remarks (copy from old row 14)
			const oldRow14 = cellData[oldBlockStart + 14];
			if (oldRow14) {
				newCellData[newBlockStart + 13] = oldRow14;
			}

			// Row 14: Divider (copy from old row 15)
			const oldRow15 = cellData[oldBlockStart + 15];
			if (oldRow15) {
				newCellData[newBlockStart + 14] = oldRow15;
			}
		}

		sheetData.cellData = newCellData;

		if (sheetData.rowData) {
			const newRowData: Record<number, any> = {};
			for (let i = 0; i < totalBlocks * 15; i++) {
				const relRow = i % 15;
				if (relRow === 14) {
					newRowData[i] = { h: 16 };
				} else {
					newRowData[i] = { h: relRow === 0 ? 42 : 36, ia: 1, ah: relRow === 0 ? 42 : 36 };
				}
			}
			sheetData.rowData = newRowData;
		}
	}
	return snapshot;
};

const filterSnapshotData = (snapshot: any) => {
	if (!snapshot || !snapshot.sheets) return snapshot;
	for (const sheetId of Object.keys(snapshot.sheets)) {
		const sheetData = snapshot.sheets[sheetId];
		if (!sheetData.cellData) continue;
		const cellData = sheetData.cellData;
		for (const rowStr of Object.keys(cellData)) {
			const row = Number(rowStr);
			const relativeRow = row % 15;
			const fieldName = ROW_TO_FIELD_MAP[relativeRow];
			if (fieldName) {
				const perm = permissionData.value[fieldName];
				if (perm && !perm.is_query) {
					for (const colStr of Object.keys(cellData[row])) {
						const col = Number(colStr);
						if (col > 0) {
							if (cellData[row][col]) {
								cellData[row][col].v = '***';
							}
						}
					}
				}
			}
		}
	}
	return snapshot;
};


// ========== 产品规格数据库 ==========
const rawProductList = ref<DBProductItem[]>([]);
for (const prod of Object.values(PRODUCT_DATABASE)) {
	rawProductList.value.push({ ...prod });
}

const uniqueNicknames = computed(() => {
	const set = new Set<string>();
	rawProductList.value.forEach(item => {
		if (item.nickname) set.add(item.nickname);
	});
	return Array.from(set);
});

const productNames = computed(() => {
	return uniqueNicknames.value;
});

const getSpecsForNickname = (nickname: string): string[] => {
	const set = new Set<string>();
	rawProductList.value.forEach(item => {
		if (item.nickname === nickname && item.spec) {
			set.add(item.spec);
		}
	});
	return Array.from(set);
};

const getProductByNickAndSpec = (nickname: string, spec: string): DBProductItem | null => {
	let matched = rawProductList.value.find(item => item.nickname === nickname && item.spec === spec);
	if (matched) return matched;
	matched = rawProductList.value.find(item => item.nickname === nickname);
	return matched || null;
};

const getProductKeywords = (nickname: string): string[] => {
	return PRODUCT_KEYWORDS[nickname] || [nickname];
};

// Suffix structure for global tracking
const colSuffixMap = ref<Record<number, number>>({});

const recalculateSuffixesAndFootnotes = (activeSheet: any) => {
	interface ColConfig {
		index: number;
		blockCol: number;
		blockStartRow: number;
		cleanNick: string;
		spec: string;
		giftsText: string;
	}
	
	const cols: ColConfig[] = [];
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);
		
		const nicknameVal = activeSheet.getRange(blockStartRow + 2, blockCol, 1, 1).getValue() as any;
		const nickname = nicknameVal && typeof nicknameVal === 'object' ? nicknameVal.v : nicknameVal;
		const cleanNick = getCleanNickname(nickname, uniqueNicknames.value);
		if (!cleanNick) continue;

		const specVal = activeSheet.getRange(blockStartRow + 4, blockCol, 1, 1).getValue() as any;
		const spec = specVal && typeof specVal === 'object' ? specVal.v : specVal || '';

		const giftsVal = activeSheet.getRange(blockStartRow + 6, blockCol, 1, 1).getValue() as any;
		const giftsText = giftsVal && typeof giftsVal === 'object' ? giftsVal.v : giftsVal || '';
		
		cols.push({
			index: idx,
			blockCol,
			blockStartRow,
			cleanNick,
			spec,
			giftsText
		});
	}

	const productGiftsMap: Record<string, string[]> = {};
	const colSuffixMapLocal: Record<number, number> = {};

	for (const config of cols) {
		if (!productGiftsMap[config.cleanNick]) {
			productGiftsMap[config.cleanNick] = [];
		}
		const giftsList = productGiftsMap[config.cleanNick];
		const normGifts = config.giftsText.replace('🎁 双击配置赠品', '').trim();
		
		let suffixIndex = giftsList.indexOf(normGifts);
		if (suffixIndex === -1) {
			giftsList.push(normGifts);
			suffixIndex = giftsList.length - 1;
		}
		
		colSuffixMapLocal[config.blockCol] = suffixIndex + 1;
		colSuffixMap.value[config.blockCol] = suffixIndex + 1;
	}

	const theme = currentTheme.value;
	for (const config of cols) {
		const suffix = colSuffixMapLocal[config.blockCol] || 1;
		const formattedNickname = config.spec ? `${config.cleanNick}[${suffix}]${config.spec}` : `${config.cleanNick}[${suffix}]`;
		
		activeSheet.getRange(config.blockStartRow + 2, config.blockCol, 1, 1).setValue({ 
			v: formattedNickname, 
			s: `editableCenterStyle_${theme}` 
		});
		applyNicknameDropdown(config.blockStartRow + 2, config.blockCol, formattedNickname);
		
		const specs = getSpecsForNickname(config.cleanNick);
		applySpecDropdown(config.blockStartRow + 4, config.blockCol, specs);
	}

	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	const explainedNicknames = new Set<string>();

	for (const config of cols) {
		const prod = getProductByNickAndSpec(config.cleanNick, config.spec);
		if (!prod) continue;

		const giftsText = getValue(config.blockStartRow + 6, config.blockCol);
		const thresholdText = getValue(config.blockStartRow + 7, config.blockCol);
		const memberGiftText = getValue(config.blockStartRow + 8, config.blockCol);

		const referencedNicknames: string[] = [config.cleanNick];

		const checkAndAddMentions = (text: string) => {
			if (!text) return;
			uniqueNicknames.value.forEach(nick => {
				if (referencedNicknames.includes(nick)) return;
				const regexSuffix = new RegExp(escapeRegExp(nick) + '\\[\\d+\\]', 'g');
				if (regexSuffix.test(text)) {
					referencedNicknames.push(nick);
					return;
				}
				const keywords = getProductKeywords(nick);
				const matches = keywords.some(kw => text.includes(kw));
				if (matches) {
					referencedNicknames.push(nick);
				}
			});
		};

		checkAndAddMentions(String(giftsText));
		checkAndAddMentions(String(thresholdText));
		checkAndAddMentions(String(memberGiftText));

		let baseRemarks = prod.remarks || '';
		if (!baseRemarks.includes('*具体说明见产品详情页') && !baseRemarks.endsWith('*具体说明见产品详情页')) {
			if (baseRemarks) {
				baseRemarks += '\n*具体说明见产品详情页';
			} else {
				baseRemarks = '*具体说明见产品详情页';
			}
		}

		let footnoteIndex = 1;
		referencedNicknames.forEach((nick) => {
			if (explainedNicknames.has(nick)) return;
			explainedNicknames.add(nick);

			let fullName = '';
			const matchedItem = rawProductList.value.find(item => item.nickname === nick);
			if (matchedItem) {
				fullName = matchedItem.fullName;
			}
			if (fullName) {
				const line = `[${footnoteIndex}]${nick}为产品昵称，产品备案全称为${fullName}`;
				baseRemarks += `\n${line}`;
				footnoteIndex++;
			}
		});

		activeSheet.getRange(config.blockStartRow + 13, config.blockCol, 1, 1).setValue({ 
			v: baseRemarks, 
			s: `editableCenterStyle_${theme}` 
		});
		
		try { activeSheet.autoResizeRows(config.blockStartRow, 15); } catch (e) { /* ignore */ }
	}
};

const getSelectableProducts = (): SelectableProduct[] => {
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet) {
		// 回退逻辑：如果工作簿尚未加载，仅基于产品库 rawProductList 渲染基础选项
		const options: SelectableProduct[] = [];
		rawProductList.value.forEach(item => {
			const nick = item.nickname || item.fullName;
			if (!nick) return;
			if (!options.some(opt => opt.cleanName === nick)) {
				options.push({
					name: `${nick}[1]`,
					cleanName: nick,
					suffix: '1',
					desc: '(新商品提报)',
					brand: item.brand || '',
					fullName: item.fullName || ''
				});
			}
		});
		return options;
	}
	
	const options: SelectableProduct[] = [];
	
	const colsConfig: { cleanNick: string; suffix: number; giftsText: string; brand: string; fullName: string }[] = [];
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);
		const nicknameVal = activeSheet.getRange(blockStartRow + 2, blockCol, 1, 1).getValue() as any;
		const nickname = nicknameVal && typeof nicknameVal === 'object' ? nicknameVal.v : nicknameVal;
		const cleanNick = getCleanNickname(nickname, uniqueNicknames.value);
		if (!cleanNick) continue;

		const brandVal = activeSheet.getRange(blockStartRow + 1, blockCol, 1, 1).getValue() as any;
		const brand = brandVal && typeof brandVal === 'object' ? brandVal.v : brandVal || '';

		const fullNameVal = activeSheet.getRange(blockStartRow + 3, blockCol, 1, 1).getValue() as any;
		const fullName = fullNameVal && typeof fullNameVal === 'object' ? fullNameVal.v : fullNameVal || '';

		const giftsVal = activeSheet.getRange(blockStartRow + 6, blockCol, 1, 1).getValue() as any;
		const giftsText = giftsVal && typeof giftsVal === 'object' ? giftsVal.v : giftsVal || '';
		
		const suffix = colSuffixMap.value[blockCol] || 1;
		
		if (!colsConfig.some(c => c.cleanNick === cleanNick && c.suffix === suffix)) {
			colsConfig.push({ cleanNick, suffix, giftsText, brand, fullName });
		}
	}
	
	colsConfig.forEach(c => {
		const giftsSummary = c.giftsText.replace('🎁 双击配置赠品', '').trim();
		options.push({
			name: `${c.cleanNick}[${c.suffix}]`,
			cleanName: c.cleanNick,
			suffix: String(c.suffix),
			desc: giftsSummary ? `标配赠品: ${giftsSummary}` : '(无标配赠品)',
			brand: c.brand,
			fullName: c.fullName
		});
	});
	
	rawProductList.value.forEach(item => {
		const nick = item.nickname || item.fullName;
		if (!nick) return;
		if (!options.some(opt => opt.cleanName === nick)) {
			options.push({
				name: `${nick}[1]`,
				cleanName: nick,
				suffix: '1',
				desc: '(新商品提报)',
				brand: item.brand || '',
				fullName: item.fullName || ''
			});
		}
	});
	
	return options;
};

const selectableProducts = computed(() => {
	return getSelectableProducts();
});

const selectProductFromDialog = (item: SelectableProduct) => {
	const target = activeEditor.value;
	if (!target) return;
	
	const textToInsert = `${item.name}`;
	logDebug(`Selecting product: ${item.name}`);
	
	const start = atSymbolIndex.value;
	const end = cursorIndexBeforeDialog.value;
	
	// 更新 cursorIndexBeforeDialog，以便 closeProductDialog 重新获得焦点时能正确设置光标位置
	const newCursorPos = start + textToInsert.length;
	cursorIndexBeforeDialog.value = newCursorPos;
	
	const newFullText = textBeforeAt.value + textToInsert + textAfterAt.value;
	
	// 判断 Univer 单元格编辑器是否依旧处于 DOM 树中并且可见
	const isEditorActive = target && target.isConnected && (target.offsetParent !== null || target.clientWidth > 0);
	
	if (isEditorActive) {
		logDebug('Editor is active, updating text directly and triggering input event');
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
			const input = target as HTMLInputElement;
			input.value = newFullText;
			input.focus();
			input.setSelectionRange(newCursorPos, newCursorPos);
			input.dispatchEvent(new Event('input', { bubbles: true }));
			input.dispatchEvent(new Event('change', { bubbles: true }));
		} else {
			const editableContainer = (target.hasAttribute('contenteditable')
				? target
				: target.closest('[contenteditable]') || target) as HTMLElement;

			editableContainer.focus();
			editableContainer.innerText = newFullText;
			setCaretPosition(editableContainer, newCursorPos, newCursorPos);
			editableContainer.dispatchEvent(new Event('input', { bubbles: true }));
			editableContainer.dispatchEvent(new Event('change', { bubbles: true }));
		}
	}
	
	// 无论编辑器是否活跃，都同步直接设置单元格值以确保回显成功，并重新计算脚注
	logDebug('Updating cell directly with new text');
	const activeSheet = workbook?.getActiveSheet();
	if (activeSheet && currentEditingCell.value) {
		const row = currentEditingCell.value.row;
		const col = currentEditingCell.value.col;
		const theme = currentTheme.value;
		
		activeSheet.getRange(row, col, 1, 1).setValue({ 
			v: newFullText, 
			s: `editableCenterStyle_${theme}` 
		});
		
		recalculateSuffixesAndFootnotes(activeSheet);
		window.dispatchEvent(new Event('resize'));
	}
	
	productDialogVisible.value = false;
};

const closeProductDialog = () => {
	productDialogVisible.value = false;
	
	const target = activeEditor.value;
	if (target) {
		if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
			const input = target as HTMLInputElement;
			input.focus();
			input.selectionStart = input.selectionEnd = cursorIndexBeforeDialog.value;
		} else {
			const editableContainer = (target.hasAttribute('contenteditable')
				? target
				: target.closest('[contenteditable]') || target) as HTMLElement;
			
			editableContainer.focus();
			setCaretPosition(editableContainer, cursorIndexBeforeDialog.value, cursorIndexBeforeDialog.value);
		}
	}
};

const handleEditorInput = (e: Event) => {
	const target = e.target as HTMLElement;
	if (!target) return;
	
	const isEditable = target.hasAttribute('contenteditable') || 
                       target.tagName === 'INPUT' || 
                       target.tagName === 'TEXTAREA' ||
                       target.closest('[contenteditable]') !== null ||
                       target.closest('.univer-cell-editor-container') !== null ||
                       target.classList.contains('univer-editor');
	
	logDebug(`Input/Key event on ${target.tagName}.${target.className}, isEditable=${isEditable}`);
	
	if (!isEditable) return;
	
	let text = '';
	let cursorOffset = 0;
	
	if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') {
		const input = target as HTMLInputElement;
		text = input.value;
		cursorOffset = input.selectionStart || 0;
	} else {
		const editableContainer = target.hasAttribute('contenteditable')
			? target
			: (target.closest('[contenteditable]') as HTMLElement || target);
			
		text = editableContainer.textContent || '';
		cursorOffset = getCursorOffsetInContainer(editableContainer);
	}
	
	logDebug(`Text parsed: "${text}", cursorOffset: ${cursorOffset}`);
	
	const textBeforeCursor = text.substring(0, cursorOffset);
	const lastAtIndex = textBeforeCursor.lastIndexOf('@');
	
	logDebug(`lastAtIndex of @: ${lastAtIndex}`);
	
	if (lastAtIndex !== -1) {
		const query = textBeforeCursor.substring(lastAtIndex + 1);
		logDebug(`query: "${query}"`);
		if (query === '') {
			const isUniverEditor = target.hasAttribute('contenteditable') ||
			                       target.closest('[contenteditable]') !== null ||
			                       target.closest('#univer-container') !== null ||
			                       target.closest('.univer-cell-editor-container') !== null;
			                       
			const isPromoRow = currentEditingCell.value && (currentEditingCell.value.row % 16 === 7);
			
			logDebug(`isUniverEditor=${isUniverEditor}, isPromoRow=${isPromoRow}, currentEditingCell=${JSON.stringify(currentEditingCell.value)}`);
			
			if (isUniverEditor && isPromoRow) {
				activeEditor.value = target;
				atSymbolIndex.value = lastAtIndex;
				cursorIndexBeforeDialog.value = cursorOffset;
				textBeforeAt.value = text.substring(0, lastAtIndex);
				textAfterAt.value = text.substring(cursorOffset);
				
				productDialogVisible.value = true;
				return;
			}
		}
	}
};

// ========== 组件状态 ==========
const route = useRoute();
const router = useRouter();

const submissionId = ref<number | null>(null);
const submissionName = ref('');
const submissionShop = ref('');
const submissionStatus = ref('draft');

const univerContainerRef = ref<HTMLElement | null>(null);
const controlPanelRef = ref<HTMLElement | null>(null);
const logoTextRef = ref<HTMLElement | null>(null);
const currentTheme = ref('proya');
const giftModalVisible = ref(false);
const giftList = ref<GiftInfo[]>([{ name: '', qty: '' }]);
const giftEditCol = ref(1);
const giftEditRow = ref(6);
let isHandlingEvent = false;

let univerAPI: any = null;
let workbook: any = null;
let sheet: any = null;
const formCount = ref(1);
const searchQuery = ref('');

// @ 产品选择器弹窗状态
const productDialogVisible = ref(false);

const atSymbolIndex = ref(0);
const cursorIndexBeforeDialog = ref(0);
const textBeforeAt = ref('');
const textAfterAt = ref('');

const activeEditor = ref<HTMLElement | null>(null);
const currentEditingCell = ref<{ row: number; col: number } | null>(null);
const logDebug = (msg: string) => {
	console.log(`[MentionDebug] ${msg}`);
};

// ========== 赠品解析 ==========
const parseGiftsFromText = (text: any): GiftInfo[] => {
	if (!text) return [];
	if (Array.isArray(text)) return text;
	if (typeof text === 'string') {
		const trimmed = text.trim();
		if (trimmed === '🎁 双击配置赠品' || trimmed === '双击配置赠品' || trimmed === '' || trimmed === '***') return [];
		if (trimmed.startsWith('[')) {
			try {
				return JSON.parse(trimmed);
			} catch (e) {
				/* ignore */
			}
		}
		const gifts: GiftInfo[] = [];
		const parts = trimmed.split('|');
		for (let part of parts) {
			part = part.trim();
			if (!part) continue;
			part = part.replace(/^🎁\s*/, '');
			const xIndex = part.lastIndexOf(' x ');
			if (xIndex !== -1) {
				gifts.push({ name: part.substring(0, xIndex).trim(), qty: part.substring(xIndex + 3).trim() });
			} else {
				const lastSpaceIndex = part.lastIndexOf(' ');
				if (lastSpaceIndex !== -1) {
					gifts.push({ name: part.substring(0, lastSpaceIndex).trim(), qty: part.substring(lastSpaceIndex + 1).trim() });
				} else {
					gifts.push({ name: part, qty: '1' });
				}
			}
		}
		return gifts;
	}
	return [];
};

// ========== 初始化 Univer ==========
const initUniver = (savedSnapshot?: any) => {
	if (!univerContainerRef.value) return;

	const stylesDict = buildStylesDict();
	const initialProduct = getProductByNickAndSpec('可丽金胶卷精华水', '150ml') || {
		nickname: '可丽金胶卷精华水',
		brand: '',
		fullName: '',
		efficacy: '',
		spec: '',
		gifts: [],
		thresholdA: '',
		valueA: '',
		thresholdB: '',
		valueB: '',
		memberGift: '',
		memberValue: '',
		sellingPoint: '',
		price: '',
		startDate: '',
		endDate: '',
		remarks: '',
	};

	const initialCellData: Record<number, Record<number, any>> = {};
	initialCellData[0] = {
		0: { v: '配置字段', s: 'headerStyle_proya' },
		1: { v: '商品提报 1', s: 'headerStyle_proya' },
	};
	const rowStyleMap: Record<number, { v: string; s: string }> = {
		1: { v: getPermittedVal(1, initialProduct.brand), s: 'contentCenterStyle_proya' },
		2: { v: getPermittedVal(2, initialProduct.nickname), s: 'editableCenterStyle_proya' },
		3: { v: getPermittedVal(3, initialProduct.fullName), s: 'contentLeftStyle_proya' },
		4: { v: getPermittedVal(4, initialProduct.spec), s: 'contentCenterStyle_proya' },
		5: { v: getPermittedVal(5, initialProduct.efficacy), s: 'contentLeftStyle_proya' },
		6: { v: getPermittedVal(6, initialProduct.gifts.map((g) => `🎁 ${g.name} x ${g.qty}`).join(' | ') || '🎁 双击配置赠品'), s: 'editableCenterStyle_proya' },
		7: { v: getPermittedVal(7, (initialProduct.thresholdA || initialProduct.thresholdB) ? `A档: ${initialProduct.thresholdA} (${initialProduct.valueA})；B档: ${initialProduct.thresholdB} (${initialProduct.valueB})` : ''), s: 'editableCenterStyle_proya' },
		8: { v: getPermittedVal(8, initialProduct.memberGift), s: 'editableCenterStyle_proya' },
		9: { v: getPermittedVal(9, initialProduct.memberValue), s: 'editableCenterStyle_proya' },
		10: { v: getPermittedVal(10, initialProduct.sellingPoint), s: 'contentLeftStyle_shaded_proya' },
		11: { v: getPermittedVal(11, initialProduct.price), s: 'editableCenterStyle_proya' },
		12: { v: getPermittedVal(12, initialProduct.startDate && initialProduct.endDate ? `${initialProduct.startDate} 00:00 ~ ${initialProduct.endDate} 00:00` : ''), s: 'editableCenterStyle_proya' },
		13: { v: getPermittedVal(13, initialProduct.remarks), s: 'editableCenterStyle_proya' },
	};
	for (const [row, data] of Object.entries(rowStyleMap)) {
		initialCellData[Number(row)] = {
			0: { v: LABEL_DATA[Number(row)], s: 'labelStyle_proya' },
			1: data,
		};
	}

	const result = createUniver({
		locale: LocaleType.ZH_CN,
		locales: {
			[LocaleType.ZH_CN]: UniverPresetSheetsCoreZhCN,
		},
		presets: [
			UniverSheetsCorePreset({
				container: 'univer-container',
				header: false,
				footer: false,
				toolbar: false,
			}),
			UniverSheetsDataValidationPreset({
				showEditOnDropdown: false,
				showSearchOnDropdown: true,
			}),
		],
	});

	univerAPI = result.univerAPI;

	if (savedSnapshot) {
		workbook = univerAPI.createWorkbook(savedSnapshot);
	} else {
		workbook = univerAPI.createWorkbook({
			id: 'workbook-product-spec',
			name: '可丽金产品规格书',
			styles: stylesDict,
			sheets: {
				'sheet-product-spec': {
					id: 'sheet-product-spec',
					name: '规格书模版',
					rowCount: 100,
					columnCount: 50,
					showGridlines: 0 as any,
					rowHeader: { width: 46, hidden: 1 },
					columnHeader: { height: 20, hidden: 1 },
					columnData: {
						0: { w: 240 },
						1: { w: 420 },
						2: { w: 420 },
						3: { w: 420 },
						4: { w: 420 },
						5: { w: 420 },
						6: { w: 420 },
						7: { w: 420 },
					},
					rowData: Object.fromEntries(Array.from({ length: 200 }, (_, i) => {
						const relRow = i % 15;
						if (relRow === 14) {
							return [i, { h: 16 }];
						}
						return [i, { h: relRow === 0 ? 42 : 36, ia: 1, ah: relRow === 0 ? 42 : 36 }];
					})),
					cellData: initialCellData,
				},
			},
		});
	}

	sheet = workbook.getActiveSheet();

	const totalBlocks = Math.ceil(formCount.value / 6);
	for (let b = 0; b < totalBlocks; b++) {
		const blockStartRow = b * 15;
		const maxColInBlock = (b === totalBlocks - 1) ? ((formCount.value - 1) % 6) + 1 : 6;
		for (let col = 1; col <= maxColInBlock; col++) {
			const cellVal = sheet.getRange(blockStartRow + 2, col, 1, 1).getValue() as any;
			const nickname = cellVal && typeof cellVal === 'object' ? cellVal.v : cellVal;
			
			applyNicknameDropdown(blockStartRow + 2, col, nickname);
			
			const cleanNick = getCleanNickname(nickname, uniqueNicknames.value);
			if (cleanNick) {
				const specs = getSpecsForNickname(cleanNick);
				applySpecDropdown(blockStartRow + 4, col, specs);
			}
		}
	}

	try {
		recalculateSuffixesAndFootnotes(sheet);
	} catch (err) {
		console.warn('初始化/加载后缀与脚注失败:', err);
	}

	const runAutoResize = () => {
		try {
			const totalBlocks = Math.ceil(formCount.value / 6);
			sheet.autoResizeRows(0, totalBlocks * 15);
			window.dispatchEvent(new Event('resize'));
		} catch (err) {
			console.warn('初始化自动行高计算失败:', err);
		}
	};

	setTimeout(runAutoResize, 300);
	setTimeout(runAutoResize, 800);
	setTimeout(runAutoResize, 1500);

	if (document.fonts && document.fonts.ready) {
		document.fonts.ready.then(() => {
			setTimeout(runAutoResize, 100);
		});
	}

	univerAPI.addEvent(univerAPI.Event.SheetValueChanged, (params: any) => {
		if (isHandlingEvent) return;
		isHandlingEvent = true;
		try {
			const activeSheet = workbook.getActiveSheet();
			params.effectedRanges.forEach((range: any) => {
				const startRow = range.getRow();
				const startCol = range.getColumn();
				const relRow = startRow % 15;
				
				if (startCol >= 1 && startCol <= 6 && (relRow === 2 || relRow === 4 || relRow === 6 || relRow === 7 || relRow === 8)) {
					const blockIndex = Math.floor(startRow / 15);
					const productIndex = blockIndex * 6 + (startCol - 1);
					
					if (productIndex < formCount.value) {
						const blockStartRow = blockIndex * 15;
						const theme = currentTheme.value;
						
						if (relRow === 2) {
							const cellVal = activeSheet.getRange(startRow, startCol, 1, 1).getValue() as any;
							const nickname = cellVal && typeof cellVal === 'object' ? cellVal.v : cellVal;
							
							const cleanNick = getCleanNickname(nickname, uniqueNicknames.value);
							if (cleanNick) {
								const specs = getSpecsForNickname(cleanNick);
								applySpecDropdown(blockStartRow + 4, startCol, specs);
								
								const defaultSpec = specs[0] || '';
								activeSheet.getRange(blockStartRow + 4, startCol, 1, 1).setValue({ v: defaultSpec, s: `contentCenterStyle_${theme}` });
								
								const prod = getProductByNickAndSpec(cleanNick, defaultSpec);
								if (prod) {
									activeSheet.getRange(blockStartRow + 1, startCol, 1, 1).setValue({ v: getPermittedVal(1, prod.brand), s: `contentCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 3, startCol, 1, 1).setValue({ v: getPermittedVal(3, prod.fullName), s: `contentLeftStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 5, startCol, 1, 1).setValue({ v: getPermittedVal(5, prod.efficacy), s: `contentLeftStyle_${theme}` });
									const defaultGiftsDisplay = prod.gifts.map((g: any) => `🎁 ${g.name} x ${g.qty}`).join(' | ') || '🎁 双击配置赠品';
									activeSheet.getRange(blockStartRow + 6, startCol, 1, 1).setValue({ v: getPermittedVal(6, defaultGiftsDisplay), s: `editableCenterStyle_${theme}` });
									
									const thresholdVal = (prod.thresholdA || prod.thresholdB) 
										? `A档: ${prod.thresholdA || ''} (${prod.valueA || ''})；B档: ${prod.thresholdB || ''} (${prod.valueB || ''})`
										: '';
									activeSheet.getRange(blockStartRow + 7, startCol, 1, 1).setValue({ v: getPermittedVal(7, thresholdVal), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 8, startCol, 1, 1).setValue({ v: getPermittedVal(8, prod.memberGift), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 9, startCol, 1, 1).setValue({ v: getPermittedVal(9, prod.memberValue), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 10, startCol, 1, 1).setValue({ v: getPermittedVal(10, prod.sellingPoint), s: `contentLeftStyle_shaded_${theme}` });
									activeSheet.getRange(blockStartRow + 11, startCol, 1, 1).setValue({ v: getPermittedVal(11, prod.price), s: `editableCenterStyle_${theme}` });
									const dateRange = (prod.startDate && prod.endDate) ? `${prod.startDate} 00:00 ~ ${prod.endDate} 00:00` : '';
									activeSheet.getRange(blockStartRow + 12, startCol, 1, 1).setValue({ v: getPermittedVal(12, dateRange), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 13, startCol, 1, 1).setValue({ v: getPermittedVal(13, prod.remarks), s: `editableCenterStyle_${theme}` });
								}
								
							} else {
								activeSheet.getRange(blockStartRow + 1, startCol, 1, 1).setValue({ v: '', s: `contentCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 2, startCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 3, startCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 4, startCol, 1, 1).setValue({ v: '', s: `contentCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 5, startCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 6, startCol, 1, 1).setValue({ v: '🎁 双击配置赠品', s: `editableCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 7, startCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 8, startCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 9, startCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 10, startCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_shaded_${theme}` });
								activeSheet.getRange(blockStartRow + 11, startCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 12, startCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
								activeSheet.getRange(blockStartRow + 13, startCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
								
								applySpecDropdown(blockStartRow + 4, startCol, []);
								applyNicknameDropdown(blockStartRow + 2, startCol);
							}
						} else if (relRow === 4) {
							const cellVal = activeSheet.getRange(startRow, startCol, 1, 1).getValue() as any;
							const spec = cellVal && typeof cellVal === 'object' ? cellVal.v : cellVal;
							
							const nicknameVal = activeSheet.getRange(blockStartRow + 2, startCol, 1, 1).getValue() as any;
							const nickname = nicknameVal && typeof nicknameVal === 'object' ? nicknameVal.v : nicknameVal;
							const cleanNick = getCleanNickname(nickname, uniqueNicknames.value);
							
							if (cleanNick && spec) {
								const prod = getProductByNickAndSpec(cleanNick, String(spec));
								if (prod) {
									activeSheet.getRange(blockStartRow + 1, startCol, 1, 1).setValue({ v: getPermittedVal(1, prod.brand), s: `contentCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 3, startCol, 1, 1).setValue({ v: getPermittedVal(3, prod.fullName), s: `contentLeftStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 5, startCol, 1, 1).setValue({ v: getPermittedVal(5, prod.efficacy), s: `contentLeftStyle_${theme}` });
									const defaultGiftsDisplay = prod.gifts.map((g: any) => `🎁 ${g.name} x ${g.qty}`).join(' | ') || '🎁 双击配置赠品';
									activeSheet.getRange(blockStartRow + 6, startCol, 1, 1).setValue({ v: getPermittedVal(6, defaultGiftsDisplay), s: `editableCenterStyle_${theme}` });
									
									const thresholdVal = (prod.thresholdA || prod.thresholdB) 
										? `A档: ${prod.thresholdA || ''} (${prod.valueA || ''})；B档: ${prod.thresholdB || ''} (${prod.valueB || ''})`
										: '';
									activeSheet.getRange(blockStartRow + 7, startCol, 1, 1).setValue({ v: getPermittedVal(7, thresholdVal), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 8, startCol, 1, 1).setValue({ v: getPermittedVal(8, prod.memberGift), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 9, startCol, 1, 1).setValue({ v: getPermittedVal(9, prod.memberValue), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 10, startCol, 1, 1).setValue({ v: getPermittedVal(10, prod.sellingPoint), s: `contentLeftStyle_shaded_${theme}` });
									activeSheet.getRange(blockStartRow + 11, startCol, 1, 1).setValue({ v: getPermittedVal(11, prod.price), s: `editableCenterStyle_${theme}` });
									const dateRange = (prod.startDate && prod.endDate) ? `${prod.startDate} 00:00 ~ ${prod.endDate} 00:00` : '';
									activeSheet.getRange(blockStartRow + 12, startCol, 1, 1).setValue({ v: getPermittedVal(12, dateRange), s: `editableCenterStyle_${theme}` });
									activeSheet.getRange(blockStartRow + 13, startCol, 1, 1).setValue({ v: getPermittedVal(13, prod.remarks), s: `editableCenterStyle_${theme}` });
								}
							}
						}
 
 						recalculateSuffixesAndFootnotes(activeSheet);
 						window.dispatchEvent(new Event('resize'));
 						try { activeSheet.autoResizeRows(blockStartRow, 15); } catch (e) { /* ignore */ }
 						window.dispatchEvent(new Event('resize'));
 					}
 				}
 			});
 		} finally {
 			isHandlingEvent = false;
 		}
 	});
 
 	univerAPI.addEvent(univerAPI.Event.BeforeSheetEditStart, (params: any) => {
 		const row = params.row;
 		const col = params.column;
 		
 		currentEditingCell.value = { row, col };
 		
 		// 如果提报已正式提交归档，拦截一切编辑操作，处于只读模式
 		if (submissionStatus.value === 'submitted') {
 			ElMessage.warning('当前提报已正式提交归档锁定，仅支持查看与导出！');
 			params.cancel = true;
 			return;
 		}
 		
 		const blockIndex = Math.floor(row / 15);
 		const relativeRow = row % 15;
 		const productIndex = blockIndex * 6 + (col - 1);
 
 		if (relativeRow === 14 || col === 0 || col > 6 || productIndex >= formCount.value) {
 			params.cancel = true;
 			return;
 		}
 
 		if (relativeRow === 6) {
 			params.cancel = true;
 			// 校验配置赠品权限
 			const perm = permissionData.value['gifts'];
 			if (perm) {
 				const currentVal = sheet.getRange(row, col, 1, 1).getValue() as any;
 				const val = currentVal && (typeof currentVal === 'object' ? currentVal.v : currentVal);
 				const hasValue = val && val !== '🎁 双击配置赠品' && val !== '双击配置赠品';
 				if (hasValue ? !perm.is_update : !perm.is_create) {
 					ElMessage.warning('无权限配置“标配赠品”');
 					return;
 				}
 			}
 			const currentVal = sheet.getRange(row, col, 1, 1).getValue() as any;
 			const rawJSON = currentVal && typeof currentVal === 'object' ? currentVal.v : currentVal;
 			openGiftModal(row, col, rawJSON);
 			return;
 		}
 
 		const editableRelativeRows = [1, 2, 4, 5, 7, 8, 9, 10, 11, 12, 13];
 		if (!editableRelativeRows.includes(relativeRow)) {
 			params.cancel = true;
 			return;
 		}

		// 校验字段编辑权限
		const fieldName = ROW_TO_FIELD_MAP[relativeRow];
		if (fieldName) {
			const perm = permissionData.value[fieldName];
			if (perm) {
				const currentVal = sheet.getRange(row, col, 1, 1).getValue() as any;
				const val = currentVal && (typeof currentVal === 'object' ? currentVal.v : currentVal);
				const hasValue = val && val !== '';
				if (hasValue ? !perm.is_update : !perm.is_create) {
					ElMessage.warning(`无权限修改“${LABEL_DATA[relativeRow]}”字段`);
					params.cancel = true;
					return;
				}
			}
		}
	});
};

// ========== 校验规则 ==========
const applyNicknameDropdown = (row: number, col: number, extraValue?: string) => {
	const nicknames = [...uniqueNicknames.value];
	if (extraValue && !nicknames.includes(extraValue)) {
		nicknames.push(extraValue);
	}
	const rule = univerAPI
		.newDataValidation()
		.requireValueInList(nicknames, false, true)
		.setOptions({
			allowBlank: true,
			showErrorMessage: true,
			error: '请选择正确的规格产品',
			errorStyle: univerAPI.Enum.DataValidationErrorStyle.STOP,
		} as any)
		.build();
	sheet.getRange(row, col, 1, 1).setDataValidation(rule);
};

const applySpecDropdown = (row: number, col: number, specs: string[]) => {
	if (specs.length === 0) {
		sheet.getRange(row, col, 1, 1).setDataValidation(null as any);
		return;
	}
	const rule = univerAPI
		.newDataValidation()
		.requireValueInList(specs, false, true)
		.setOptions({
			allowBlank: true,
			showErrorMessage: true,
			error: '请选择正确的规格',
			errorStyle: univerAPI.Enum.DataValidationErrorStyle.STOP,
		} as any)
		.build();
	sheet.getRange(row, col, 1, 1).setDataValidation(rule);
};

const applyDateValidation = (row: number, col: number) => {
	const rule = univerAPI
		.newDataValidation()
		.requireDateOnOrAfter(new Date('1970-01-01'))
		.setOptions({
			allowBlank: true,
			showErrorMessage: true,
			error: '请输入合法有效的日期时间值 (YYYY-MM-DD HH:MM:SS)',
			errorStyle: univerAPI.Enum.DataValidationErrorStyle.STOP,
		} as any)
		.build();
	sheet.getRange(row, col, 1, 1).setDataValidation(rule);
};

// ========== 赠品弹窗 ==========
const openGiftModal = (rowIndex: number, colIndex: number, currentJSON: any) => {
	giftEditRow.value = rowIndex;
	giftEditCol.value = colIndex;
	const gifts = parseGiftsFromText(currentJSON);
	giftList.value = gifts;
	giftModalVisible.value = true;
};

const confirmGiftModal = (gifts: GiftInfo[]) => {
	const activeGifts = gifts.filter((g) => g.name);
	const displayStr = activeGifts.map((g) => `${g.name} x ${g.qty}`).join(' | ') || '双击配置赠品';
	const theme = currentTheme.value;
	const activeSheet = workbook.getActiveSheet();
	activeSheet.getRange(giftEditRow.value, giftEditCol.value, 1, 1).setValue({ v: displayStr, s: `editableCenterStyle_${theme}` });
	giftModalVisible.value = false;
	
	recalculateSuffixesAndFootnotes(activeSheet);
	window.dispatchEvent(new Event('resize'));
};

// ========== 追加商品列 ==========
const appendNewProductColumn = () => {
	const activeSheet = workbook.getActiveSheet();
	const idx = formCount.value;
	const { blockCol, blockStartRow } = getProductCoords(idx);
	const theme = currentTheme.value;

	try {
		activeSheet.setColumnWidth(blockCol, 420);
	} catch (err) {
		console.warn('设置动态追加列宽失败:', err);
	}

	if (blockCol === 1) {
		activeSheet.getRange(blockStartRow, 0, 1, 1).setValue({ v: '配置字段', s: `headerStyle_${theme}` });
		for (let r = 1; r <= 13; r++) {
			activeSheet.getRange(blockStartRow + r, 0, 1, 1).setValue({ v: LABEL_DATA[r], s: `labelStyle_${theme}` });
		}
	}

	activeSheet.getRange(blockStartRow, blockCol, 1, 1).setValue({ v: `商品提报 ${idx + 1}`, s: `headerStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 1, blockCol, 1, 1).setValue({ v: '', s: `contentCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 2, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 3, blockCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 4, blockCol, 1, 1).setValue({ v: '', s: `contentCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 5, blockCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 6, blockCol, 1, 1).setValue({ v: '双击配置赠品', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 7, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 8, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 9, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 10, blockCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_shaded_${theme}` });
	activeSheet.getRange(blockStartRow + 11, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 12, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 13, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });

	applyNicknameDropdown(blockStartRow + 2, blockCol);

	formCount.value++;
	activeSheet.showColumns(blockCol, 1);
	try { activeSheet.autoResizeRows(blockStartRow, 15); } catch (e) { /* ignore */ }
	window.dispatchEvent(new Event('resize'));
	ElMessage.success(`已追加第 ${formCount.value} 列商品配置项`);
};

// ========== 主题切换 ==========
const applyThemeToSheet = (theme: string) => {
	const activeSheet = workbook.getActiveSheet();

	const setStyle = (r: number, c: number, styleType: string) => {
		try {
			const range = activeSheet.getRange(r, c, 1, 1);
			const cell = range.getValue() as any;
			const text = cell && typeof cell === 'object' ? cell.v : cell || '';
			const mText = cell && typeof cell === 'object' ? cell.m : undefined;
			range.setValue({ v: text, m: mText, s: `${styleType}_${theme}` } as any);
		} catch (err) {
			console.warn(`设置样式失败 row:${r} col:${c}`, err);
		}
	};

	const totalBlocks = Math.ceil(formCount.value / 6);
	for (let b = 0; b < totalBlocks; b++) {
		const blockStartRow = b * 15;
		
		setStyle(blockStartRow, 0, 'headerStyle');
		for (let r = 1; r <= 13; r++) {
			setStyle(blockStartRow + r, 0, 'labelStyle');
		}

		const maxColInBlock = (b === totalBlocks - 1) ? ((formCount.value - 1) % 6) + 1 : 6;
		for (let col = 1; col <= maxColInBlock; col++) {
			setStyle(blockStartRow, col, 'headerStyle');
			setStyle(blockStartRow + 1, col, 'contentCenterStyle');
			setStyle(blockStartRow + 2, col, 'editableCenterStyle');
			setStyle(blockStartRow + 3, col, 'contentLeftStyle');
			setStyle(blockStartRow + 4, col, 'contentCenterStyle');
			setStyle(blockStartRow + 5, col, 'contentLeftStyle');
			setStyle(blockStartRow + 6, col, 'editableCenterStyle');
			setStyle(blockStartRow + 7, col, 'editableCenterStyle');
			setStyle(blockStartRow + 8, col, 'editableCenterStyle');
			setStyle(blockStartRow + 9, col, 'editableCenterStyle');
			setStyle(blockStartRow + 10, col, 'contentLeftStyle_shaded');
			setStyle(blockStartRow + 11, col, 'editableCenterStyle');
			setStyle(blockStartRow + 12, col, 'editableCenterStyle');
			setStyle(blockStartRow + 13, col, 'editableCenterStyle');
		}
		try { activeSheet.autoResizeRows(blockStartRow, 15); } catch (e) { /* ignore */ }
	}

	window.dispatchEvent(new Event('resize'));
	if (searchQuery.value) {
		handleSearchColumn();
	}
};

// ========== 保存入库 ==========
// ========== 保存入库 ==========
const saveWorkbookData = async (statusVal: string = 'draft') => {
	const activeSheet = workbook.getActiveSheet();
	const productsList: any[] = [];

	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);
		const nickname = getValue(blockStartRow + 2, blockCol);
		if (!nickname) continue;
		const cleanNickname = getCleanNickname(nickname, uniqueNicknames.value);
		const rawGifts = getValue(blockStartRow + 6, blockCol) || '';
		const gifts = parseGiftsFromText(rawGifts);

		const dateRangeStr = getValue(blockStartRow + 12, blockCol) || '';
		let startDate = '';
		let endDate = '';
		if (dateRangeStr === '***') {
			startDate = '***';
			endDate = '***';
		} else if (dateRangeStr.includes('~')) {
			const dates = dateRangeStr.split('~');
			startDate = dates[0].trim();
			endDate = dates[1].trim();
		} else {
			startDate = dateRangeStr.trim();
			endDate = dateRangeStr.trim();
		}

		productsList.push({
			cardIndex: idx,
			nickname: cleanNickname,
			brand: getValue(blockStartRow + 1, blockCol),
			fullName: getValue(blockStartRow + 3, blockCol),
			spec: getValue(blockStartRow + 4, blockCol),
			efficacy: getValue(blockStartRow + 5, blockCol),
			gifts,
			thresholdA: getValue(blockStartRow + 7, blockCol),
			valueA: '',
			thresholdB: '',
			valueB: '',
			memberGift: getValue(blockStartRow + 8, blockCol),
			memberValue: getValue(blockStartRow + 9, blockCol),
			sellingPoint: getValue(blockStartRow + 10, blockCol),
			price: getValue(blockStartRow + 11, blockCol),
			startDate,
			endDate,
			remarks: getValue(blockStartRow + 13, blockCol),
		});
	}

	if (productsList.length === 0) {
		ElMessage.warning('当前没有已填写的有效产品卡片数据！');
		return;
	}

	let snapshot = null;
	try {
		snapshot = workbook.save();
	} catch (err) {
		console.warn('保存工作簿快照失败:', err);
	}

	try {
		ElMessage.info('正在保存提报数据...');
		const result = await request({
			url: '/api/design_order/product_archives/save_spec/',
			method: 'post',
			data: { 
				id: submissionId.value,
				name: submissionName.value,
				shop: submissionShop.value,
				status: statusVal,
				products: productsList, 
				snapshot, 
				formCount: formCount.value 
			},
		});
		if (result.code === 2000 && result.data) {
			submissionId.value = result.data.id;
			submissionStatus.value = statusVal;
			
			// 如果是新填报，保存成功后，追加ID到URL中防止重复创建
			if (!route.query.id) {
				router.replace({
					path: route.path,
					query: { ...route.query, id: result.data.id }
				});
			}
			
			ElMessage.success(statusVal === 'submitted' ? '活动提报已正式提交归档并锁定编辑！' : '提报草稿已成功保存入库！');
		} else {
			throw new Error(result.msg || '保存失败');
		}
	} catch (err: any) {
		ElMessage.error(`保存失败: ${err.message || '网络连接错误'}`);
		console.log('本地结构化备份数据:', productsList);
	}
};

// 正式提交提报
const submitWorkbookData正式 = () => {
	const nameToSubmit = submissionName.value.trim();
	if (!nameToSubmit) {
		ElMessage.warning('请输入提报名称后再进行正式提交！');
		return;
	}

	ElMessageBox.confirm(
		'正式提交后，该提报的所有数据将进行锁定归档且禁止再次修改。您确认正式提交吗？',
		'正式提交确认',
		{
			confirmButtonText: '确定提交',
			cancelButtonText: '取消',
			type: 'warning'
		}
	).then(() => {
		saveWorkbookData('submitted');
	}).catch(() => {
		// ignore
	});
};

// 返回历史列表页
const goBackToList = () => {
	router.push('/product_spec_submission');
};

// ========== 导出数据 (CSV) ==========
const exportToCSV = () => {
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet) {
		ElMessage.warning('表格尚未加载，无法导出');
		return;
	}

	const rows = [];
	
	// 添加表头行：一维表格，列代表字段，行代表商品
	const headers = ['商品ID'];
	for (let r = 1; r <= 13; r++) {
		headers.push(LABEL_DATA[r]);
	}
	rows.push(headers);

	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	// 获取每个商品列并整理为行数据
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);
		const nickname = getValue(blockStartRow + 2, blockCol);
		if (!nickname) continue; // 仅导出有效填写的商品

		const rowData = [`商品提报 ${idx + 1}`];
		for (let r = 1; r <= 13; r++) {
			let val = getValue(blockStartRow + r, blockCol);
			if (r === 6) {
				val = String(val).replace('🎁 ', '');
			}
			rowData.push(val);
		}
		rows.push(rowData);
	}

	// 转换为 CSV 字符串格式
	const csvContent = rows.map(row => 
		row.map(val => {
			let str = String(val).replace(/"/g, '""');
			if (str.includes(',') || str.includes('\n') || str.includes('"')) {
				str = `"${str}"`;
			}
			return str;
		}).join(',')
	).join('\n');

	// 增加 \uFEFF BOM 标记防止中文乱码
	const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
	const url = URL.createObjectURL(blob);
	const link = document.createElement('a');
	link.setAttribute('href', url);
	link.setAttribute('download', `商品活动提报配置表_${new Date().toLocaleDateString()}.csv`);
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
	ElMessage.success('成功导出提报对比数据！');
};

// ========== 搜索定位与匹配列高亮 ==========
const handleSearchColumn = () => {
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet) return;
	
	const query = searchQuery.value.trim().toLowerCase();
	const theme = currentTheme.value;
	
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	isHandlingEvent = true;
	try {
		let firstMatchedRange = null;
		
		for (let idx = 0; idx < formCount.value; idx++) {
			const { blockCol, blockStartRow } = getProductCoords(idx);
			
			const nickname = String(getValue(blockStartRow + 2, blockCol)).toLowerCase();
			const brand = String(getValue(blockStartRow + 1, blockCol)).toLowerCase();
			const fullName = String(getValue(blockStartRow + 3, blockCol)).toLowerCase();
			const spec = String(getValue(blockStartRow + 4, blockCol)).toLowerCase();
			const sellingPoint = String(getValue(blockStartRow + 10, blockCol)).toLowerCase();
			
			const isMatch = query !== '' && (
				nickname.includes(query) ||
				brand.includes(query) ||
				fullName.includes(query) ||
				spec.includes(query) ||
				sellingPoint.includes(query)
			);
			
			const headerRange = activeSheet.getRange(blockStartRow, blockCol, 1, 1);
			const currentVal = headerRange.getValue() as any;
			const text = currentVal && typeof currentVal === 'object' ? currentVal.v : currentVal || '';
			
			const styleName = isMatch ? `headerStyle_highlight_${theme}` : `headerStyle_${theme}`;
			headerRange.setValue({ v: text, s: styleName });
			
			if (isMatch && !firstMatchedRange) {
				firstMatchedRange = headerRange;
			}
		}

		if (firstMatchedRange) {
			try {
				activeSheet.setActiveRange(firstMatchedRange);
			} catch (e) {
				// ignore
			}
		}
	} finally {
		isHandlingEvent = false;
	}
};

// ========== 生命周期 ==========
onMounted(async () => {
	await nextTick();

	// 监听编辑器输入
	document.addEventListener('input', handleEditorInput, true);

	// 获取字段权限
	try {
		const permRes = await GetPermission();
		if (permRes.code === 2000) {
			permissionData.value = permRes.data;
		}
	} catch (err) {
		console.warn('获取规格表字段权限失败:', err);
	}

	// 1. 获取动态产品档案数据并更新 productDatabase
	try {
		const resDictJson = await request({
			url: '/api/design_order/product_archives/dict/',
			method: 'get',
		});
		if (resDictJson.code === 2000 && Array.isArray(resDictJson.data)) {
			const dbList = resDictJson.data;
			const list: DBProductItem[] = [];
			for (const prod of Object.values(PRODUCT_DATABASE)) {
				list.push({ ...prod });
			}
			dbList.forEach((item: any) => {
				const nickname = item.nickname || item.product_name;
				if (!nickname) return;

				const gifts = parseGiftsFromText(item.gifts);
				list.push({
					nickname: nickname,
					brand: item.brand || '',
					fullName: item.product_name || '',
					spec: item.specification || '',
					gifts: gifts,
					efficacy: '',
					thresholdA: '',
					valueA: '',
					thresholdB: '',
					valueB: '',
					memberGift: '',
					memberValue: '',
					sellingPoint: '',
					price: '',
					startDate: '',
					endDate: '',
					remarks: '',
				});
			});
			rawProductList.value = list;
		}
	} catch (err) {
		console.warn('获取产品档案字典失败:', err);
	}

	// 2. 加载表格规格数据
	const subId = route.query.id || null;
	try {
		const result = await request({
			url: '/api/design_order/product_archives/load_spec/',
			method: 'get',
			params: subId ? { id: subId } : {}
		});
		if (result.code === 2000 && result.data) {
			submissionId.value = result.data.id || null;
			submissionName.value = result.data.name || '';
			submissionShop.value = result.data.shop || '';
			submissionStatus.value = result.data.status || 'draft';
			formCount.value = result.data.formCount || 1;
			const migratedSnapshot = migrateSnapshotTo15Rows(result.data.snapshot);
			const filteredSnapshot = filterSnapshotData(migratedSnapshot);
			initUniver(filteredSnapshot);
			ElMessage.success(`成功加载提报“${submissionName.value}”的数据！`);
		} else {
			submissionId.value = null;
			submissionName.value = '';
			submissionShop.value = '';
			submissionStatus.value = 'draft';
			formCount.value = 1;
			initUniver();
		}
	} catch (err) {
		console.warn('加载后端规格数据失败，将初始化默认模版:', err);
		initUniver();
	}
});

onBeforeUnmount(() => {
	document.removeEventListener('input', handleEditorInput, true);

	if (univerAPI) {
		try {
			univerAPI.dispose();
		} catch (e) {
			/* ignore */
		}
	}
});
</script>

<style scoped>
.product-spec-wrapper {
	width: 100%;
	height: 100%;
	display: flex;
	flex-direction: column;
	background: linear-gradient(135deg, #eef2f6 0%, #e2e8f0 100%);
	font-family: 'Microsoft YaHei', 'Noto Sans SC', sans-serif;
}

.control-panel {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 12px 24px;
	background: rgba(255, 255, 255, 0.8);
	backdrop-filter: blur(20px) saturate(180%);
	border-bottom: 1px solid rgba(226, 232, 240, 0.8);
	box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
	z-index: 10;
	flex-shrink: 0;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.logo-area {
	display: flex;
	align-items: center;
	gap: 12px;
}

.logo-icon {
	font-size: 26px;
	background: linear-gradient(135deg, #4e6ef2, #7c3aed);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	display: flex;
	align-items: center;
	justify-content: center;
}

.title-container h1 {
	font-size: 16px;
	font-weight: 700;
	letter-spacing: -0.02em;
	background: linear-gradient(90deg, #4f46e5 0%, #9333ea 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	margin: 0;
}

.title-container p {
	font-size: 11px;
	color: #64748b;
	font-weight: 500;
	margin: 0;
}

.actions-area {
	display: flex;
	align-items: center;
	gap: 10px;
}

.theme-selector {
	display: flex;
	align-items: center;
	gap: 4px;
	font-size: 13px;
	font-weight: 600;
	color: #334155;
	padding: 4px 12px;
	background: rgba(241, 245, 249, 0.8);
	border-radius: 20px;
	border: 1px solid rgba(226, 232, 240, 0.8);
}

.theme-icon {
	font-size: 14px;
	color: #64748b;
}

.theme-option-item {
	display: flex;
	align-items: center;
	gap: 8px;
	height: 34px;
}

.color-badge {
	width: 8px;
	height: 8px;
	border-radius: 50%;
	display: inline-block;
}

.badge-proya {
	background-color: #4e6ef2;
	box-shadow: 0 0 4px rgba(78, 110, 242, 0.4);
}

.badge-collgene {
	background-color: #2f6bff;
	box-shadow: 0 0 4px rgba(47, 107, 255, 0.4);
}

.badge-luxury {
	background-color: #9a7836;
	box-shadow: 0 0 4px rgba(154, 120, 54, 0.4);
}

.search-area {
	margin-right: 4px;
}

.actions-area :deep(.el-button) {
	border-radius: 8px;
	font-weight: 500;
	transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.actions-area :deep(.el-button):hover {
	transform: translateY(-1px);
	box-shadow: 0 4px 12px rgba(78, 110, 242, 0.12);
}

.actions-area :deep(.el-button):active {
	transform: translateY(0);
}

.univer-area {
	flex: 1;
	padding: 12px;
	overflow: hidden;
}

.univer-wrapper {
	width: 100%;
	height: 100%;
	border-radius: 12px;
	overflow: hidden;
	border: 1px solid rgba(226, 232, 240, 0.8);
	box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
	background: white;
}

.status-badge-container {
	margin-left: 8px;
	display: flex;
	align-items: center;
}

.meta-inputs-area {
	display: flex;
	align-items: center;
	gap: 8px;
	margin-right: 4px;
}

/* 隐藏 Univer 默认 UI */
:deep(.univer-formula-bar),
:deep(.univer-toolbar),
:deep(.univer-sheet-bar) {
	display: none !important;
}
</style>