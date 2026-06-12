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
						<p v-else>可视化活动矩阵提报系统</p>
					</div>
					<!-- 状态标识 -->
					<div class="status-badge-container" v-if="submissionId">
						<el-tag :type="submissionStatus === 'submitted' ? 'success' : 'info'" size="small" effect="dark">
							{{ submissionStatus === 'submitted' ? '已提交' : '草稿' }}
						</el-tag>
						<el-tag type="warning" size="small" effect="plain" style="margin-left: 6px;">
							{{ TEMPLATE_TYPES.find(t => t.value === currentTemplateType)?.label || '主图模板' }}
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
						<el-select
							v-model="currentTemplateType"
							placeholder="请选择模板"
							size="small"
							style="width: 130px"
							:disabled="submissionStatus === 'submitted'"
						>
							<el-option
								v-for="item in TEMPLATE_TYPES"
								:key="item.value"
								:label="item.label"
								:value="item.value"
							/>
						</el-select>
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

					<el-button v-if="submissionStatus !== 'submitted'" type="primary" size="small" :icon="Plus" @click="handleQuickAdd">新增产品</el-button>
					<el-button type="warning" size="small" :icon="Edit" @click="handleEditProduct">编辑商品</el-button>
					<el-button v-if="submissionStatus !== 'submitted'" type="success" size="small" :icon="FolderChecked" :loading="isSaving" @click="saveWorkbookData('draft')">保存草稿</el-button>
					<el-button v-if="submissionStatus === 'draft' && submissionId" type="danger" size="small" :icon="Checked" @click="submitWorkbookData">正式提交</el-button>
					<el-button type="warning" size="small" :icon="Download" @click="exportToCSV">导出数据</el-button>
				</div>
			</div>

			<!-- Univer 表格渲染区域 -->
			<div class="univer-area">
				<div class="univer-wrapper">
					<div id="univer-container" ref="univerContainerRef" style="width: 100%; height: 100%"></div>
				</div>
			</div>

			<!-- 快捷表单填写弹窗 -->
			<el-dialog
				v-model="formDialogVisible"
				:title="isAddingNewProduct ? '快捷新增商品提报' : '快捷填写商品提报'"
				width="920px"
				:close-on-click-modal="false"
				:before-close="handleBeforeDialogClose"
				class="product-spec-form-dialog"
			>
				<div class="form-container-dialog">
					<div class="form-toolbar" style="margin-bottom: 16px;">
						<template v-if="isAddingNewProduct">
							<span class="selector-label" style="font-weight: bold; color: var(--el-color-primary);">正在新增商品提报</span>
						</template>
						<template v-else>
							<span class="selector-label">当前正在编辑商品：</span>
							<el-select :model-value="currentColIndex" size="default" style="width: 180px; margin-right: 12px;" @change="handleDialogColumnChange">
								<el-option 
									v-for="idx in formCount" 
									:key="idx - 1" 
									:value="idx - 1" 
									:label="`商品提报 ${idx}`"
								/>
							</el-select>
						</template>
					</div>

					<div class="dialog-form-scroll-body">
						<div class="card">
							<div class="section-label">基本信息</div>

							<div class="field-row">
								<div class="field-label">{{ getLabelData(1) }}</div>
								<div class="field-value">
									<input type="text" v-model="brandVal" class="amt-input" style="width:100%">
								</div>
							</div>

							<div class="field-row">
								<div class="field-label">{{ getLabelData(2) }}</div>
								<div class="field-value">
									<div class="prod-search-wrap">
										<input type="text" class="prod-search-input" v-model="mainSearchQuery"
											placeholder="搜索产品（输入昵称/别名/全称）..."
											@input="handleMainSearchInput($event.target.value)"
											@focus="handleMainSearchInput(mainSearchQuery)"
											autocomplete="off">
										<div class="dropdown" v-if="showMainDropdown && matchingMainProducts.length">
											<div 
												class="dropdown-item" 
												v-for="p in matchingMainProducts" 
												:key="p.nickname"
												@click="selectMainProductFromDropdown(p)"
											>
												<div class="dn">{{ p.nickname }}</div>
												<div class="df">{{ p.fullName }}</div>
											</div>
										</div>
									</div>
									<div id="main-prod-tag" style="margin-top:6px;" v-if="selectedMainProduct">
										<div class="tag">
											<span>{{ selectedMainProduct.nickname }}</span>
											<button class="tag-del" @click="removeMainProductFromForm" aria-label="移除">×</button>
										</div>
									</div>
									<div style="display:flex;gap:8px;margin-top:6px;align-items:center;">
										<span style="font-size:12px;color:var(--color-text-secondary);">规格</span>
										<input type="text" v-model="mainSpec" placeholder="如 150ml" style="width:120px;font-size:12px;">
									</div>
								</div>
							</div>

							<div class="field-row">
								<div class="field-label">{{ getLabelData(3) }}</div>
								<div class="field-value">
									<div style="font-size:13px;color:var(--color-text-secondary);">
										{{ selectedMainProduct ? selectedMainProduct.fullName : '选择产品后自动带出' }}
									</div>
								</div>
							</div>

							<div class="field-row">
								<div class="field-label">{{ getLabelData(5) }}</div>
								<div class="field-value">
									<input type="text" v-model="efficacyVal" style="width:100%;font-size:13px;">
								</div>
							</div>

							<div class="field-row">
								<div class="field-label">{{ getLabelData(11) }}</div>
								<div class="field-value">
									<input type="number" v-model="priceVal" style="width:90px;font-size:13px;">
									<span style="font-size:12px;color:var(--color-text-secondary);margin-left:6px;">元</span>
								</div>
							</div>

							<div class="field-row">
								<div class="field-label">{{ getLabelData(12) }}</div>
								<div class="field-value" style="display:flex;align-items:center;gap:6px;">
									<input type="text" v-model="startDateVal" style="width:150px;font-size:12px;">
									<span style="font-size:12px;color:var(--color-text-secondary);">~</span>
									<input type="text" v-model="endDateVal" style="width:150px;font-size:12px;">
								</div>
							</div>
						</div>

						<div class="card">
							<div class="section-label">{{ getLabelData(6) }}</div>
							<div class="tag-list" style="margin-bottom: 8px;">
								<div class="tag" v-for="(g, i) in formGiftItems" :key="g.id">
									<span>{{ g.nickname }}</span>
									<span class="qty">
										<span style="font-size:11px;color:var(--color-text-secondary)">×</span>
										<input type="number" min="1" v-model.number="g.qty" style="width:40px;">
										<input type="text" v-model="g.unit" style="width:28px;">
									</span>
									<button class="tag-del" @click="removeGiftFromForm(i)" aria-label="移除">×</button>
								</div>
							</div>
							<div class="prod-search-wrap" style="margin-top:8px;">
								<button class="btn-add" v-if="!showGiftInput" @click="showGiftInput = true">
									<el-icon><Plus /></el-icon> 添加赠品
								</button>
								<div v-else style="display: flex; gap: 8px;">
									<input type="text" class="prod-search-input" v-model="giftSearchQuery"
										placeholder="搜索赠品产品..."
										@input="handleGiftSearchInput($event.target.value)"
										@focus="handleGiftSearchInput(giftSearchQuery)"
										autocomplete="off">
									<el-button size="small" @click="showGiftInput = false">取消</el-button>
									<div class="dropdown" v-if="showGiftDropdown && matchingGiftProducts.length">
										<div 
											class="dropdown-item" 
											v-for="p in matchingGiftProducts" 
											:key="p.nickname"
											@click="addGiftFromForm(p)"
										>
											<div class="dn">{{ p.nickname }}</div>
											<div class="df">{{ p.fullName }}</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="card">
							<div class="section-label">{{ getLabelData(7) }}</div>
							<div id="tier-list">
								<div class="tier-block" v-for="(tier, idx) in formTiers" :key="tier.id">
									<div class="tier-header">
										<span class="tier-name">{{ 'ABCDEFGH'[idx] }}档</span>
										<input type="text" v-model="tier.threshold"
											style="width:90px;font-size:12px;" placeholder="满xxx元">
										<input type="text" v-model="tier.value"
											style="width:72px;font-size:12px;" placeholder="价值">
										<button class="tier-del" @click="removeTierFromForm(idx)">× 删除</button>
									</div>
									<div class="tag-list" style="margin-bottom: 6px;">
										<div class="tag" v-for="(g, i) in tier.items" :key="i">
											<span>{{ g.nickname }}</span>
											<span class="qty">
												<span style="font-size:11px;color:var(--color-text-secondary)">×</span>
												<input type="number" min="1" v-model.number="g.qty" style="width:40px;">
												<input type="text" v-model="g.unit" style="width:28px;">
											</span>
											<button class="tag-del" @click="removeTierGiftFromForm(tier.id, i)" aria-label="移除">×</button>
										</div>
									</div>
									<div class="prod-search-wrap" style="margin-top:4px;">
										<button class="btn-add" style="font-size:11px;" v-if="!showTierInputs[tier.id]" @click="showTierInputs[tier.id] = true">
											<el-icon><Plus /></el-icon> 添加赠品
										</button>
										<div v-else style="display: flex; gap: 8px;">
											<input type="text" class="prod-search-input" style="font-size:12px;" 
												v-model="tierSearchQueries[tier.id]"
												placeholder="搜索赠品..."
												@input="handleTierSearchInput(tier.id, $event.target.value)"
												@focus="handleTierSearchInput(tier.id, tierSearchQueries[tier.id])"
												autocomplete="off">
											<el-button size="small" @click="showTierInputs[tier.id] = false">取消</el-button>
											<div class="dropdown" v-if="showTierDropdowns[tier.id] && matchingTierProducts[tier.id] && matchingTierProducts[tier.id].length">
												<div 
													class="dropdown-item" 
													v-for="p in matchingTierProducts[tier.id]" 
													:key="p.nickname"
													@click="addTierGiftFromForm(tier.id, p)"
												>
													<div class="dn">{{ p.nickname }}</div>
													<div class="df">{{ p.fullName }}</div>
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<button class="btn-add" @click="addTierFromForm" style="margin-top:4px;">
								<el-icon><Plus /></el-icon> 添加档位
							</button>
						</div>

						<div class="card">
							<div class="section-label">{{ getLabelData(8) }} / {{ getLabelData(9) }}</div>
							<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px;">
								<div>
									<div style="font-size:11px;color:var(--color-text-secondary);margin-bottom:4px;">{{ getLabelData(8) }}</div>
									<input type="text" v-model="vipThresholdVal" style="width:100%;font-size:13px;">
								</div>
								<div>
									<div style="font-size:11px;color:var(--color-text-secondary);margin-bottom:4px;">{{ getLabelData(9) }}</div>
									<input type="text" v-model="vipValueVal" style="width:100%;font-size:13px;">
								</div>
							</div>
							<div class="tag-list" style="margin-bottom: 8px;">
								<div class="tag" v-for="(g, i) in formVipItems" :key="i">
									<span>{{ g.nickname }}</span>
									<span class="qty">
										<span style="font-size:11px;color:var(--color-text-secondary)">×</span>
										<input type="number" min="1" v-model.number="g.qty" style="width:40px;">
										<input type="text" v-model="g.unit" style="width:28px;">
									</span>
									<button class="tag-del" @click="removeVipGiftFromForm(i)" aria-label="移除">×</button>
								</div>
							</div>
							<div class="prod-search-wrap" style="margin-top:8px;">
								<button class="btn-add" v-if="!showVipInput" @click="showVipInput = true">
									<el-icon><Plus /></el-icon> 添加礼品
								</button>
								<div v-else style="display: flex; gap: 8px;">
									<input type="text" class="prod-search-input" v-model="vipSearchQuery"
										placeholder="搜索会员专享礼品..."
										@input="handleVipSearchInput($event.target.value)"
										@focus="handleVipSearchInput(vipSearchQuery)"
										autocomplete="off">
									<el-button size="small" @click="showVipInput = false">取消</el-button>
									<div class="dropdown" v-if="showVipDropdown && matchingVipProducts.length">
										<div 
											class="dropdown-item" 
											v-for="p in matchingVipProducts" 
											:key="p.nickname"
											@click="addVipGiftFromForm(p)"
										>
											<div class="dn">{{ p.nickname }}</div>
											<div class="df">{{ p.fullName }}</div>
										</div>
									</div>
								</div>
							</div>
						</div>

						<div class="card">
							<div class="section-label">{{ getLabelData(10) }} / {{ getLabelData(13) }}</div>
							<div class="field-row" style="border-bottom:none;">
								<div class="field-label">{{ getLabelData(10) }}</div>
								<textarea v-model="sellingPointVal" style="font-size:13px;"></textarea>
							</div>
							<div class="field-row" style="border-bottom:none;">
								<div class="field-label">{{ getLabelData(13) }}</div>
								<textarea v-model="remarksVal" style="font-size:13px;"></textarea>
							</div>
						</div>
					</div>
				</div>
				<template #footer>
					<span class="dialog-footer">
						<el-button @click="handleDialogCancel">取 消</el-button>
						<el-button v-if="submissionStatus !== 'submitted'" type="success" @click="handleDialogContinueAdd">继续新增</el-button>
						<el-button type="primary" @click="handleDialogConfirm">{{ isAddingNewProduct ? '确定并新增' : '确定并回显' }}</el-button>
					</span>
				</template>
			</el-dialog>

			<!-- 选择提及产品的对话弹窗 -->
			<ProductSelectDialog
				v-model="productDialogVisible"
				:options="selectableProducts"
				@select="selectProductFromDialog"
				@close="closeProductDialog"
			/>

				<!-- \u6821\u9a8c\u7ed3\u679c\u5f39\u7a97 -->
				<el-dialog
					v-model="validationDialogVisible"
					title="\u63d0\u4ea4\u6821\u9a8c\u7ed3\u679c"
					width="640px"
					:close-on-click-modal="false"
				>
					<div v-if="validationErrors.length > 0" style="margin-bottom: 16px;">
						<div style="display: flex; align-items: center; gap: 6px; color: #f56c6c; font-weight: 600; margin-bottom: 8px;">
							<el-icon><CircleCloseFilled /></el-icon>
							<span>\u5fc5\u987b\u4fee\u6b63\u7684\u95ee\u9898\uff08{{ validationErrors.length }} \u9879\uff09</span>
						</div>
						<el-scrollbar max-height="240px">
							<div v-for="(err, i) in validationErrors" :key="'e'+i" style="display: flex; align-items: baseline; gap: 8px; padding: 4px 0; color: #f56c6c; font-size: 13px;">
								<span style="min-width: 20px; text-align: right;">{{ i + 1 }}.</span>
								<span>{{ err.message }}</span>
							</div>
						</el-scrollbar>
					</div>
					<div v-if="validationWarnings.length > 0">
						<div style="display: flex; align-items: center; gap: 6px; color: #e6a23c; font-weight: 600; margin-bottom: 8px;">
							<el-icon><WarningFilled /></el-icon>
							<span>\u5efa\u8bae\u8865\u5145\u7684\u5185\u5bb9\uff08{{ validationWarnings.length }} \u9879\uff09</span>
						</div>
						<el-scrollbar max-height="200px">
							<div v-for="(warn, i) in validationWarnings" :key="'w'+i" style="display: flex; align-items: baseline; gap: 8px; padding: 4px 0; color: #e6a23c; font-size: 13px;">
								<span style="min-width: 20px; text-align: right;">{{ i + 1 }}.</span>
								<span>{{ warn.message }}</span>
							</div>
						</el-scrollbar>
					</div>
					<template #footer>
						<el-button @click="validationDialogVisible = false">\u8fd4\u56de\u4fee\u6539</el-button>
						<el-button
							v-if="validationErrors.length === 0 && validationWarnings.length > 0"
							type="warning"
							@click="validationDialogVisible = false; confirmAndSubmit()"
						>
							\u4ecd\u7136\u63d0\u4ea4
						</el-button>
					</template>
				</el-dialog>
		</div>
	</fs-page>
</template>

<script lang="ts" setup name="productSpec">
import { ref, reactive, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { request } from '/@/utils/service';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Plus, FolderChecked, Download, Brush, Search, ArrowLeft, Checked, Edit, DocumentCopy, CircleCloseFilled, WarningFilled } from '@element-plus/icons-vue';
import { createUniver, LocaleType } from '@univerjs/presets';
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/locales/zh-CN';
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import '@univerjs/sheets-data-validation/lib/facade';
import '@univerjs/sheets-ui/lib/facade';
import '@univerjs/preset-sheets-data-validation/lib/index.css';
import '@univerjs/preset-sheets-core/lib/index.css';

// 导入外部定义
import { GiftInfo, DBProductItem, SelectableProduct, ValidationError, ValidationResult } from './types';
import { LABEL_DATA, TEMPLATE_TYPES, TEMPLATE_LABELS, buildStylesDict } from './constants';
import { getCleanNickname, getProductCoords, getCursorOffsetInContainer, setCaretPosition, escapeRegExp } from './utils';

// 导入子组件
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

const cleanFootnotesAndDetails = (text: string): string => {
	if (!text) return '';
	return text
		.split('\n')
		.filter(line => {
			const trimmed = line.trim();
			if (trimmed === '*具体说明见产品详情页') {
				return false;
			}
			if (/^\[(?:\d+|undefined)\]\s*.*?\s*为\s*产品昵称\s*[，,]\s*产品备案全称为/i.test(trimmed)) {
				return false;
			}
			return true;
		})
		.join('\n')
		.trim();
};


// ========== 产品规格数据库 ==========
const rawProductList = ref<DBProductItem[]>([]);
const PRODUCT_KEYWORDS = ref<Record<string, string[]>>({});

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
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	interface ColConfig {
		index: number;
		blockCol: number;
		blockStartRow: number;
		cleanNick: string;
		spec: string;
	}

	const cols: ColConfig[] = [];
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);

		const nicknameVal = getValue(blockStartRow + 2, blockCol);
		const cleanNick = getCleanNickname(nicknameVal, uniqueNicknames.value);
		if (!cleanNick) continue;

		const specVal = getValue(blockStartRow + 4, blockCol);
		const spec = specVal && typeof specVal === 'object' ? specVal.v : specVal || '';

		cols.push({
			index: idx,
			blockCol,
			blockStartRow,
			cleanNick,
			spec
		});
	}

	// 1. 按官方全称或昵称首次出现顺序分配全局递增编号，保证相同官方全称的产品获得相同的编号
	const nicknameIndexMap: Record<string, number> = {};
	const fullNameIndexMap: Record<string, number> = {};
	let globalIndex = 1;
	for (const config of cols) {
		const prod = getProductByNickAndSpec(config.cleanNick, config.spec);
		const fullName = prod ? prod.fullName : config.cleanNick;
		if (fullName) {
			if (!fullNameIndexMap[fullName]) {
				fullNameIndexMap[fullName] = globalIndex++;
			}
			nicknameIndexMap[config.cleanNick] = fullNameIndexMap[fullName];
		} else {
			if (!nicknameIndexMap[config.cleanNick]) {
				nicknameIndexMap[config.cleanNick] = globalIndex++;
			}
		}
	}

	// 2. 扫描所有提报列中的赠品、满赠、会员礼单元格，收集其中提及的、尚未分配编号的其他产品昵称并分配编号
	for (const config of cols) {
		const giftsText = getValue(config.blockStartRow + 6, config.blockCol);
		const thresholdText = getValue(config.blockStartRow + 7, config.blockCol);
		const memberGiftText = getValue(config.blockStartRow + 8, config.blockCol);

		const checkAndRegisterMention = (text: string) => {
			if (!text) return;
			uniqueNicknames.value.forEach(nick => {
				let isMentioned = false;
				if (text.includes(nick)) {
					isMentioned = true;
				} else {
					const keywords = getProductKeywords(nick);
					if (keywords.some(kw => text.includes(kw))) {
						isMentioned = true;
					}
				}

				if (isMentioned) {
					const prod = rawProductList.value.find(p => p.nickname === nick);
					const fullName = prod ? prod.fullName : nick;
					if (fullName) {
						if (!fullNameIndexMap[fullName]) {
							fullNameIndexMap[fullName] = globalIndex++;
						}
						if (!nicknameIndexMap[nick]) {
							nicknameIndexMap[nick] = fullNameIndexMap[fullName];
						}
					}
				}
			});
		};

		checkAndRegisterMention(String(giftsText));
		checkAndRegisterMention(String(thresholdText));
		checkAndRegisterMention(String(memberGiftText));
	}

	// 更新 colSuffixMap 以兼容其他引用
	for (const config of cols) {
		const suffix = nicknameIndexMap[config.cleanNick];
		colSuffixMap.value[config.blockCol] = suffix;
	}

	const theme = currentTheme.value;

	// 更新昵称行：写入 昵称[编号]规格
	for (const config of cols) {
		const suffix = nicknameIndexMap[config.cleanNick];
		const formattedNickname = config.spec ? `${config.cleanNick}[${suffix}]${config.spec}` : `${config.cleanNick}[${suffix}]`;

		activeSheet.getRange(config.blockStartRow + 2, config.blockCol, 1, 1).setValue({
			v: formattedNickname,
			s: `editableCenterStyle_${theme}`
		});
	}

	const getProductIndex = (nickName: string): number | undefined => {
		if (nicknameIndexMap[nickName] !== undefined) {
			return nicknameIndexMap[nickName];
		}
		const matchedItem = rawProductList.value.find(item => item.nickname === nickName);
		if (matchedItem) {
			for (const [mainNick, indexNum] of Object.entries(nicknameIndexMap)) {
				const mainItem = rawProductList.value.find(item => item.nickname === mainNick);
				if (mainItem && mainItem.fullName === matchedItem.fullName) {
					return indexNum;
				}
			}
		}
		return undefined;
	};

	// 在文本中为产品名提及插入编号
	const insertSuffixesInText = (text: string): string => {
		if (!text) return text;
		// 收集所有昵称和对应编号，按长度降序排列避免短名覆盖长名
		const nickEntries = Object.entries(nicknameIndexMap)
			.sort(([a], [b]) => b.length - a.length);

		let result = text;
		for (const [nick, num] of nickEntries) {
			// 先清除已有的 [编号] 后缀，再重新插入
			const cleaned = result.replace(new RegExp(escapeRegExp(nick) + '\\[\\d+\\]', 'g'), nick);
			result = cleaned.replace(
				new RegExp(escapeRegExp(nick), 'g'),
				`${nick}[${num}]`
			);
		}
		// 同时通过关键词匹配补充
		for (const [nick, num] of nickEntries) {
			const keywords = getProductKeywords(nick);
			for (const kw of keywords) {
				if (kw === nick) continue; // 已处理
				if (!result.includes(kw)) continue;
				// 避免在已有 [编号] 的上下文中重复插入
				const regex = new RegExp(escapeRegExp(kw) + '(?!\\[\\d+\\])', 'g');
				result = result.replace(regex, `${kw}[${num}]`);
			}
		}
		return result;
	};

	// 为每个列更新赠品/满赠/会员礼行中的产品名编号，并生成备注脚注
	const explainedNicknames = new Set<string>();

	for (const config of cols) {
		const prod = getProductByNickAndSpec(config.cleanNick, config.spec);

		// 更新赠品行 (Row 6)
		const giftsText = getValue(config.blockStartRow + 6, config.blockCol);
		if (giftsText && giftsText !== '***') {
			const updatedGifts = insertSuffixesInText(String(giftsText));
			activeSheet.getRange(config.blockStartRow + 6, config.blockCol, 1, 1).setValue({
				v: updatedGifts,
				s: `editableCenterStyle_${theme}`
			});
		}

		// 更新满赠行 (Row 7)
		const thresholdText = getValue(config.blockStartRow + 7, config.blockCol);
		if (thresholdText && thresholdText !== '***') {
			const updatedThreshold = insertSuffixesInText(String(thresholdText));
			activeSheet.getRange(config.blockStartRow + 7, config.blockCol, 1, 1).setValue({
				v: updatedThreshold,
				s: `editableCenterStyle_${theme}`
			});
		}

		// 更新会员礼行 (Row 8)
		const memberGiftText = getValue(config.blockStartRow + 8, config.blockCol);
		if (memberGiftText && memberGiftText !== '***') {
			const updatedMemberGift = insertSuffixesInText(String(memberGiftText));
			activeSheet.getRange(config.blockStartRow + 8, config.blockCol, 1, 1).setValue({
				v: updatedMemberGift,
				s: `editableCenterStyle_${theme}`
			});
		}

		// 收集该列引用的所有产品昵称，用于生成脚注
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
				if (text.includes(nick)) {
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

		// 生成备注脚注
		let cellRemarksVal = getValue(config.blockStartRow + 13, config.blockCol) || '';
		let baseRemarks = cleanFootnotesAndDetails(String(cellRemarksVal));
		if (!baseRemarks) {
			baseRemarks = cleanFootnotesAndDetails(prod ? (prod.remarks || '') : '');
		}

		if (baseRemarks) {
			baseRemarks += '\n*具体说明见产品详情页';
		} else {
			baseRemarks = '*具体说明见产品详情页';
		}

		// 使用昵称对应的全局编号生成脚注
		const addedNumsInCol = new Set<number>();
		for (const nick of referencedNicknames) {
			let fullName = '';
			const matchedItem = rawProductList.value.find(item => item.nickname === nick);
			if (matchedItem) {
				fullName = matchedItem.fullName;
			}
			if (fullName && fullName !== nick) {
				const nickNum = getProductIndex(nick);
				if (nickNum !== undefined) {
					if (addedNumsInCol.has(nickNum)) continue;
					addedNumsInCol.add(nickNum);
					
					const line = `[${nickNum}]${nick}为产品昵称，产品备案全称为${fullName}`;
					baseRemarks += `\n${line}`;
				}
			}
		}

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
			                       
			const isPromoRow = currentEditingCell.value && (currentEditingCell.value.row % 15 === 7 || currentEditingCell.value.row % 15 === 8);
			
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
const currentTemplateType = ref('main_image');

const univerContainerRef = ref<HTMLElement | null>(null);
const controlPanelRef = ref<HTMLElement | null>(null);
const logoTextRef = ref<HTMLElement | null>(null);
const currentTheme = ref('proya');
let isHandlingEvent = false;

	// 自动保存状态
	const isSaving = ref(false);
	const isDirty = ref(false);
	const lastSavedAt = ref<Date | null>(null);
	const autoSaveTimer = ref<ReturnType<typeof setTimeout> | null>(null);
	const retryCount = ref(0);
	const MAX_RETRY = 3;
	const AUTO_SAVE_INTERVAL = 30_000;  // 30秒

let univerAPI: any = null;
let workbook: any = null;
let sheet: any = null;
const formCount = ref(1);
const searchQuery = ref('');

// @ 产品选择器弹窗状态
const productDialogVisible = ref(false);

// 赠品弹窗状态
const giftEditRow = ref(0);
const giftEditCol = ref(0);
const giftList = ref<{ name: string; qty: string }[]>([]);
const giftModalVisible = ref(false);

const atSymbolIndex = ref(0);
const cursorIndexBeforeDialog = ref(0);
const textBeforeAt = ref('');
const textAfterAt = ref('');

const activeEditor = ref<HTMLElement | null>(null);
const currentEditingCell = ref<{ row: number; col: number } | null>(null);
const logDebug = (msg: string) => {
	console.log(`[MentionDebug] ${msg}`);
};

// ========== Tabbed Navigation state & Popup State ==========
const currentTab = ref('grid'); // Default to grid view
const currentColIndex = ref(0);
const formDialogVisible = ref(false);
const prevColIndex = ref(0);

const handleQuickAdd = () => {
	if (submissionStatus.value === 'submitted') return;
	isAddingNewProduct.value = true;
	resetFormToDefault();
	formDialogVisible.value = true;
};

const handleEditProduct = () => {
	isAddingNewProduct.value = false;
	// 1. Find the column corresponding to the currently selected cell
	const activeSheet = workbook?.getActiveSheet();
	if (activeSheet) {
		const selection = activeSheet.getSelection();
		const activeRange = selection?.getActiveRange();
		if (activeRange) {
			const row = activeRange.getRow();
			const col = activeRange.getColumn();
			currentEditingCell.value = { row, col };
		}
	}

	if (currentEditingCell.value) {
		const { row, col } = currentEditingCell.value;
		const blockIndex = Math.floor(row / 15);
		const productIndex = blockIndex * 6 + (col - 1);
		if (col >= 1 && col <= 6 && productIndex >= 0 && productIndex < formCount.value) {
			currentColIndex.value = productIndex;
		} else {
			ElMessage.warning('请先在表格中选择有效的商品列！');
			return;
		}
	} else {
		ElMessage.warning('请先在表格中选择要编辑的商品！');
		return;
	}
	prevColIndex.value = currentColIndex.value;
	// 2. Load the cell values into the form variables
	syncUniverToForm();
	// 3. Open the form dialog
	formDialogVisible.value = true;
};

const handleDialogColumnChange = (newVal: number) => {
	// Save current column state first using prevColIndex
	const originalCol = currentColIndex.value;
	currentColIndex.value = prevColIndex.value;
	syncFormToUniver();
	
	// Switch to new column index
	currentColIndex.value = newVal;
	prevColIndex.value = newVal;
	syncUniverToForm();
};


const handleDialogCancel = () => {
	// Discard local changes by syncing from Univer back to form
	isAddingNewProduct.value = false;
	syncUniverToForm();
	formDialogVisible.value = false;
};

const findFirstBlankColumnIndex = (): number => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return -1;
	
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	for (let i = 0; i < formCount.value; i++) {
		const { blockCol, blockStartRow } = getProductCoords(i);
		const nicknameRaw = getValue(blockStartRow + 2, blockCol);
		const cleanNick = getCleanNickname(nicknameRaw, uniqueNicknames.value);
		if (!cleanNick) {
			return i;
		}
	}
	return -1;
};

const handleDialogConfirm = () => {
	if (isAddingNewProduct.value) {
		const blankIdx = findFirstBlankColumnIndex();
		if (blankIdx !== -1) {
			currentColIndex.value = blankIdx;
			prevColIndex.value = blankIdx;
			isAddingNewProduct.value = false;
			ElMessage.success(`已复用空白列 (商品提报 ${blankIdx + 1}) 填充新商品`);
		} else {
			// Append a new product column first
			appendNewProductColumn();
			currentColIndex.value = formCount.value - 1;
			prevColIndex.value = currentColIndex.value;
			isAddingNewProduct.value = false;
		}
	}
	// Save form data to Univer sheet
	syncFormToUniver();
	formDialogVisible.value = false;
	ElMessage.success('表单配置已成功回显到表格！');
	markDirty();
	saveWorkbookData('draft');
};

const handleDialogContinueAdd = () => {
	if (submissionStatus.value === 'submitted') return;
	if (isAddingNewProduct.value) {
		const blankIdx = findFirstBlankColumnIndex();
		if (blankIdx !== -1) {
			currentColIndex.value = blankIdx;
			prevColIndex.value = blankIdx;
			isAddingNewProduct.value = false;
			syncFormToUniver();
			ElMessage.success(`当前商品已成功填充到空白列 (商品提报 ${blankIdx + 1})！可继续修改数据。`);
		} else {
			// 1. Append a new product column first
			appendNewProductColumn();
			currentColIndex.value = formCount.value - 1;
			prevColIndex.value = currentColIndex.value;
			isAddingNewProduct.value = false;
			
			// 2. Save current form data to this new column
			syncFormToUniver();
			ElMessage.success('当前商品已成功新增到表格！可继续修改数据并点击继续新增或确定。');
		}
	} else {
		const blankIdx = findFirstBlankColumnIndex();
		if (blankIdx !== -1) {
			// 1. Save current editing product changes
			syncFormToUniver();
			
			// 2. Reuse the blank column for cloning
			currentColIndex.value = blankIdx;
			prevColIndex.value = blankIdx;
			syncFormToUniver();
			ElMessage.success(`当前商品已保存，并在空白列 (商品提报 ${blankIdx + 1}) 复制新增了一列以供修改！`);
		} else {
			// 1. Save current editing product changes
			syncFormToUniver();
			
			// 2. Append a new product column
			appendNewProductColumn();
			currentColIndex.value = formCount.value - 1;
			prevColIndex.value = currentColIndex.value;
			
			// 3. Save the form data to the new column immediately so it starts with the same values
			syncFormToUniver();
			ElMessage.success('当前商品已保存，并在末尾复制新增了一列以供修改！');
		}
	}
	markDirty();
	saveWorkbookData('draft');
};

const handleBeforeDialogClose = (done: () => void) => {
	handleDialogCancel();
	done();
};

// ========== Form Editor fields ==========
const brandVal = ref('巨子生物 | 可丽金');
const selectedMainProduct = ref<DBProductItem | null>(null);
const mainSpec = ref('');
const efficacyVal = ref('');
const priceVal = ref('');
const startDateVal = ref('2026-05-15 00:00');
const endDateVal = ref('2026-05-31 00:00');
const sellingPointVal = ref('');
const remarksVal = ref('');

// Lists
interface FormGiftItem {
	id: number;
	nickname: string;
	qty: number;
	unit: string;
}
const formGiftItems = ref<FormGiftItem[]>([]);

// VIP Gift
const vipThresholdVal = ref('满 869 元');
const vipValueVal = ref('价值 409 元');
const formVipItems = ref<{ nickname: string; qty: number; unit: string }[]>([]);

// Tiers list
interface FormTierItem {
	id: number;
	threshold: string;
	value: string;
	items: { nickname: string; qty: number; unit: string }[];
}
const formTiers = ref<FormTierItem[]>([]);

// Dropdown search autocomplete states
const mainSearchQuery = ref('');
const showMainDropdown = ref(false);
const matchingMainProducts = ref<DBProductItem[]>([]);

const giftSearchQuery = ref('');
const showGiftDropdown = ref(false);
const matchingGiftProducts = ref<DBProductItem[]>([]);
const showGiftInput = ref(false);

const vipSearchQuery = ref('');
const showVipDropdown = ref(false);
const matchingVipProducts = ref<DBProductItem[]>([]);
const showVipInput = ref(false);

// Tiers search states
const tierSearchQueries = ref<Record<number, string>>({});
const showTierDropdowns = ref<Record<number, boolean>>({});
const showTierInputs = ref<Record<number, boolean>>({});
const matchingTierProducts = ref<Record<number, DBProductItem[]>>({});

// Preview tab data
const previewRows = ref<any[]>([]);
const previewFootnotes = ref<any[]>([]);

const isAddingNewProduct = ref(false);

const resetFormToDefault = () => {
	brandVal.value = '巨子生物 | 可丽金';
	selectedMainProduct.value = null;
	mainSpec.value = '';
	efficacyVal.value = '';
	priceVal.value = '';
	startDateVal.value = '2026-05-15 00:00';
	endDateVal.value = '2026-05-31 00:00';
	sellingPointVal.value = '';
	remarksVal.value = '';
	formGiftItems.value = [];
	vipThresholdVal.value = '满 869 元';
	vipValueVal.value = '价值 409 元';
	formVipItems.value = [];
	formTiers.value = [];
	mainSearchQuery.value = '';
	showMainDropdown.value = false;
	matchingMainProducts.value = [];
	giftSearchQuery.value = '';
	showGiftDropdown.value = false;
	matchingGiftProducts.value = [];
	showGiftInput.value = false;
	vipSearchQuery.value = '';
	showVipDropdown.value = false;
	matchingVipProducts.value = [];
	showVipInput.value = false;
	tierSearchQueries.value = {};
	showTierDropdowns.value = {};
	showTierInputs.value = {};
	matchingTierProducts.value = {};
};

// Helper functions for autocomplete matching
const matchProds = (q: string) => {
	if (!q) return rawProductList.value;
	const lq = q.toLowerCase();
	return rawProductList.value.filter(p =>
		(p.nickname && p.nickname.toLowerCase().includes(lq)) ||
		(p.fullName && p.fullName.toLowerCase().includes(lq))
	);
};

const handleMainSearchInput = (val: string) => {
	mainSearchQuery.value = val;
	matchingMainProducts.value = matchProds(val);
	showMainDropdown.value = true;
};

const selectMainProductFromDropdown = (prod: DBProductItem) => {
	selectedMainProduct.value = prod;
	mainSearchQuery.value = '';
	showMainDropdown.value = false;
	
	// Auto-fill values
	brandVal.value = prod.brand || '巨子生物 | 可丽金';
	mainSpec.value = prod.spec || '';
	efficacyVal.value = '';
	priceVal.value = '';
	sellingPointVal.value = '';
	remarksVal.value = '';
	startDateVal.value = '';
	endDateVal.value = '';
	
	// Reset Gifts
	formGiftItems.value = [];
	
	// Reset Tiers
	formTiers.value = [];
	
	// Reset VIP
	vipThresholdVal.value = '会员满 869 元';
	formVipItems.value = [];
	vipValueVal.value = '价值 409 元';
};

const removeMainProductFromForm = () => {
	selectedMainProduct.value = null;
	mainSpec.value = '';
};

// Gift autocomplete handlers
const handleGiftSearchInput = (val: string) => {
	giftSearchQuery.value = val;
	matchingGiftProducts.value = matchProds(val);
	showGiftDropdown.value = true;
};

const addGiftFromForm = (prod: DBProductItem) => {
	formGiftItems.value.push({
		id: Date.now(),
		nickname: prod.nickname,
		qty: 1,
		unit: prod.spec ? (prod.spec.match(/[a-zA-Z]+|盒|支|片|个|瓶/)?.[0] || '个') : '个'
	});
	giftSearchQuery.value = '';
	showGiftInput.value = false;
	showGiftDropdown.value = false;
};

const removeGiftFromForm = (idx: number) => {
	formGiftItems.value.splice(idx, 1);
};

// VIP autocomplete handlers
const handleVipSearchInput = (val: string) => {
	vipSearchQuery.value = val;
	matchingVipProducts.value = matchProds(val);
	showVipDropdown.value = true;
};

const addVipGiftFromForm = (prod: DBProductItem) => {
	formVipItems.value.push({
		nickname: prod.nickname,
		qty: 1,
		unit: prod.spec ? (prod.spec.match(/[a-zA-Z]+|盒|支|片|个|瓶/)?.[0] || '个') : '个'
	});
	vipSearchQuery.value = '';
	showVipInput.value = false;
	showVipDropdown.value = false;
};

const removeVipGiftFromForm = (idx: number) => {
	formVipItems.value.splice(idx, 1);
};

// Tiers autocomplete handlers
const handleTierSearchInput = (tierId: number, val: string) => {
	tierSearchQueries.value[tierId] = val;
	matchingTierProducts.value[tierId] = matchProds(val);
	showTierDropdowns.value[tierId] = true;
};

const addTierGiftFromForm = (tierId: number, prod: DBProductItem) => {
	const tier = formTiers.value.find(t => t.id === tierId);
	if (tier) {
		tier.items.push({
			nickname: prod.nickname,
			qty: 1,
			unit: prod.spec ? (prod.spec.match(/[a-zA-Z]+|盒|支|片|个|瓶/)?.[0] || '个') : '个'
		});
	}
	tierSearchQueries.value[tierId] = '';
	showTierInputs.value[tierId] = false;
	showTierDropdowns.value[tierId] = false;
};

const removeTierGiftFromForm = (tierId: number, giftIdx: number) => {
	const tier = formTiers.value.find(t => t.id === tierId);
	if (tier) {
		tier.items.splice(giftIdx, 1);
	}
};

const addTierFromForm = () => {
	const newId = formTiers.value.length + 1;
	formTiers.value.push({
		id: newId,
		threshold: '满 369 元',
		value: '价值 143 元',
		items: []
	});
};

const removeTierFromForm = (idx: number) => {
	formTiers.value.splice(idx, 1);
};

// ========== Tiers and VIP Parsing / Formatting ==========
const parseTiersFromText = (text: string): FormTierItem[] => {
	if (!text || text === '***' || text.trim() === '') return [];
	const parts = text.split(/[；;]/);
	const tiers: FormTierItem[] = [];
	
	for (let idx = 0; idx < parts.length; idx++) {
		const part = parts[idx].trim();
		if (!part) continue;
		
		let cleanPart = part.replace(/^[A-H]档:\s*/, '');
		
		let threshold = '满 369 元';
		const thresholdMatch = cleanPart.match(/满(.*?)赠/);
		if (thresholdMatch) {
			threshold = '满 ' + thresholdMatch[1].trim();
		}
		
		let value = '价值 143 元';
		const valueMatch = cleanPart.match(/[（(]价值(.*?)[）)]/);
		if (valueMatch) {
			value = '价值 ' + valueMatch[1].trim();
		}
		
		let itemsText = '';
		const itemsMatch = cleanPart.match(/赠(.*?)[（(]/);
		if (itemsMatch) {
			itemsText = itemsMatch[1].trim();
		} else {
			const index = cleanPart.indexOf('赠');
			if (index !== -1) {
				itemsText = cleanPart.substring(index + 1).trim();
			}
		}
		
		const items: { nickname: string; qty: number; unit: string }[] = [];
		if (itemsText && itemsText !== '—') {
			const segments = itemsText.split(/\s*\|\s*|\s*\+\s*/);
			for (const seg of segments) {
				const s = seg.trim();
				if (!s) continue;
				
				const cleanName = s.replace(/\[\d+\]/g, '').trim();
				const qtyMatch = cleanName.match(/(.*?)\s*[×x]\s*(\d+)\s*(.*)/i);
				if (qtyMatch) {
					items.push({
						nickname: qtyMatch[1].trim(),
						qty: parseInt(qtyMatch[2]) || 1,
						unit: qtyMatch[3].trim() || '个'
					});
				} else {
					items.push({
						nickname: cleanName,
						qty: 1,
						unit: '个'
					});
				}
			}
		}
		
		tiers.push({
			id: idx + 1,
			threshold,
			value,
			items
		});
	}
	return tiers;
};

const formatGiftsToText = (gifts: { name: string; qty: string }[]): string => {
	if (!gifts || gifts.length === 0) return '';
	return gifts.map(g => `🎁 ${g.name} x ${g.qty}`).join(' | ');
};

const formatTiersToText = (tiers: FormTierItem[]): string => {
	if (!tiers || tiers.length === 0) return '';
	const abc = 'ABCDEFGH';
	return tiers.map((t, idx) => {
		const itemsText = t.items.map(g => `${g.nickname} × ${g.qty}${g.unit}`).join(' | ') || '—';
		return `${abc[idx]}档: ${t.threshold}赠 ${itemsText}（${t.value}）`;
	}).join('；');
};

const parseVipGifts = (thresholdText: string) => {
	if (!thresholdText || thresholdText === '***' || thresholdText.trim() === '') {
		return { threshold: '满 869 元', items: [] };
	}
	
	let threshold = '满 869 元';
	const thMatch = thresholdText.match(/满(.*?)(?:赠|$)/);
	if (thMatch) {
		threshold = '满 ' + thMatch[1].trim();
	} else {
		threshold = thresholdText.replace(/^会员\s*/, '');
	}
	
	let giftsText = '';
	const index = thresholdText.indexOf('赠');
	if (index !== -1) {
		giftsText = thresholdText.substring(index + 1).trim();
	}
	
	const items: { nickname: string; qty: number; unit: string }[] = [];
	if (giftsText) {
		const segments = giftsText.split(/\s*\|\s*|\s*\+\s*/);
		for (const seg of segments) {
			const s = seg.trim();
			if (!s) continue;
			
			const cleanName = s.replace(/\[\d+\]/g, '').trim();
			const qtyMatch = cleanName.match(/(.*?)\s*[×x]\s*(\d+)\s*(.*)/i);
			if (qtyMatch) {
				items.push({
					nickname: qtyMatch[1].trim(),
					qty: parseInt(qtyMatch[2]) || 1,
					unit: qtyMatch[3].trim() || '个'
				});
			} else {
				items.push({
					nickname: cleanName,
					qty: 1,
					unit: '个'
				});
			}
		}
	}
	return { threshold, items };
};

const formatVipGiftsToText = (threshold: string, items: any[]): string => {
	const giftsText = items.map(g => `${g.nickname} × ${g.qty}${g.unit}`).join(' | ');
	if (!giftsText) return `会员${threshold}`;
	return `会员${threshold}赠 ${giftsText}`;
};

// ========== REAL-TIME SYNCHRONIZATION ==========
const syncUniverToForm = () => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return;
	
	const idx = currentColIndex.value;
	const { blockCol, blockStartRow } = getProductCoords(idx);
	
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};
	
	brandVal.value = getValue(blockStartRow + 1, blockCol) || '巨子生物 | 可丽金';
	
	const nicknameRaw = getValue(blockStartRow + 2, blockCol);
	const cleanNick = getCleanNickname(nicknameRaw, uniqueNicknames.value);
	selectedMainProduct.value = rawProductList.value.find(p => p.nickname === cleanNick) || null;
	mainSpec.value = getValue(blockStartRow + 4, blockCol) || '';
	
	efficacyVal.value = getValue(blockStartRow + 5, blockCol) || '';
	
	const giftsRaw = getValue(blockStartRow + 6, blockCol);
	formGiftItems.value = parseGiftsFromText(giftsRaw).map((g, i) => ({
		id: i + 1,
		nickname: g.name.replace(/\[\d+\]/g, ''), // 去掉 [编号] 后缀
		qty: parseInt(g.qty) || 1,
		unit: g.qty.replace(/^\d+\s*/, '') || '个'
	}));
	
	const tiersRaw = getValue(blockStartRow + 7, blockCol);
	formTiers.value = parseTiersFromText(tiersRaw);
	
	const vipThresholdRaw = getValue(blockStartRow + 8, blockCol);
	const vipParsed = parseVipGifts(vipThresholdRaw);
	vipThresholdVal.value = vipParsed.threshold;
	formVipItems.value = vipParsed.items;
	vipValueVal.value = getValue(blockStartRow + 9, blockCol) || '价值 409 元';
	
	sellingPointVal.value = getValue(blockStartRow + 10, blockCol) || '';
	priceVal.value = getValue(blockStartRow + 11, blockCol) || '';
	
	const dateRangeStr = getValue(blockStartRow + 12, blockCol) || '';
	if (dateRangeStr.includes('~')) {
		const parts = dateRangeStr.split('~');
		startDateVal.value = parts[0].trim();
		endDateVal.value = parts[1].trim();
	} else {
		startDateVal.value = dateRangeStr.trim() || '2026-05-15 00:00';
		endDateVal.value = dateRangeStr.trim() || '2026-05-31 00:00';
	}
	
	remarksVal.value = cleanFootnotesAndDetails(getValue(blockStartRow + 13, blockCol) || '');
};

const syncFormToUniver = () => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return;
	if (submissionStatus.value === 'submitted') return; // Read-only locked
	
	const idx = currentColIndex.value;
	const { blockCol, blockStartRow } = getProductCoords(idx);
	const theme = currentTheme.value;
	
	const setValue = (r: number, c: number, val: any, styleType: string) => {
		activeSheet.getRange(r, c, 1, 1).setValue({
			v: val,
			s: `${styleType}_${theme}`
		});
	};
	
	isHandlingEvent = true;
		isHandlingEvent = true;
		try {
			setValue(blockStartRow, blockCol, `商品提报 ${idx + 1}`, 'headerStyle');
			setValue(blockStartRow + 1, blockCol, brandVal.value, 'contentCenterStyle');

			// 昵称写入纯文本（不含编号），由 recalculateSuffixesAndFootnotes 统一添加编号
			const mainNick = selectedMainProduct.value ? selectedMainProduct.value.nickname : '';
			const spec = mainSpec.value;
			const nicknameOnly = spec ? `${mainNick}${spec}` : mainNick;
			setValue(blockStartRow + 2, blockCol, nicknameOnly, 'editableCenterStyle');

			const fullName = selectedMainProduct.value ? selectedMainProduct.value.fullName : '';
			setValue(blockStartRow + 3, blockCol, fullName, 'contentLeftStyle');

			setValue(blockStartRow + 4, blockCol, spec, 'contentCenterStyle');

			setValue(blockStartRow + 5, blockCol, efficacyVal.value, 'contentLeftStyle');

			// 赠品/满赠/会员礼写入纯文本（不含编号），由 recalculateSuffixesAndFootnotes 统一添加编号
			const giftsList = formGiftItems.value.map(g => ({ name: g.nickname, qty: `${g.qty}${g.unit}` }));
			const giftsText = formatGiftsToText(giftsList) || '';
			setValue(blockStartRow + 6, blockCol, giftsText, 'editableCenterStyle');

			const tiersText = formatTiersToText(formTiers.value);
			setValue(blockStartRow + 7, blockCol, tiersText, 'editableCenterStyle');

			const vipThreshold = vipThresholdVal.value;
			const vipGiftsText = formatVipGiftsToText(vipThreshold, formVipItems.value);
			setValue(blockStartRow + 8, blockCol, vipGiftsText, 'editableCenterStyle');
			setValue(blockStartRow + 9, blockCol, vipValueVal.value, 'editableCenterStyle');

			setValue(blockStartRow + 10, blockCol, sellingPointVal.value, 'contentLeftStyle_shaded');
			setValue(blockStartRow + 11, blockCol, priceVal.value, 'editableCenterStyle');

			const dateRangeText = (startDateVal.value && endDateVal.value) ? `${startDateVal.value} ~ ${endDateVal.value}` : '';
			setValue(blockStartRow + 12, blockCol, dateRangeText, 'editableCenterStyle');

			setValue(blockStartRow + 13, blockCol, remarksVal.value, 'editableCenterStyle');

			recalculateSuffixesAndFootnotes(activeSheet);

		
		try { activeSheet.autoResizeRows(blockStartRow, 15); } catch (e) { /* ignore */ }
	} finally {
		isHandlingEvent = false;
	}
};

// Legacy switchTab and handlers removed

// ========== Preview Generation ==========
const buildFootnotesList = () => {
	const list: { num: number; nick: string; full: string }[] = [];
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return [];
	
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	const cols: { cleanNick: string; spec: string; blockCol: number; blockStartRow: number }[] = [];
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);
		const nicknameVal = getValue(blockStartRow + 2, blockCol);
		const cleanNick = getCleanNickname(nicknameVal, uniqueNicknames.value);
		if (!cleanNick) continue;
		const specVal = getValue(blockStartRow + 4, blockCol);
		const spec = specVal && typeof specVal === 'object' ? specVal.v : specVal || '';
		cols.push({ cleanNick, spec, blockCol, blockStartRow });
	}

	const nicknameIndexMap: Record<string, number> = {};
	const fullNameIndexMap: Record<string, number> = {};
	let globalIndex = 1;

	for (const config of cols) {
		const prod = getProductByNickAndSpec(config.cleanNick, config.spec);
		const fullName = prod ? prod.fullName : config.cleanNick;
		if (fullName) {
			if (!fullNameIndexMap[fullName]) {
				fullNameIndexMap[fullName] = globalIndex++;
			}
			nicknameIndexMap[config.cleanNick] = fullNameIndexMap[fullName];
		} else {
			if (!nicknameIndexMap[config.cleanNick]) {
				nicknameIndexMap[config.cleanNick] = globalIndex++;
			}
		}
	}

	for (const config of cols) {
		const giftsText = getValue(config.blockStartRow + 6, config.blockCol);
		const thresholdText = getValue(config.blockStartRow + 7, config.blockCol);
		const memberGiftText = getValue(config.blockStartRow + 8, config.blockCol);

		const checkAndRegisterMention = (text: string) => {
			if (!text) return;
			uniqueNicknames.value.forEach(nick => {
				let isMentioned = false;
				if (text.includes(nick)) {
					isMentioned = true;
				} else {
					const keywords = getProductKeywords(nick);
					if (keywords.some(kw => text.includes(kw))) {
						isMentioned = true;
					}
				}

				if (isMentioned) {
					const prod = rawProductList.value.find(p => p.nickname === nick);
					const fullName = prod ? prod.fullName : nick;
					if (fullName) {
						if (!fullNameIndexMap[fullName]) {
							fullNameIndexMap[fullName] = globalIndex++;
						}
						if (!nicknameIndexMap[nick]) {
							nicknameIndexMap[nick] = fullNameIndexMap[fullName];
						}
					}
				}
			});
		};

		checkAndRegisterMention(String(giftsText));
		checkAndRegisterMention(String(thresholdText));
		checkAndRegisterMention(String(memberGiftText));
	}

	const footnotesMap: Record<number, { nick: string; full: string }> = {};
	for (const [nick, num] of Object.entries(nicknameIndexMap)) {
		const prod = rawProductList.value.find(p => p.nickname === nick);
		const fullName = prod ? prod.fullName : nick;
		if (fullName && fullName !== nick) {
			if (!footnotesMap[num]) {
				footnotesMap[num] = { nick, full: fullName };
			}
		}
	}

	const sortedNums = Object.keys(footnotesMap).map(Number).sort((a, b) => a - b);
	for (const num of sortedNums) {
		list.push({
			num,
			nick: footnotesMap[num].nick,
			full: footnotesMap[num].full
		});
	}

	return list;
};

const generatePreviewData = () => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return;
	
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	const columnsData: any[] = [];
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);
		columnsData.push({
			brand: getValue(blockStartRow + 1, blockCol) || '—',
			nickname: getValue(blockStartRow + 2, blockCol) || '—',
			fullName: getValue(blockStartRow + 3, blockCol) || '—',
			spec: getValue(blockStartRow + 4, blockCol) || '—',
			efficacy: getValue(blockStartRow + 5, blockCol) || '—',
			gifts: getValue(blockStartRow + 6, blockCol) || '—',
			tiers: getValue(blockStartRow + 7, blockCol) || '—',
			vipGift: getValue(blockStartRow + 8, blockCol) || '—',
			vipValue: getValue(blockStartRow + 9, blockCol) || '—',
			sellingPoint: getValue(blockStartRow + 10, blockCol) || '—',
			price: getValue(blockStartRow + 11, blockCol) || '—',
			campaignDate: getValue(blockStartRow + 12, blockCol) || '—',
			remarks: getValue(blockStartRow + 13, blockCol) || '—',
		});
	}

	previewRows.value = [
		{ label: getLabelData(1), cols: columnsData.map(c => c.brand) },
		{ label: getLabelData(2), cols: columnsData.map(c => c.nickname) },
		{ label: getLabelData(3), cols: columnsData.map(c => c.fullName) },
		{ label: getLabelData(4), cols: columnsData.map(c => c.spec) },
		{ label: getLabelData(5), cols: columnsData.map(c => c.efficacy) },
		{ label: getLabelData(6), cols: columnsData.map(c => c.gifts) },
		{ label: getLabelData(7), cols: columnsData.map(c => c.tiers) },
		{ label: getLabelData(8), cols: columnsData.map(c => c.vipGift) },
		{ label: getLabelData(9), cols: columnsData.map(c => c.vipValue) },
		{ label: getLabelData(10), cols: columnsData.map(c => c.sellingPoint) },
		{ label: getLabelData(11), cols: columnsData.map(c => c.price !== '—' ? `${c.price} 元` : '—') },
		{ label: getLabelData(12), cols: columnsData.map(c => c.campaignDate) },
		{ label: getLabelData(13), cols: columnsData.map(c => c.remarks) },
	];

	previewFootnotes.value = buildFootnotesList();
};

const copyPreviewText = () => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return;
	
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	const columnsData: any[] = [];
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx);
		columnsData.push({
			brand: getValue(blockStartRow + 1, blockCol) || '—',
			nickname: getValue(blockStartRow + 2, blockCol) || '—',
			fullName: getValue(blockStartRow + 3, blockCol) || '—',
			spec: getValue(blockStartRow + 4, blockCol) || '—',
			efficacy: getValue(blockStartRow + 5, blockCol) || '—',
			gifts: getValue(blockStartRow + 6, blockCol) || '—',
			tiers: getValue(blockStartRow + 7, blockCol) || '—',
			vipGift: getValue(blockStartRow + 8, blockCol) || '—',
			vipValue: getValue(blockStartRow + 9, blockCol) || '—',
			sellingPoint: getValue(blockStartRow + 10, blockCol) || '—',
			price: getValue(blockStartRow + 11, blockCol) || '—',
			campaignDate: getValue(blockStartRow + 12, blockCol) || '—',
			remarks: getValue(blockStartRow + 13, blockCol) || '—',
		});
	}

	const headers = ['配置字段', ...Array.from({ length: formCount.value }, (_, i) => `商品提报 ${i + 1}`)].join('\t');
	
	const rows = [
		[getLabelData(1), ...columnsData.map(c => c.brand)],
		[getLabelData(2), ...columnsData.map(c => c.nickname)],
		[getLabelData(3), ...columnsData.map(c => c.fullName)],
		[getLabelData(4), ...columnsData.map(c => c.spec)],
		[getLabelData(5), ...columnsData.map(c => c.efficacy)],
		[getLabelData(6), ...columnsData.map(c => c.gifts)],
		[getLabelData(7), ...columnsData.map(c => c.tiers)],
		[getLabelData(8), ...columnsData.map(c => c.vipGift)],
		[getLabelData(9), ...columnsData.map(c => c.vipValue)],
		[getLabelData(10), ...columnsData.map(c => c.sellingPoint)],
		[getLabelData(11), ...columnsData.map(c => c.price !== '—' ? `${c.price} 元` : '—')],
		[getLabelData(12), ...columnsData.map(c => c.campaignDate)],
		[getLabelData(13), ...columnsData.map(c => c.remarks)],
	];

	const footnotes = buildFootnotesList();

	const lines = [
		headers,
		...rows.map(r => r.join('\t')),
		'',
		...footnotes.map(n => `[${n.num}] ${n.nick} 为产品昵称，产品备案全称为 ${n.full}`)
	];

	navigator.clipboard.writeText(lines.join('\n')).then(() => {
		ElMessage.success('已复制对比文本数据到剪贴板！');
	}).catch(() => {
		ElMessage.error('复制失败，请手动选择文本进行复制');
	});
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

const getLabelData = (rowNum: number) => {
	const labels = TEMPLATE_LABELS[currentTemplateType.value] || TEMPLATE_LABELS['main_image'];
	return labels[rowNum] || '';
};

const updateSheetLabels = () => {
	if (!sheet) return;
	const theme = currentTheme.value;
	isHandlingEvent = true;
	try {
		const totalBlocks = Math.ceil(formCount.value / 6);
		for (let blockIdx = 0; blockIdx < totalBlocks; blockIdx++) {
			const blockStartRow = blockIdx * 15;
			sheet.getRange(blockStartRow, 0, 1, 1).setValue({ v: '配置字段', s: `headerStyle_${theme}` });
			for (let r = 1; r <= 13; r++) {
				const labelText = getLabelData(r);
				sheet.getRange(blockStartRow + r, 0, 1, 1).setValue({ v: labelText, s: `labelStyle_${theme}` });
			}
		}
	} finally {
		isHandlingEvent = false;
	}
};

watch(currentTemplateType, () => {
	updateSheetLabels();
});

	watch([submissionName, submissionShop], () => {
		markDirty();
	});

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
			0: { v: getLabelData(Number(row)), s: 'labelStyle_proya' },
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

	try {
		updateSheetLabels();
	} catch (err) {
		console.warn('更新工作表模板标签失败:', err);
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

	univerAPI.addEvent(univerAPI.Event.BeforeSheetEditStart, (params: any) => {
		params.cancel = true; // Block direct sheet editing always
		
		if (submissionStatus.value === 'submitted') {
			ElMessage.warning('当前提报已正式提交归档锁定，仅支持查看与导出！');
			return;
		}
		
		const row = params.row;
		const col = params.column;
		const blockIndex = Math.floor(row / 15);
		const relativeRow = row % 15;
		const productIndex = blockIndex * 6 + (col - 1);

		if (col >= 1 && col <= 6 && relativeRow !== 14 && productIndex >= 0 && productIndex < formCount.value) {
			currentEditingCell.value = { row, col };
			currentColIndex.value = productIndex;
			prevColIndex.value = productIndex;
			isAddingNewProduct.value = false;
			
			syncUniverToForm();
			formDialogVisible.value = true;
		}
	});

	univerAPI.addEvent(univerAPI.Event.CommandExecuted, (params: any) => {
		if (params && params.id && (params.id.includes('remove-col') || params.id.includes('delete-col'))) {
			console.log('Detected column removal command:', params);
			let deletedCount = 1;
			if (params.params && params.params.range) {
				const startCol = params.params.range.startColumn;
				const endCol = params.params.range.endColumn;
				deletedCount = endCol - startCol + 1;
			}
			
			if (formCount.value > deletedCount) {
				formCount.value -= deletedCount;
			} else {
				formCount.value = 1;
			}
			
			try {
				recalculateSuffixesAndFootnotes(sheet);
			} catch (err) {
				console.warn('Recalculate suffixes failed:', err);
			}
			
			markDirty();
			saveWorkbookData('draft');
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
			activeSheet.getRange(blockStartRow + r, 0, 1, 1).setValue({ v: getLabelData(r), s: `labelStyle_${theme}` });
		}
	}

	activeSheet.getRange(blockStartRow, blockCol, 1, 1).setValue({ v: `商品提报 ${idx + 1}`, s: `headerStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 1, blockCol, 1, 1).setValue({ v: '', s: `contentCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 2, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 3, blockCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 4, blockCol, 1, 1).setValue({ v: '', s: `contentCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 5, blockCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 6, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 7, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 8, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 9, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 10, blockCol, 1, 1).setValue({ v: '', s: `contentLeftStyle_shaded_${theme}` });
	activeSheet.getRange(blockStartRow + 11, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 12, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });
	activeSheet.getRange(blockStartRow + 13, blockCol, 1, 1).setValue({ v: '', s: `editableCenterStyle_${theme}` });

	formCount.value++;
	activeSheet.showColumns(blockCol, 1);
	try { activeSheet.autoResizeRows(blockStartRow, 15); } catch (e) { /* ignore */ }
	window.dispatchEvent(new Event('resize'));
	ElMessage.success(`已追加第 ${formCount.value} 列商品配置项`);
	markDirty();
};

// ========== 保存入库 ==========
// ========== 保存入库 ==========
const saveWorkbookData = async (statusVal: string = 'draft') => {
	if (isSaving.value) return;
	isSaving.value = true;
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

	if (productsList.length === 0 && statusVal === 'submitted') {
		ElMessage.warning('当前没有已填写的有效产品卡片数据！');
		isSaving.value = false;
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
				formCount: formCount.value,
				templateType: currentTemplateType.value
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
				isDirty.value = false;
				lastSavedAt.value = new Date();
		} else {
			throw new Error(result.msg || '保存失败');
		}
	} catch (err: any) {
		ElMessage.error(`保存失败: ${err.message || '网络连接错误'}`);
		console.log('本地结构化备份数据:', productsList);
	} finally {
		isSaving.value = false;
	}
};

// ========== 自动保存 ==========
	const formatTime = (date: Date | null): string => {
		if (!date) return '';
		return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	};

	const markDirty = () => {
		if (submissionStatus.value === 'submitted') return;
		isDirty.value = true;
		resetAutoSaveTimer();
	};

	const resetAutoSaveTimer = () => {
		if (autoSaveTimer.value) clearTimeout(autoSaveTimer.value);
		autoSaveTimer.value = setTimeout(autoSave, AUTO_SAVE_INTERVAL);
	};

	const autoSave = async () => {
		if (!isDirty.value || isSaving.value || submissionStatus.value === 'submitted') return;
		await saveWorkbookData('draft');
	};

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		if (isDirty.value && submissionStatus.value !== 'submitted') {
			event.preventDefault();
			event.returnValue = '';
		}
	};

// ========== 提交前校验 ==========
	const validationDialogVisible = ref(false);
	const validationErrors = ref<ValidationError[]>([]);
	const validationWarnings = ref<ValidationError[]>([]);

	const validateBeforeSubmit = (): ValidationResult => {
		const errors: ValidationError[] = [];
		const warnings: ValidationError[] = [];

		// 1. 提报级校验
		if (!submissionName.value.trim()) {
			errors.push({ productIndex: -1, productLabel: '提报信息', field: 'name', fieldLabel: '提报名称', rule: 'required', message: '提报名称不能为空' });
		}
		if (!submissionShop.value.trim()) {
			errors.push({ productIndex: -1, productLabel: '提报信息', field: 'shop', fieldLabel: '提报店铺', rule: 'required', message: '提报店铺不能为空' });
		}

		// 2. 产品级校验
		const activeSheet = workbook?.getActiveSheet();
		if (!activeSheet) {
			errors.push({ productIndex: -1, productLabel: '系统', field: 'sheet', fieldLabel: '工作表', rule: 'required', message: '工作表未加载' });
			return { valid: false, errors, warnings };
		}

		const getValue = (r: number, c: number) => {
			const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
			return cell && typeof cell === 'object' ? cell.v : cell || '';
		};

		let hasAnyProduct = false;

		for (let idx = 0; idx < formCount.value; idx++) {
			const { blockCol, blockStartRow } = getProductCoords(idx);
			const nickname = getCleanNickname(getValue(blockStartRow + 2, blockCol), uniqueNicknames.value);
			if (!nickname) continue;
			hasAnyProduct = true;
			const label = `商品提报 ${idx + 1}`;

			// 必填字段
			const requiredFields = [
				{ row: 1, field: 'brand', label: '品牌' },
				{ row: 3, field: 'fullName', label: '官方全称' },
				{ row: 4, field: 'spec', label: '规格' },
			];
			for (const f of requiredFields) {
				const val = getValue(blockStartRow + f.row, blockCol);
				if (!val || (typeof val === 'string' && !val.trim()) || val === '***') {
					errors.push({ productIndex: idx, productLabel: label, field: f.field, fieldLabel: f.label, rule: 'required', message: `${label} 的「${f.label}」不能为空` });
				}
			}

			// 价格校验
			const priceVal = getValue(blockStartRow + 11, blockCol);
			if (!priceVal || (typeof priceVal === 'string' && !priceVal.trim()) || priceVal === '***') {
				errors.push({ productIndex: idx, productLabel: label, field: 'price', fieldLabel: '提报价格', rule: 'required', message: `${label} 的「提报价格」不能为空` });
			} else {
				const priceNum = parseFloat(String(priceVal).replace(/[^\d.]/g, ''));
				if (isNaN(priceNum) || priceNum <= 0) {
					errors.push({ productIndex: idx, productLabel: label, field: 'price', fieldLabel: '提报价格', rule: 'format', message: `${label} 的「提报价格」必须为大于0的数值` });
				}
			}

			// 日期校验
			const dateRangeStr = getValue(blockStartRow + 12, blockCol) || '';
			if (!dateRangeStr.trim() || dateRangeStr === '***') {
				errors.push({ productIndex: idx, productLabel: label, field: 'dateRange', fieldLabel: '活动时间', rule: 'required', message: `${label} 的「活动时间」不能为空` });
			} else if (dateRangeStr.includes('~')) {
				const parts = dateRangeStr.split('~').map((s: string) => s.trim());
				const dateRegex = /^\d{4}-\d{2}-\d{2}(\s\d{2}:\d{2})?$/;
				if (!dateRegex.test(parts[0]) || !dateRegex.test(parts[1])) {
					errors.push({ productIndex: idx, productLabel: label, field: 'dateRange', fieldLabel: '活动时间', rule: 'format', message: `${label} 的「活动时间」格式不正确，应为 YYYY-MM-DD HH:MM ~ YYYY-MM-DD HH:MM` });
				} else {
					const start = new Date(parts[0]);
					const end = new Date(parts[1]);
					if (start > end) {
						errors.push({ productIndex: idx, productLabel: label, field: 'dateRange', fieldLabel: '活动时间', rule: 'range', message: `${label} 的活动开始时间不能晚于结束时间` });
					}
				}
			}

			// 警告级字段
			const warningFields = [
				{ row: 5, field: 'efficacy', label: '功效' },
				{ row: 6, field: 'gifts', label: '赠品' },
				{ row: 10, field: 'sellingPoint', label: '卖点' },
			];
			for (const f of warningFields) {
				const val = getValue(blockStartRow + f.row, blockCol);
				if (!val || (typeof val === 'string' && !val.trim()) || val === '***') {
					warnings.push({ productIndex: idx, productLabel: label, field: f.field, fieldLabel: f.label, rule: 'required', message: `${label} 的「${f.label}」为空，建议补充` });
				}
			}
		}

		if (!hasAnyProduct) {
			errors.push({ productIndex: -1, productLabel: '提报信息', field: 'products', fieldLabel: '产品数据', rule: 'required', message: '至少需要填写1个有效产品' });
		}

		return { valid: errors.length === 0, errors, warnings };
	};

	const confirmAndSubmit = () => {
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
		}).catch(() => {});
	};

	const submitWorkbookData = () => {
		const result = validateBeforeSubmit();
		if (!result.valid) {
			validationErrors.value = result.errors;
			validationWarnings.value = result.warnings;
			validationDialogVisible.value = true;
			return;
		}
		if (result.warnings.length > 0) {
			validationErrors.value = [];
			validationWarnings.value = result.warnings;
			validationDialogVisible.value = true;
			return;
		}
		confirmAndSubmit();
	};;

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
		headers.push(getLabelData(r));
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
		window.addEventListener('beforeunload', handleBeforeUnload);

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
			dbList.forEach((item: any) => {
				const nickname = item.nickname || item.product_name;
				if (!nickname) return;

				list.push({
					nickname: nickname,
					brand: item.brand || '',
					fullName: item.product_name || '',
					spec: item.specification || '',
				});

				if (item.keywords) {
					PRODUCT_KEYWORDS.value[nickname] = item.keywords.split(',');
				}
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
			currentTemplateType.value = result.data.templateType || 'main_image';
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
			currentTemplateType.value = 'main_image';
			initUniver();
		}
	} catch (err) {
		console.warn('加载后端规格数据失败，将初始化默认模版:', err);
		initUniver();
	}

	// Setup click listener to close dropdowns
	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (!target.closest('.prod-search-wrap')) {
			showMainDropdown.value = false;
			showGiftDropdown.value = false;
			showVipDropdown.value = false;
			Object.keys(showTierDropdowns.value).forEach(key => {
				showTierDropdowns.value[Number(key)] = false;
			});
		}
	}, true);

	// Initial sync from Univer to form
	try {
		syncUniverToForm();
	} catch (err) {
		console.warn('初始化表单同步数据失败:', err);
	}
});

onBeforeUnmount(() => {
	document.removeEventListener('input', handleEditorInput, true);
		window.removeEventListener('beforeunload', handleBeforeUnload);
		if (autoSaveTimer.value) { clearTimeout(autoSaveTimer.value); autoSaveTimer.value = null; }

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
	background: #f1f5f9;
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

/* Dialog Form Styles */
.form-container-dialog {
	max-width: 100%;
	margin: 0 auto;
}

.dialog-form-scroll-body {
	max-height: 60vh;
	overflow-y: auto;
	padding: 4px;
	margin-top: 12px;
}

.product-spec-form-dialog :deep(.el-dialog__body) {
	background: #f8fafc;
	padding: 16px 20px;
}

.form-toolbar {
	display: flex;
	align-items: center;
	margin-bottom: 16px;
	padding: 12px 16px;
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.selector-label {
	font-size: 13px;
	font-weight: 600;
	color: #334155;
}

.section-label {
	font-size: 11px;
	font-weight: 700;
	letter-spacing: 0.08em;
	text-transform: uppercase;
	color: #64748b;
	margin-bottom: 12px;
	padding-bottom: 6px;
	border-bottom: 1px solid #f1f5f9;
}

.card {
	background: #ffffff;
	border: 1px solid #e2e8f0;
	border-radius: 8px;
	padding: 20px 24px;
	margin-bottom: 16px;
	box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
}

.field-row {
	display: grid;
	grid-template-columns: 140px 1fr;
	gap: 16px;
	align-items: start;
	padding: 10px 0;
	border-bottom: 1px solid #f1f5f9;
}

.field-row:last-child {
	border-bottom: none;
}

.field-label {
	font-size: 13px;
	color: #475569;
	font-weight: 500;
	padding-top: 6px;
	line-height: 1.4;
}

.field-value {
	font-size: 13px;
	color: #0f172a;
}

.field-value input[type="text"],
.field-value input[type="number"],
.field-value textarea {
	width: 100%;
	font-size: 13px;
	padding: 6px 12px;
	border: 1px solid #cbd5e1;
	border-radius: 6px;
	background: #ffffff;
	color: #0f172a;
	transition: all 0.2s ease;
	outline: none;
}

.field-value input[type="text"]:focus,
.field-value input[type="number"]:focus,
.field-value textarea:focus {
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.field-value textarea {
	resize: vertical;
	min-height: 60px;
}

/* Product Search Dropdown */
.prod-search-wrap {
	position: relative;
	width: 100%;
}

.prod-search-input {
	width: 100%;
	font-size: 13px;
	padding: 6px 12px;
	border: 1px solid #cbd5e1;
	border-radius: 6px;
	background: #ffffff;
	color: #0f172a;
	outline: none;
	transition: all 0.2s ease;
}

.prod-search-input:focus {
	border-color: #3b82f6;
	box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.dropdown {
	position: absolute;
	top: calc(100% + 4px);
	left: 0;
	right: 0;
	background: #ffffff;
	border: 1px solid #cbd5e1;
	border-radius: 6px;
	z-index: 199;
	max-height: 200px;
	overflow-y: auto;
	box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.dropdown-item {
	padding: 8px 12px;
	cursor: pointer;
	font-size: 13px;
	border-bottom: 1px solid #f1f5f9;
}

.dropdown-item:last-child {
	border-bottom: none;
}

.dropdown-item:hover {
	background: #f1f5f9;
}

.dropdown-item .dn {
	font-weight: 600;
	color: #0f172a;
}

.dropdown-item .df {
	font-size: 11px;
	color: #64748b;
	margin-top: 2px;
}

/* Tag Styles */
.tag-list {
	display: flex;
	flex-wrap: wrap;
	gap: 8px;
}

.tag {
	display: inline-flex;
	align-items: center;
	gap: 6px;
	background: #f1f5f9;
	border: 1px solid #e2e8f0;
	border-radius: 6px;
	padding: 4px 10px;
	font-size: 12px;
	color: #1e293b;
	font-weight: 500;
}

.tag .qty {
	display: inline-flex;
	align-items: center;
	gap: 4px;
}

.tag .qty input {
	width: 44px;
	font-size: 12px;
	padding: 2px 4px;
	border: 1px solid #cbd5e1;
	border-radius: 4px;
	background: #ffffff;
	color: #0f172a;
	text-align: center;
	outline: none;
}

.tag-del {
	cursor: pointer;
	color: #94a3b8;
	font-size: 16px;
	line-height: 1;
	background: none;
	border: none;
	padding: 0 2px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	transition: all 0.2s ease;
}

.tag-del:hover {
	color: #ef4444;
}

/* Tier Block Styles */
.tier-block {
	background: #f8fafc;
	border-radius: 8px;
	padding: 12px 16px;
	margin-bottom: 12px;
	border: 1px solid #e2e8f0;
}

.tier-header {
	display: flex;
	align-items: center;
	gap: 10px;
	margin-bottom: 10px;
}

.tier-name {
	font-size: 12px;
	font-weight: 700;
	color: #334155;
}

.tier-header input {
	padding: 4px 8px;
	font-size: 12px;
	border: 1px solid #cbd5e1;
	border-radius: 4px;
	background: #ffffff;
	outline: none;
}

.tier-header input:focus {
	border-color: #3b82f6;
}

.tier-del {
	margin-left: auto;
	cursor: pointer;
	font-size: 12px;
	font-weight: 600;
	color: #94a3b8;
	background: none;
	border: none;
	padding: 0;
	transition: color 0.2s ease;
}

.tier-del:hover {
	color: #ef4444;
}

.btn-add {
	font-size: 12px;
	color: #64748b;
	background: #ffffff;
	border: 1px dashed #cbd5e1;
	border-radius: 6px;
	padding: 6px 12px;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 6px;
	font-weight: 500;
	transition: all 0.2s ease;
}

.btn-add:hover {
	color: #4f46e5;
	border-color: #4f46e5;
	background: #f5f3ff;
}

.form-submit-row {
	display: flex;
	justify-content: flex-end;
	margin-top: 16px;
}

.btn-primary {
	background: #ffffff;
	border: 1px solid #4f46e5;
	border-radius: 6px;
	padding: 8px 20px;
	font-size: 13px;
	font-weight: 600;
	cursor: pointer;
	color: #4f46e5;
	transition: all 0.2s ease;
	outline: none;
}

.btn-primary:hover {
	background: #f5f3ff;
}

/* Preview Styles */
.preview-area {
	flex: 1;
	overflow-y: auto;
	padding: 24px;
	background: #f8fafc;
}

.preview-container {
	max-width: 1000px;
	margin: 0 auto;
}

.preview-scroll-wrapper {
	width: 100%;
	overflow-x: auto;
	border-radius: 6px;
	border: 1px solid #e2e8f0;
	margin-bottom: 16px;
}

.preview-table {
	width: 100%;
	border-collapse: collapse;
	font-size: 13px;
	background: #ffffff;
	text-align: left;
}

.preview-table th,
.preview-table td {
	padding: 10px 14px;
	border-bottom: 1px solid #e2e8f0;
}

.preview-table th {
	background: #f1f5f9;
	font-weight: 700;
	color: #334155;
	white-space: nowrap;
}

.preview-table td:first-child {
	font-weight: 600;
	color: #475569;
	background: #f8fafc;
	width: 160px;
	min-width: 160px;
	border-right: 1px solid #e2e8f0;
}

.preview-table tr:last-child td {
	border-bottom: none;
}

.footnote-block {
	background: #f1f5f9;
	border-radius: 6px;
	padding: 14px 16px;
	margin-top: 16px;
	font-size: 12px;
	color: #475569;
	line-height: 1.6;
	border: 1px solid #e2e8f0;
}

.footnote-title {
	font-size: 11px;
	font-weight: 700;
	color: #64748b;
	margin-bottom: 8px;
	text-transform: uppercase;
	letter-spacing: 0.05em;
}

.footnote-item {
	margin-bottom: 4px;
}

.footnote-item:last-child {
	margin-bottom: 0;
}

.footnote-item strong {
	color: #0f172a;
	font-weight: 600;
}

.text-gray {
	color: #94a3b8;
	font-style: italic;
}

.preview-actions {
	display: flex;
	gap: 12px;
	justify-content: flex-end;
	margin-top: 16px;
}

.amt-input {
	font-size: 13px;
	padding: 5px 8px;
}
</style>