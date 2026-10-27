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
					<div class="logo-icon" aria-hidden="true">
						<el-icon v-if="templateIcon"><component :is="templateIcon" /></el-icon>
					</div>
					<div class="title-container">
						<h1 ref="logoTextRef" v-if="!submissionId">美妆活动提报配置</h1>
						<input
							v-else-if="isEditingSubmissionName"
							ref="submissionNameInputRef"
							v-model="submissionNameDraft"
							class="submission-name-input"
							maxlength="100"
							@blur="commitSubmissionNameEdit"
							@keydown.enter.prevent="commitSubmissionNameEdit"
							@keydown.esc.prevent="cancelSubmissionNameEdit"
						/>
						<h1
							v-else
							ref="logoTextRef"
							:class="{ 'editable-title': canEditSubmission }"
							:title="canEditSubmission ? '双击修改提报名称' : ''"
							@dblclick="startSubmissionNameEdit"
						>
							{{ submissionName || '未命名提报' }}
						</h1>
						<p class="template-summary">
							<span v-if="templateName">{{ templateName }}</span>
							<span v-if="templateRemark">{{ templateRemark }}</span>
							<span v-if="!templateName && !submissionId">可视化活动矩阵提报系统</span>
						</p>
						<div v-if="submissionId" class="submission-context" aria-label="提报基础信息">
							<div class="submission-context-item">
								<span class="submission-context-label">平台</span>
								<strong class="submission-context-value">{{ submissionPlatform || '-' }}</strong>
							</div>
							<div class="submission-context-divider" aria-hidden="true"></div>
							<div class="submission-context-item">
								<span class="submission-context-label">店铺</span>
								<strong class="submission-context-value">{{ submissionShop || '-' }}</strong>
							</div>
						</div>
					</div>
					<!-- 状态标识 -->
					<div class="status-badge-container" v-if="showSubmissionStatus">
						<el-tag :type="submissionStatus === 'submitted' ? 'success' : 'info'" size="small" effect="dark">
							{{ submissionStatus === 'submitted' ? '已提交' : '草稿' }}
						</el-tag>
					</div>
				</div>
				<div class="actions-area">
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

					<span v-if="savedAtText" class="spec-saved-hint">已保存 {{ savedAtText }}</span>
					<el-button v-if="canEditSubmission" type="primary" size="small" :icon="Plus" @click="handleQuickAdd">新增产品</el-button>
					<el-button v-if="canEditSubmission" type="info" size="small" :icon="CopyDocument" @click="openBatchApplyDialog">批量应用</el-button>
					<el-button v-if="canEditSubmission && lastBatchApplyUndo?.cells.length" size="small" :icon="RefreshLeft" @click="undoLastBatchApply">撤销批量</el-button>
					<el-button v-if="canEditSubmission" type="success" size="small" :icon="FolderChecked" :loading="isSaving" @click="saveWorkbookData('draft')">保存草稿</el-button>
					<el-button v-if="canEditSubmission && submissionStatus === 'draft' && submissionId" type="danger" size="small" :icon="Checked" :loading="isSaving" @click="submitWorkbookData">正式提交</el-button>
					<el-button v-if="canShareSubmission" type="primary" size="small" :icon="Link" :loading="isSharing" @click="handleShareLink">分享链接</el-button>
					<el-button type="warning" size="small" :icon="Download" @click="exportToCSV">导出数据</el-button>
				</div>
			</div>

			<!-- Univer 表格渲染区域 -->
			<div class="univer-area">
				<div class="univer-wrapper" ref="univerWrapperRef">
					<div id="univer-container" ref="univerContainerRef" style="width: 100%; height: 100%"></div>
					<div v-if="productCopyButtons.length" class="product-copy-buttons" aria-label="复制商品提报">
						<button
							v-for="button in productCopyButtons"
							:key="button.index"
							class="product-copy-button"
							type="button"
							:title="`复制 ${getProductDisplayLabel(button.index)}`"
							:aria-label="`复制 ${getProductDisplayLabel(button.index)}`"
							:disabled="!canEditSubmission"
							:style="{
								left: `${button.left}px`,
								top: `${button.top}px`,
								width: `${button.size}px`,
								height: `${button.size}px`,
								'--copy-icon-size': `${button.iconSize}px`,
							}"
							@click.stop.prevent="duplicateProductCard(button.index)"
						>
							<el-icon><CopyDocument /></el-icon>
						</button>
					</div>
				</div>
			</div>

			<!-- 快捷表单填写弹窗 -->
			<el-dialog
				v-model="formDialogVisible"
				:fullscreen="formDialogMaximized"
				:draggable="!formDialogMaximized"
				:close-on-click-modal="false"
				:close-on-press-escape="false"
				:before-close="handleBeforeDialogClose"
				class="product-spec-form-dialog"
				@keydown.esc.stop.prevent="handleFormDialogEscape"
				@opened="handleFormDialogOpened"
			>
				<template #header>
					<div class="product-spec-dialog-header">
						<span>{{ isAddingNewProduct ? '快捷新增商品提报' : '快捷填写商品提报' }}</span>
						<el-button
							text
							circle
							size="small"
							:icon="formDialogMaximized ? ScaleToOriginal : FullScreen"
							:title="formDialogMaximized ? '还原窗口大小' : '全屏显示'"
							:aria-label="formDialogMaximized ? '还原窗口大小' : '全屏显示'"
							@click.stop="toggleFormDialogFullscreen"
						/>
					</div>
				</template>
				<div class="form-container-dialog">
					<div class="form-toolbar form-dialog-toolbar">
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
									:label="getProductDisplayLabel(idx - 1)"
								/>
							</el-select>
						</template>
						<span class="selector-label" style="margin-left: 4px;">提报名称：</span>
						<el-input
							v-model="columnNameDraft"
							size="default"
							placeholder="留空则按主品简称自动命名"
							clearable
							style="width: 220px;"
							maxlength="50"
							@blur="validateColumnNameDraft"
							@keydown.enter.prevent="validateColumnNameDraft"
						/>
					</div>

					<div ref="dialogFormScrollBodyRef" class="dialog-form-scroll-body">
						<div class="card">
							<div v-if="hasField('brand')" class="field-row" data-field-key="brand" tabindex="-1">
								<div class="field-label">{{ labelOf('brand') }}</div>
								<div class="field-value">
									<input type="text" v-model="brandVal" class="amt-input" style="width:100%">
								</div>
							</div>

							<div class="field-row" data-field-key="nickname" tabindex="-1">
								<div class="field-label">{{ labelOf('nickname') }}</div>
								<div class="field-value">
									<div class="prod-search-wrap">
										<input type="text" class="prod-search-input" v-model="mainSearchQuery"
											placeholder="搜索产品昵称、名称或编码..."
											@input="handleMainSearchInput($event.target.value)"
											@focus="handleMainSearchInput(mainSearchQuery)"
											@click="handleMainSearchInput(mainSearchQuery)"
											autocomplete="off">
										<div class="dropdown product-dropdown" v-if="showMainDropdown && matchingMainProducts.length">
											<div class="product-option-header">
												<span>显示名称</span>
												<span>官方全称</span>
												<span>编码</span>
												<span>规格</span>
											</div>
											<div
												class="dropdown-item product-option-row"
												v-for="p in matchingMainProducts"
												:key="getProductSelectionKey(p)"
												@click="selectMainProductFromDropdown(p)"
											>
												<div class="product-option-name" :title="p.nickname">{{ p.nickname }}</div>
												<div class="product-option-full-name" :title="p.fullName">{{ p.fullName || '-' }}</div>
												<div class="product-option-code" :title="p.productCode">
													<span v-if="p.productCode">{{ p.productCode }}</span>
													<span v-else>-</span>
												</div>
												<div class="product-option-spec" :title="p.spec">
													<span v-if="p.spec">{{ p.spec }}</span>
													<span v-else>-</span>
												</div>
											</div>
										</div>
										<div class="dropdown-empty" v-else-if="showMainDropdown && mainSearchQuery.trim()">
											没有该产品请先维护
										</div>
									</div>
                                    <div id="main-prod-tag" class="selected-product-list" v-if="formMainProducts.length">
                                        <div class="selected-product-list-title">已选产品</div>
                                        <div class="selected-product-card main-product-card" v-for="(item, idx) in formMainProducts" :key="item.key">
                                            <div class="selected-product-name-wrap">
                                                <span class="selected-product-index">{{ idx + 1 }}</span>
                                                <span class="selected-product-name">{{ item.nickname }}</span>
												<span v-if="item.spec" class="selected-product-spec">规格：{{ item.spec }}</span>
                                            </div>
                                            <div class="selected-product-qty">
                                                <span class="selected-product-multiply">×</span>
                                                <input type="number" min="1" v-model.number="item.qty">
                                                <input type="text" v-model="item.unit" class="unit-input">
                                            </div>
                                            <button class="tag-del selected-product-remove" @click="removeMainProductFromForm(idx)" aria-label="移除">×</button>
                                        </div>
                                    </div>
								</div>
							</div>

							<div class="field-row" data-field-key="fullName" tabindex="-1">
								<div class="field-label">{{ labelOf('fullName') }}</div>
								<div class="field-value">
									<div style="font-size:13px;color:var(--color-text-secondary);">
										{{ mainProductFullNames || '选择产品后自动带出' }}
									</div>
								</div>
							</div>

							<EfficacyEditor
								v-model="formEfficacyItems"
								:label="labelOf('efficacy')"
								:start-number="formEfficacyStartNumber"
								:assistant-text="formEfficacyAssistantText"
								:editable="canEditSubmission"
								@copy-assistant="copyEfficacyAssistant"
							/>

							<div
								v-if="hasField('price') || hasField('dateRange')"
								:class="['field-row', 'field-row-inline', { 'field-row-inline--single': hasField('price') !== hasField('dateRange') }]"
							>
								<div v-if="hasField('price')" class="field-inline-item" data-field-key="price" tabindex="-1">
									<div class="field-label">{{ labelOf('price') }}</div>
									<div class="field-value">
										<input type="number" v-model="priceVal" style="width:90px;font-size:13px;">
										<span style="font-size:12px;color:var(--color-text-secondary);margin-left:6px;">元</span>
									</div>
								</div>

								<div v-if="hasField('dateRange')" class="field-inline-item" data-field-key="dateRange" tabindex="-1">
									<div class="field-label">{{ labelOf('dateRange') }}</div>
									<div class="field-value">
										<el-date-picker
											v-model="dateRangeVal"
											type="datetimerange"
											range-separator="~"
											start-placeholder="开始时间"
											end-placeholder="结束时间"
											format="YYYY-MM-DD HH:mm"
											value-format="YYYY-MM-DD HH:mm"
											style="width: 100%;"
										/>
									</div>
								</div>
							</div>
						</div>

						<div class="card" data-field-key="gifts" tabindex="-1">
							<div class="section-label">{{ labelOf('gifts') }}</div>
							<GiftStrategyEditor
								v-model="formGiftStrategies"
								:products="rawProductList"
							/>
						</div>

						<div v-if="hasField('thresholdA')" class="card" data-field-key="thresholdA" tabindex="-1">
							<div class="section-label">{{ labelOf('thresholdA') }}</div>
							<div id="tier-list">
								<div class="tier-block" v-for="(tier, idx) in formTiers" :key="tier.id">
                                    <div class="tier-header">
                                        <span class="tier-name">{{ 'ABCDEFGH'[idx] }}档</span>
                                        <label class="tier-field">
                                            <span>门槛</span>
                                            <input type="text" v-model="tier.threshold" class="tier-input" placeholder="满xxx元">
                                        </label>
                                        <label class="tier-field">
                                            <span>价值</span>
                                            <input type="text" v-model="tier.value" class="tier-input" placeholder="按零售价自动计算">
                                        </label>
                                        <button class="tier-del" @click="removeTierFromForm(idx)">× 删除</button>
                                    </div>
									<div class="tag-list" style="margin-bottom: 6px;">
										<div class="selected-product-list compact-product-list" v-if="tier.items.length">
											<div class="tier-product-card" v-for="(g, i) in tier.items" :key="`${g.productCode}_${i}`">
												<span class="selected-product-index">{{ i + 1 }}</span>
												<div class="tier-product-name">
													<small>满赠商品</small>
													<strong :title="g.nickname">{{ g.nickname }}</strong>
												</div>
												<label class="tier-product-field">
													<span>赠品规格</span>
													<input type="text" v-model="g.spec">
												</label>
												<label class="tier-product-field tier-product-quantity">
													<span>数量</span>
													<div>
														<input type="number" min="1" v-model.number="g.qty">
														<input type="text" v-model="g.unit">
													</div>
												</label>
												<div class="tier-product-price">
													<small>零售价</small>
													<span>{{ formatRetailPrice(g.retailPrice) }}</span>
												</div>
												<button class="tag-del selected-product-remove" @click="removeTierGiftFromForm(tier.id, i)" aria-label="移除">×</button>
											</div>
										</div>
									</div>
									<div class="tier-gift-add-row">
										<ProductSearchPicker
											v-model="tierSelectedProductKeys[tier.id]"
											:products="rawProductList"
										/>
										<el-button :icon="Plus" @click="addSelectedTierGiftFromForm(tier.id)">
											添加赠品
										</el-button>
									</div>
								</div>
							</div>
							<button class="btn-add" @click="addTierFromForm" style="margin-top:4px;">
								<el-icon><Plus /></el-icon> 添加档位
							</button>
						</div>

						<div class="card content-editor-card">
							<div class="field-row" data-field-key="sellingPoint" tabindex="-1">
								<div class="field-label">{{ labelOf('sellingPoint') }}</div>
								<div class="field-value prominent-field">
									<textarea v-model="sellingPointVal"></textarea>
								</div>
							</div>

							<div
								v-for="field in dynamicTextFields"
								:key="field.key"
								class="field-row"
								:data-field-key="field.key"
								tabindex="-1"
							>
								<div class="field-label">{{ field.label }}</div>
								<div class="field-value prominent-field">
									<textarea
										v-if="field.kind === 'longtext'"
										v-model="dynamicFieldValues[field.key]"
									></textarea>
									<input
										v-else
										v-model="dynamicFieldValues[field.key]"
										type="text"
									>
								</div>
							</div>

							<IconSelector
								v-if="hasField('icon')"
								v-model="formIconRefs"
								:options="formIconOptions"
								:label="labelOf('icon')"
								:start-number="formIconStartNumber"
								:editable="canEditSubmission && formIconEditable"
								:loading="formIconLoading"
								:masked="formIconMasked"
							/>

							<div class="field-row" data-field-key="remarks" tabindex="-1">
								<div class="field-label">{{ labelOf('remarks') }}</div>
								<div class="field-value prominent-field">
									<textarea v-model="remarksVal"></textarea>
								</div>
							</div>
						</div>
					</div>
				</div>
				<template #footer>
					<span class="dialog-footer product-dialog-footer">
						<el-button
							v-if="canEditSubmission && !isAddingNewProduct"
							type="danger"
							:icon="Delete"
							:loading="isDeletingProduct"
							:disabled="formCount <= 1 || isSaving"
							@click="handleDeleteCurrentProduct"
						>
							删除当前商品提报
						</el-button>
						<span class="product-dialog-footer__actions">
							<el-button @click="handleDialogCancel">取 消</el-button>
							<el-button v-if="canEditSubmission" type="success" @click="handleDialogContinueAdd">继续新增</el-button>
							<el-button v-if="canEditSubmission" type="primary" @click="handleDialogConfirm">{{ isAddingNewProduct ? '确定并新增' : '确定并回显' }}</el-button>
						</span>
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

			<CellTextHighlightDialog
				v-model="richTextDialogVisible"
				:text="richTextEditorText"
				:runs="richTextEditorRuns"
				@apply="applyRichTextFormatting"
			/>

			<BatchApplyDialog
				v-model="batchApplyDialogVisible"
				:fields="batchApplyFields"
				:target-indexes="batchApplyTargetIndexes"
				:source-label="batchApplySourceLabel"
				:initial-values="batchApplyInitialValues"
				@apply="handleBatchApply"
			/>

				<!-- 校验结果弹窗 -->
				<el-dialog
					v-model="validationDialogVisible"
					title="提交校验结果"
					width="640px"
					:close-on-click-modal="false"
				>
					<div v-if="validationErrors.length > 0" style="margin-bottom: 16px;">
						<div style="display: flex; align-items: center; gap: 6px; color: #f56c6c; font-weight: 600; margin-bottom: 8px;">
							<el-icon><CircleCloseFilled /></el-icon>
							<span>必须修正的问题（{{ validationErrors.length }} 项）</span>
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
							<span>建议补充的内容（{{ validationWarnings.length }} 项）</span>
						</div>
						<el-scrollbar max-height="200px">
							<div v-for="(warn, i) in validationWarnings" :key="'w'+i" style="display: flex; align-items: baseline; gap: 8px; padding: 4px 0; color: #e6a23c; font-size: 13px;">
								<span style="min-width: 20px; text-align: right;">{{ i + 1 }}.</span>
								<span>{{ warn.message }}</span>
							</div>
						</el-scrollbar>
					</div>
					<template #footer>
						<el-button @click="validationDialogVisible = false">返回修改</el-button>
						<el-button
							v-if="canEditSubmission && validationErrors.length === 0 && validationWarnings.length > 0"
							type="warning"
							@click="validationDialogVisible = false; confirmAndSubmit()"
						>
							仍然提交
						</el-button>
					</template>
				</el-dialog>
		</div>
	</fs-page>
</template>

<script lang="ts" setup name="productSpec">
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { errorMessage, infoMessage, successMessage, warningMessage } from '/@/utils/message';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import { request } from '/@/utils/service';
import { ElMessageBox } from 'element-plus';
import { Plus, FolderChecked, Download, Search, ArrowLeft, Checked, CircleCloseFilled, WarningFilled, Link, Delete, CopyDocument, RefreshLeft, FullScreen, ScaleToOriginal } from '@element-plus/icons-vue';
import * as ElementPlusIconsVue from '@element-plus/icons-vue';
import { CellValueType, createUniver, LocaleType } from '@univerjs/presets';
import { IRenderManagerService, SHEET_VIEWPORT_KEY, UniverSheetsCorePreset } from '@univerjs/preset-sheets-core';
import UniverPresetSheetsCoreZhCN from '@univerjs/preset-sheets-core/lib/locales/zh-CN';
import { UniverSheetsDataValidationPreset } from '@univerjs/preset-sheets-data-validation';
import { UniverSheetsDrawingPreset } from '@univerjs/preset-sheets-drawing';
import { UniverVue3AdapterPlugin } from '@univerjs/ui-adapter-vue3';
import '@univerjs/sheets-data-validation/lib/facade';
import '@univerjs/sheets-ui/lib/facade';
import '@univerjs/sheets-ui/lib/index.css';
import '@univerjs/preset-sheets-data-validation/lib/index.css';
import '@univerjs/preset-sheets-drawing/lib/index.css';
import '@univerjs/preset-sheets-core/lib/index.css';

// 导入外部定义
import { DBProductItem, SelectableProduct, ValidationError, ValidationResult } from './types';
import {
	PRODUCT_HEADER_PREFIX,
	buildProductSpecStylesDict,
} from './productSpecStyles';
import {
	createRichTextDocument,
	readSheetCellValue,
	setCellTextPreservingRichText,
	setNumericCellValue,
} from './cellIO';
import { createFieldAccess } from './fieldAccess';
import type { FieldPermission } from './fieldAccess';
import {
	applyBatchFields,
	listBatchApplyFields,
	revertBatchApply,
	runBatchApplyTransaction,
} from './batchApply';
import type {
	BatchApplyDeps,
	BatchApplyField,
	BatchApplyResult,
	BatchApplyUndoEntry,
} from './batchApply';
import {
	escapeRegExp,
	extractUnitFromSpec,
	getCleanNickname,
	getCursorOffsetInContainer,
	getProductCoords,
	resolveProductUnit,
	setCaretPosition,
} from './utils';
import { normalizeProductName, resolveProductDisplayName } from './productDisplay';
import { needsLeaveConfirm } from './leaveGuard';
import {
	MAIN_PRODUCT_SEPARATOR,
	createMainProductRefParser,
	formatMainProductRefText,
	formatNumberedMainProductRefText,
	normalizeQty,
	stripProductSuffixes,
} from './mainProductRefs';
import type { MainProductRef } from './mainProductRefs';
import {
	cloneTiers,
	createFormTierText,
	formatTiersToText,
	syncTierValue,
} from './formTierText';
import type { FormTierItem } from './formTierText';
import { bindSelectionInteractionGuard } from './univerSelectionGuard';
import { createSubmissionValidator } from './submissionValidation';
import { buildSpecCsvText, downloadCsvFile } from './exportCsv';
import {
	cleanFootnotesAndDetails,
	maskSnapshotUnqueryableCells,
	remapSnapshotProductColumns,
	syncSnapshotProductStyles as applySnapshotProductStyles,
} from './snapshot';
import {
	createProductNumberRegistry,
	formatProductFootnote,
	resolveProductReference,
	type ProductNumberRegistry,
} from './productFootnotes';
import {
	getSchema, getFields, getFieldByRow,
	getLabelByRow, registerTemplate, styleToUniverStyleName,
} from './schema';
import type { FieldDef } from './schema';

// 导入子组件
import ProductSelectDialog from './components/ProductSelectDialog.vue';
import GiftStrategyEditor from './components/GiftStrategyEditor.vue';
import ProductSearchPicker from './components/ProductSearchPicker.vue';
import CellTextHighlightDialog from './components/CellTextHighlightDialog.vue';
import BatchApplyDialog from './components/BatchApplyDialog.vue';
import EfficacyEditor from './components/EfficacyEditor.vue';
import IconSelector from './components/IconSelector.vue';
import { getProductSelectionKey } from './productSearch';
import type {
	RichTextFormatChange,
	RichTextRun,
} from './richTextFormatting';
import {
	enrichGiftStrategies,
	flattenGiftStrategies,
	formatGiftStrategies,
	parseGiftStrategies,
	type GiftStrategy,
} from './giftStrategies';
import { GetPermission } from '/@/api/design_order/product_spec';
import { BuildShareUrl, CreateShareLink } from '/@/api/design_order/product_spec_share';
import { copyTextToClipboard } from '/@/utils/clipboard';
import { GetTemplateSchema } from '/@/api/design_order/spec_template';
import { ResolveImageUrls } from '/@/api/design_order/icon_library';
import { auth } from '/@/utils/authFunction';
import {
	cleanEfficacyFootnotes,
	cloneEfficacyItems,
	countEfficacyFootnotes,
	formatEfficacyFootnote,
	formatEfficacyText,
	normalizeEfficacyItems,
	parseEfficacyText,
	sameEfficacyNames,
	type EfficacyItem,
} from './efficacyItems';
import {
	cleanIconFootnotes,
	cloneIconRefs,
	formatIconFootnote,
	formatIconText,
	normalizeIconRefs,
	parseIconNames,
	resolveIconRefsFromText,
	type IconOption,
	type IconRef,
} from './iconRefs';
import { createIconResolver } from './iconResolver';
import {
	createIconDrawingRenderer,
	formatIconDrawingText,
	normalizeIconImageUrlResponse,
} from './iconDrawings';

const permissionData = ref<Record<string, FieldPermission>>({});
// 模板与主题在字段访问器之前声明：createFieldAccess 需要在求值时就拿到这两个 ref。
const currentTemplateType = ref('main_image');
const currentTheme = ref('proya');

// 行偏移只能通过 Schema 查询，禁止再写 blockStartRow + N 字面量
const fieldAccess = createFieldAccess({
	templateType: currentTemplateType,
	theme: currentTheme,
	permissions: permissionData,
});
const {
	optionalRowOf,
	maskKeyByRow,
	hasField,
	rowOf,
	labelOf,
	rowsPerBlock,
	colsPerBlock: schemaColumnsPerBlock,
	readOptionalFieldValue,
	writeOptionalFieldValue,
	getPermittedVal,
	getProductCellStyleName,
} = fieldAccess;

const DEFAULT_STORAGE_COLUMNS_PER_BLOCK = 6;
const storageColumnsPerBlock = () => {
	try {
		return Math.max(1, schemaColumnsPerBlock());
	} catch {
		return DEFAULT_STORAGE_COLUMNS_PER_BLOCK;
	}
};
const layoutColumnsPerBlock = ref(DEFAULT_STORAGE_COLUMNS_PER_BLOCK);
const colsPerBlock = () => layoutColumnsPerBlock.value;

const buildSnapshotProductStyleOptions = (
	productCount: number,
	columnsPerBlock = colsPerBlock(),
) => ({
	productCount,
	rowsPerBlock: rowsPerBlock(),
	columnsPerBlock,
	styleByRelativeRow: getProductCellStyleName,
	numericRelativeRows: getFields(currentTemplateType.value)
		.filter((field) => field.kind === 'price')
		.map((field) => field.row),
	numberCellType: CellValueType.NUMBER,
	styles: buildProductSpecStylesDict(),
});

const syncSnapshotProductStyles = (
	snapshot: any,
	productCount: number,
	columnsPerBlock = colsPerBlock(),
) => applySnapshotProductStyles(
	snapshot,
	buildSnapshotProductStyleOptions(productCount, columnsPerBlock),
);

const filterSnapshotData = (
	snapshot: any,
	productCount: number,
	columnsPerBlock = colsPerBlock(),
) => maskSnapshotUnqueryableCells(syncSnapshotProductStyles(snapshot, productCount, columnsPerBlock), {
		rowsPerBlock: rowsPerBlock(),
		maskKeyByRow,
		isQueryable: (maskKey) => permissionData.value[maskKey]?.is_query !== false,
		stringCellType: CellValueType.STRING,
	});

// ========== 产品规格数据库 ==========
const rawProductList = ref<DBProductItem[]>([]);
const PRODUCT_KEYWORDS = ref<Record<string, string[]>>({});

const uniqueNicknames = computed(() => {
	const set = new Set<string>();
	rawProductList.value.forEach(item => {
		if (item.nickname) {
			const trimmed = item.nickname.trim();
			// 过滤掉纯数字的无效昵称，防止干扰脚注逻辑
			if (/^\d+$/.test(trimmed)) return;
			set.add(trimmed);
		}
	});
	return Array.from(set);
});

const _productNames = computed(() => {
	return uniqueNicknames.value;
});

interface FormMainProductItem extends MainProductRef {
	key: string;
	nickname: string;
	brand: string;
}

const { findProductByMainRef, parseMainProductRefs } = createMainProductRefParser({
	productList: () => rawProductList.value,
	uniqueNicknames: () => uniqueNicknames.value,
});

const isMedicalDeviceProduct = (reference: {
	productCode?: string;
	nickname: string;
	fullName: string;
	spec: string;
}): boolean => {
	const product = reference.productCode
		? rawProductList.value.find((item) => item.productCode === reference.productCode)
		: findProductByMainRef(reference.nickname, reference.spec, reference.fullName);
	return product?.regulatoryCategory === 'medical_device';
};

const getProductKeywords = (nickname: string): string[] => {
	return PRODUCT_KEYWORDS[nickname] || [nickname];
};

// Suffix structure for global tracking
const productSuffixMap = ref<Record<number, number>>({});

// 用户自定义的列名：仅记录用户手动输入过的名称。
// 未在此映射中的列：列名为空（空白列）或由主品简称自动回显。
const productColumnNames = ref<Record<number, string>>({});

// Icon 选择：候选集按主商品编码异步解析并缓存，recalculateSuffixesAndFootnotes
// 是同步函数，只读缓存；解析完成后由 onResolved 回调再触发一次重算。
// 必须在 recalculateSuffixesAndFootnotes 之前声明（运行期 const 不提升）。
const iconResolver = createIconResolver();
const iconResolverRevision = ref(0);
const iconDrawingRenderer = createIconDrawingRenderer();
const ICON_DRAWING_LAYOUT_REFRESH_DELAY = 80;
let iconDrawingLayoutRefreshTimer: number | null = null;
const iconRefsByCard = ref<Record<number, IconRef[]>>({});
const iconFieldRow = () => optionalRowOf('icon');
const iconPermission = () => {
	const row = iconFieldRow();
	if (row === undefined) return undefined;
	const maskKey = maskKeyByRow(row);
	return maskKey ? permissionData.value[maskKey] : undefined;
};

const recalculateSuffixesAndFootnotes = (
	activeSheet: any,
	previousEfficacyItemsByCard: Record<number, EfficacyItem[]> = {},
) => {
	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	interface ColConfig {
		index: number;
		blockCol: number;
		blockStartRow: number;
		mainItems: MainProductRef[];
		nicknameIndexMap: Record<string, number>;
		mainItemIndexes: Array<number | undefined>;
		numberRegistry: ProductNumberRegistry;
		efficacyItems: EfficacyItem[];
		previousEfficacyItems: EfficacyItem[];
		efficacyStartNumber: number;
		iconRefs: IconRef[];
		previousIconRefs: IconRef[];
		iconStartNumber: number;
		iconCellText: string;
		productReferences: Array<{
			nickname: string;
			fullName: string;
			productCode: string;
			spec: string;
			index: number;
		}>;
	}

	const cols: ColConfig[] = [];
	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
		const nicknameVal = getValue(blockStartRow + rowOf('nickname'), blockCol);
		const fullNameVal = getValue(blockStartRow + rowOf('fullName'), blockCol);
		const mainItems = parseMainProductRefs(nicknameVal, '', fullNameVal);
		if (!mainItems.length) continue;
		cols.push({
			index: idx,
			blockCol,
			blockStartRow,
			mainItems,
			nicknameIndexMap: {},
			mainItemIndexes: [],
			numberRegistry: createProductNumberRegistry(rawProductList.value),
			efficacyItems: [],
			previousEfficacyItems: [],
			efficacyStartNumber: 1,
			iconRefs: [],
			previousIconRefs: [],
			iconStartNumber: 1,
			iconCellText: '',
			productReferences: [],
		});
	}

	// 每个产品表单独立编号：表单内从 1 连续递增，相同产品昵称复用同一编号。
	for (const config of cols) {
		const registerProduct = (
			nick: string,
			spec = '',
			fullName = '',
			explicitProductCode = '',
		): number | undefined => {
			if (isMedicalDeviceProduct({
				productCode: explicitProductCode,
				nickname: nick,
				fullName,
				spec,
			})) return undefined;
			const numbered = config.numberRegistry.register({
				productCode: explicitProductCode,
				nickname: nick,
				fullName,
				spec,
			});
			if (!numbered) return undefined;
			// 同昵称产品统一复用首次出现的编号。
			if (config.nicknameIndexMap[numbered.nickname] === undefined) {
				config.nicknameIndexMap[numbered.nickname] = numbered.number;
			}
			return numbered.number;
		};

		config.mainItemIndexes = config.mainItems.map((item) =>
			registerProduct(item.cleanNick, item.spec, item.fullName));

		// 继续扫描当前表单中的赠品、满赠，确保该表单编号连续且不受其他表单影响。
		const giftsText = getValue(config.blockStartRow + rowOf('gifts'), config.blockCol);
		const thresholdText = readOptionalFieldValue(getValue, config, 'thresholdA');
		const savedStructuredGifts = giftStrategiesByCard.value[config.index];
		const structuredGifts = savedStructuredGifts
			?? enrichGiftStrategies(parseGiftStrategies(String(giftsText || '')), rawProductList.value);
		if (savedStructuredGifts === undefined && structuredGifts.length) {
			giftStrategiesByCard.value[config.index] = cloneGiftStrategies(structuredGifts);
		}
		structuredGifts.forEach((strategy) => {
			strategy.items.forEach((item) => {
				registerProduct(item.nickname, item.spec, item.fullName, item.productCode);
			});
		});
		const remarksText = getValue(config.blockStartRow + rowOf('remarks'), config.blockCol);
		const savedStructuredTiers = tierStrategiesByCard.value[config.index];
		const structuredTiers = savedStructuredTiers
			?? parseTiersFromText(String(thresholdText), String(remarksText || ''));
		if (savedStructuredTiers === undefined && structuredTiers.length) {
			// 兼容旧快照：历史数据只有满赠文本，首次加载时还原产品编码，
			// 使满赠与赠品、主商品、运营备注共享同一个角标身份。
			tierStrategiesByCard.value[config.index] = cloneTiers(structuredTiers);
		}
		structuredTiers.forEach((tier) => {
			tier.items.forEach((item) => {
				registerProduct(item.nickname, item.spec, item.fullName, item.productCode);
			});
		});
		const efficacyText = String(getValue(
			config.blockStartRow + rowOf('efficacy'),
			config.blockCol,
		) || '');
		const savedEfficacyItems = efficacyItemsByCard.value[config.index] || [];
		config.previousEfficacyItems = cloneEfficacyItems(
			previousEfficacyItemsByCard[config.index] || savedEfficacyItems,
		);
		config.efficacyItems = normalizeEfficacyItems(efficacyText === '***'
			? []
			: (
				sameEfficacyNames(savedEfficacyItems, efficacyText)
					? cloneEfficacyItems(savedEfficacyItems)
					: parseEfficacyText(efficacyText, savedEfficacyItems)
			));
		config.efficacyStartNumber = config.numberRegistry.ordered.length + 1;
		efficacyItemsByCard.value[config.index] = cloneEfficacyItems(config.efficacyItems);
		config.productReferences = config.numberRegistry.ordered.map((item) => ({
			nickname: item.nickname,
			fullName: item.fullName,
			productCode: item.productCode,
			spec: item.spec,
			index: item.number,
		}));

		// Icon 编号接在功效之后：只解析主商品（赠品/满赠不参与）。
		config.iconStartNumber = config.efficacyStartNumber
			+ countEfficacyFootnotes(config.efficacyItems);
		config.iconCellText = String(
			readOptionalFieldValue(getValue, config, 'icon') || '',
		);
		const mainProductCodes = config.mainItems
			.map((item) => findProductByMainRef(item.cleanNick, item.spec, item.fullName)?.productCode || '')
			.filter(Boolean);
		if (mainProductCodes.length) iconResolver.request(mainProductCodes);
		if (config.iconCellText === '***') {
			// 无查看权限：不参与重建，保持 iconRefsByCard 里的旧值，写回时整体跳过。
			config.previousIconRefs = cloneIconRefs(iconRefsByCard.value[config.index] || []);
			config.iconRefs = [];
		} else {
			const savedIconRefs = iconRefsByCard.value[config.index] || [];
			config.previousIconRefs = cloneIconRefs(savedIconRefs);
			config.iconRefs = savedIconRefs.length
				? cloneIconRefs(savedIconRefs)
				: resolveIconRefsFromText(
					config.iconCellText,
					iconResolver.optionsFor(mainProductCodes),
				);
			iconRefsByCard.value[config.index] = cloneIconRefs(config.iconRefs);
		}
	}

	productSuffixMap.value = {};
	for (const config of cols) {
		const primarySuffix = config.mainItemIndexes[0];
		if (primarySuffix !== undefined) productSuffixMap.value[config.index] = primarySuffix;
	}

	const theme = currentTheme.value;

	// 更新昵称行：写入 昵称[编号]规格 × 数量单位，支持同一提报列多个主商品
	for (const config of cols) {
		const formattedNickname = config.mainItems
			.map((item, itemIndex) =>
				formatNumberedMainProductRefText(item, config.mainItemIndexes[itemIndex]),
			)
			.join(MAIN_PRODUCT_SEPARATOR);

		setCellTextPreservingRichText(
			activeSheet,
			config.blockStartRow + rowOf('nickname'),
			config.blockCol,
			formattedNickname,
			`editableCenterStyle_${theme}`,
		);
	}

	// 在文本中为产品名提及插入编号
	const insertSuffixesInText = (text: string, nicknameIndexMap: Record<string, number>): string => {
		if (!text) return text;
		// 收集所有昵称和对应编号，按长度降序排列避免短名覆盖长名
		const nickEntries = Object.entries(nicknameIndexMap)
			.sort(([a], [b]) => b.length - a.length);

		// 1. 先彻底清除所有已有的 [编号] 后缀（包括可能被重复/嵌套生成的）
		let result = text.replace(/\[[\d\s,[\]]+\]/g, '');

		// 2. 使用占位符依次替换，避免短模式匹配已替换的长模式内部
		const placeholders: { placeholder: string; replacement: string }[] = [];

		// 替换昵称
		nickEntries.forEach(([nick, num], idx) => {
			const placeholder = `___PROD_PLACEHOLDER_${idx}___`;
			const escapedNick = escapeRegExp(nick);
			const regex = new RegExp(escapedNick, 'g');
			if (regex.test(result)) {
				result = result.replace(regex, placeholder);
				placeholders.push({
					placeholder,
					replacement: `${nick}[${num}]`
				});
			}
		});

		// 替换关键词
		let kwIdx = nickEntries.length;
		nickEntries.forEach(([nick, num]) => {
			const keywords = getProductKeywords(nick);
			keywords.forEach(kw => {
				if (kw === nick) return;
				const escapedKw = escapeRegExp(kw);
				const regex = new RegExp(escapedKw, 'g');
				if (regex.test(result)) {
					const placeholder = `___PROD_PLACEHOLDER_${kwIdx++}___`;
					result = result.replace(regex, placeholder);
					placeholders.push({
						placeholder,
						replacement: `${kw}[${num}]`
					});
				}
			});
		});

		// 3. 将占位符还原为带编号的目标文本
		// 按占位符索引倒序替换，保证安全性
		placeholders.reverse().forEach(({ placeholder, replacement }) => {
			result = result.replace(new RegExp(placeholder, 'g'), replacement);
		});

		return result;
	};

	// 为每个列更新赠品/满赠行中的产品名编号，并生成备注脚注
	for (const config of cols) {
		const primaryItem = config.mainItems[0];
		const primaryProduct = findProductByMainRef(primaryItem.cleanNick, primaryItem.spec, primaryItem.fullName);
		const structuredGifts = giftStrategiesByCard.value[config.index] || [];
		const structuredTiers = tierStrategiesByCard.value[config.index] || [];
		const getStructuredSuffix = (item: {
			productCode: string;
			fullName: string;
			nickname: string;
			spec: string;
		}): number | undefined => {
			return config.numberRegistry.find(item)?.number;
		};

		const efficacyText = getValue(config.blockStartRow + rowOf('efficacy'), config.blockCol);
		if (efficacyText !== '***') {
			setCellTextPreservingRichText(
				activeSheet,
				config.blockStartRow + rowOf('efficacy'),
				config.blockCol,
				formatEfficacyText(config.efficacyItems, config.efficacyStartNumber),
				`contentLeftStyle_${theme}`,
			);
		}

		// 更新赠品行 (Row gifts)
		const giftsText = getValue(config.blockStartRow + rowOf('gifts'), config.blockCol);
		if (giftsText && giftsText !== '***') {
			const updatedGifts = structuredGifts.length
				? formatGiftStrategies(structuredGifts, getStructuredSuffix)
				: insertSuffixesInText(String(giftsText), config.nicknameIndexMap);
			setCellTextPreservingRichText(
				activeSheet,
				config.blockStartRow + rowOf('gifts'),
				config.blockCol,
				updatedGifts,
				`editableCenterStyle_${theme}`,
			);
		}

		// 更新满赠行 (Row thresholdA)
		const thresholdText = readOptionalFieldValue(getValue, config, 'thresholdA');
		if (thresholdText && thresholdText !== '***') {
			const updatedThreshold = structuredTiers.length
				? formatTiersToText(structuredTiers, getStructuredSuffix)
				: insertSuffixesInText(String(thresholdText), config.nicknameIndexMap);
			writeOptionalFieldValue(
					(row, col, value, styleName) => {
						setCellTextPreservingRichText(activeSheet, row, col, value, styleName);
					},
				config,
				{
					key: 'thresholdA',
					value: updatedThreshold,
					styleName: `editableCenterStyle_${theme}`,
				},
			);
		}

		// 生成备注脚注：先按结构清掉 Icon 脚注行，再清功效/产品脚注，最后统一追加。
		let cellRemarksVal = getValue(config.blockStartRow + rowOf('remarks'), config.blockCol) || '';
		let baseRemarks = cleanIconFootnotes(
			cleanEfficacyFootnotes(
				cleanFootnotesAndDetails(String(cellRemarksVal)),
				config.efficacyItems,
				config.previousEfficacyItems,
			),
			config.iconRefs,
			config.previousIconRefs,
		);
		if (!baseRemarks) {
			baseRemarks = cleanFootnotesAndDetails(primaryProduct ? ((primaryProduct as any).remarks || '') : '');
		}

		// 使用当前表单内的连续编号生成脚注
		const addedNumsInCol = new Set<number>();
		for (const productRef of config.productReferences) {
			if (addedNumsInCol.has(productRef.index)) continue;
			const line = formatProductFootnote({
				number: productRef.index,
				nickname: productRef.nickname,
				fullName: productRef.fullName,
			});
			if (!line) continue;
			addedNumsInCol.add(productRef.index);
			baseRemarks += `\n${line}`;
		}
		let efficacyNumber = config.efficacyStartNumber;
		for (const item of config.efficacyItems) {
			const line = formatEfficacyFootnote(item, efficacyNumber);
			if (!line) continue;
			baseRemarks += `\n${line}`;
			efficacyNumber += 1;
		}
		let iconNumber = config.iconStartNumber;
		for (const ref of config.iconRefs) {
			const line = formatIconFootnote(ref, iconNumber);
			if (!line) continue;
			baseRemarks += `\n${line}`;
			iconNumber += 1;
		}

		setCellTextPreservingRichText(
			activeSheet,
			config.blockStartRow + rowOf('remarks'),
			config.blockCol,
			baseRemarks,
			`editableCenterStyle_${theme}`,
		);

		// Icon 单元格只放「简称[编号]」文本；*** 遮罩时不触碰单元格。
		if (hasField('icon') && config.iconCellText !== '***') {
			writeOptionalFieldValue(
				(row, col, value, styleName) => {
					setCellTextPreservingRichText(activeSheet, row, col, value, styleName);
				},
				config,
				{
					key: 'icon',
					value: formatIconDrawingText(
						formatIconText(config.iconRefs, config.iconStartNumber),
						config.iconRefs,
					),
					styleName: `editableCenterStyle_${theme}`,
				},
			);
		}

		try { activeSheet.autoResizeRows(config.blockStartRow, rowsPerBlock()); } catch { /* ignore */ }
	}
};

// Icon 候选解析完成后重算一次：第一次重算时缓存未命中（icon 单元格为空/沿用旧文本），
// 这里补齐脚注与编号。change 事件写入期间跳过重算，避免与批量应用/表单回显交错。
iconResolver.onResolved(() => {
	iconResolverRevision.value += 1;
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet || isHandlingEvent) return;
	isHandlingEvent = true;
	try {
		recalculateSuffixesAndFootnotes(activeSheet);
	} catch (error) {
		console.warn('Icon 解析后重算脚注失败:', error);
	} finally {
		isHandlingEvent = false;
	}
	void renderIconDrawings();
});

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
		const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
		const nicknameVal = activeSheet.getRange(blockStartRow + rowOf('nickname'), blockCol, 1, 1).getValue() as any;
		const nickname = nicknameVal && typeof nicknameVal === 'object' ? nicknameVal.v : nicknameVal;
		const cleanNick = getCleanNickname(nickname, uniqueNicknames.value);
		if (!cleanNick) continue;

		const brandRow = optionalRowOf('brand');
		const brandVal = brandRow === undefined
			? ''
			: activeSheet.getRange(blockStartRow + brandRow, blockCol, 1, 1).getValue() as any;
		const brand = brandVal && typeof brandVal === 'object' ? brandVal.v : brandVal || '';

		const fullNameVal = activeSheet.getRange(blockStartRow + rowOf('fullName'), blockCol, 1, 1).getValue() as any;
		const fullName = fullNameVal && typeof fullNameVal === 'object' ? fullNameVal.v : fullNameVal || '';

		const giftsVal = activeSheet.getRange(blockStartRow + rowOf('gifts'), blockCol, 1, 1).getValue() as any;
		const giftsText = giftsVal && typeof giftsVal === 'object' ? giftsVal.v : giftsVal || '';

		const suffix = productSuffixMap.value[idx] || 1;

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
	const _end = cursorIndexBeforeDialog.value;

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

		setCellTextPreservingRichText(
			activeSheet,
			row,
			col,
			newFullText,
			`editableCenterStyle_${theme}`,
		);

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

			const thresholdRow = optionalRowOf('thresholdA');
			const isPromoRow = thresholdRow !== undefined && currentEditingCell.value && (
				currentEditingCell.value.row % rowsPerBlock() === thresholdRow
			);

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

const isUniverTarget = (target: EventTarget | null): boolean => {
	if (!(target instanceof HTMLElement)) return false;
	return target.closest('#univer-container') !== null ||
		target.closest('.univer-cell-editor-container') !== null ||
		target.classList.contains('univer-editor');
};

const isUniverInteractionEvent = (event: Event): boolean => (
	isUniverTarget(event.target) ||
	isUniverTarget(document.activeElement) ||
	isUniverClipboardActive
);

let isUniverClipboardActive = false;

const updateUniverClipboardActive = (event: Event) => {
	isUniverClipboardActive = isUniverTarget(event.target);
};

const blockUniverPaste = (event: Event) => {
	if (!isUniverInteractionEvent(event)) return;
	event.preventDefault();
	event.stopPropagation();
	warningMessage('当前规格表禁用粘贴，请通过新增产品维护内容');
};

const handleUniverPaste = (event: ClipboardEvent) => {
	blockUniverPaste(event);
};

const handleUniverBeforeInput = (event: InputEvent) => {
	if (!event.inputType.startsWith('insertFromPaste')) return;
	blockUniverPaste(event);
};

const handleUniverPasteShortcut = (event: KeyboardEvent) => {
	const key = event.key.toLowerCase();
	const isPasteShortcut = ((event.ctrlKey || event.metaKey) && key === 'v') ||
		(event.shiftKey && key === 'insert');
	if (!isPasteShortcut) return;
	blockUniverPaste(event);
};

const handleUniverDeleteShortcut = (event: KeyboardEvent) => {
	if (event.key !== 'Delete') return;
	if (!isUniverInteractionEvent(event)) return;
	event.preventDefault();
	event.stopPropagation();
};

// ========== 组件状态 ==========
const route = useRoute();
const router = useRouter();

const submissionId = ref<number | null>(null);
const submissionName = ref('');
const submissionShop = ref('');
const submissionPlatform = ref('京东');
const submissionStatus = ref('draft');
const canCreateSubmission = auth('design_order:product_spec_submission:Create');
const canEditSubmission = ref(canCreateSubmission);
const canShareSubmission = ref(
	canCreateSubmission && auth('design_order:product_spec_submission:Share')
);
const isEditingSubmissionName = ref(false);
const submissionNameDraft = ref('');
const submissionNameInputRef = ref<HTMLInputElement | null>(null);
const showSubmissionStatus = computed(() => Boolean(submissionId.value) && route.query.entry !== 'create');
const templateName = ref('');
const templateIconName = ref('');
const templateRemark = ref('');
const templateIcon = computed(() =>
	templateIconName.value
		? ElementPlusIconsVue[templateIconName.value as keyof typeof ElementPlusIconsVue]
		: undefined
);

const univerContainerRef = ref<HTMLElement | null>(null);
const univerWrapperRef = ref<HTMLElement | null>(null);
const controlPanelRef = ref<HTMLElement | null>(null);
const logoTextRef = ref<HTMLElement | null>(null);
let isHandlingEvent = false;
const productCopyButtons = ref<Array<{
	index: number;
	left: number;
	top: number;
	size: number;
	iconSize: number;
}>>([]);
let productCopyPositionFrame: number | null = null;
let productCopyViewportBindFrame: number | null = null;
let productCopyViewportSubscriptions: Array<{ dispose?: () => void; unsubscribe?: () => void }> = [];
let productCopyScrollPosition = { x: 0, y: 0 };

const PRODUCT_FIELD_COLUMN_WIDTH = 240;
const PRODUCT_COLUMN_TARGET_WIDTH = 240;
const PRODUCT_COLUMN_MIN_WIDTH = 220;
const PRODUCT_COLUMN_MAX_WIDTH = 480;
const PRODUCT_COLUMN_SNAPSHOT_WIDTH = 420;
const PRODUCT_RESIZE_SETTLE_DELAY = 160;
let productColumnResizeObserver: ResizeObserver | null = null;
let productColumnWidthFrame: number | null = null;
let productColumnResizeTimer: ReturnType<typeof window.setTimeout> | null = null;
let lastProductWrapperSize = '';
let appliedProductColumnWidth: number | null = null;
let appliedProductColumnCount: number | null = null;

const richTextDialogVisible = ref(false);
const richTextEditorText = ref('');
const richTextEditorRuns = ref<RichTextRun[]>([]);
const richTextTargetCell = ref<{ row: number; col: number } | null>(null);
const formattingPointerCell = ref<{ row: number; col: number } | null>(null);

const getActiveCellCoordinates = (): { row: number; col: number } | null => {
	const range = workbook?.getActiveSheet()?.getActiveCell()?.getRange();
	if (!range) return null;
	return { row: range.startRow, col: range.startColumn };
};

const getFormattingProductIndex = (row: number, col: number): number => {
	const cpb = colsPerBlock();
	if (col < 1 || col > cpb) return -1;
	const blockIndex = Math.floor(row / rowsPerBlock());
	return blockIndex * cpb + col - 1;
};

const hasFormattingFieldPermission = (relativeRow: number): boolean => {
	const maskKey = maskKeyByRow(relativeRow);
	if (!maskKey) return true;
	const permission = permissionData.value[maskKey];
	if (!permission) return true;
	if (!permission.is_query) return false;
	return submissionId.value ? permission.is_update : permission.is_create;
};

const isFormattingCell = (row: number, col: number): boolean => {
	const relativeRow = row % rowsPerBlock();
	const productIndex = getFormattingProductIndex(row, col);
	if (productIndex < 0 || productIndex >= formCount.value) return false;
	if (!getFieldByRow(currentTemplateType.value, relativeRow)) return false;
	return hasFormattingFieldPermission(relativeRow);
};

const extractRichTextRuns = (richText: any): RichTextRun[] => {
	const runs = richText?.getData()?.body?.textRuns;
	if (!Array.isArray(runs)) return [];
	return runs.map((run: RichTextRun) => ({
		...run,
		ts: run.ts ? { ...run.ts } : undefined,
	}));
};

const openRichTextFormatting = () => {
	if (!ensureEditableSubmission()) return;
	const target = formattingPointerCell.value || getActiveCellCoordinates();
	if (!target || !isFormattingCell(target.row, target.col)) {
		warningMessage('请在可编辑的商品内容单元格上点击右键');
		return;
	}
	const range = workbook.getActiveSheet().getRange(target.row, target.col, 1, 1);
	const richText = range.getRichTextValue();
	const text = richText?.toPlainText() ?? String(range.getValue() ?? '');
	if (!text) {
		warningMessage('当前单元格没有可设置样式的文字');
		return;
	}
	richTextTargetCell.value = target;
	richTextEditorText.value = text;
	richTextEditorRuns.value = extractRichTextRuns(richText);
	richTextDialogVisible.value = true;
};

const preventUniverContextMenu = (event: MouseEvent) => {
	const container = univerContainerRef.value;
	if (!container || !(event.target instanceof Node) || !container.contains(event.target)) return;
	event.preventDefault();
	event.stopPropagation();
	openRichTextFormatting();
};

const startSubmissionNameEdit = async () => {
	if (!submissionId.value || !canEditSubmission.value) return;
	submissionNameDraft.value = submissionName.value;
	isEditingSubmissionName.value = true;
	await nextTick();
	submissionNameInputRef.value?.focus();
	submissionNameInputRef.value?.select();
};

const commitSubmissionNameEdit = () => {
	if (!isEditingSubmissionName.value) return;
	const name = submissionNameDraft.value.trim();
	if (!name) {
		warningMessage('提报名称不能为空');
		nextTick(() => submissionNameInputRef.value?.focus());
		return;
	}
	submissionName.value = name;
	isEditingSubmissionName.value = false;
};

const cancelSubmissionNameEdit = () => {
	if (!isEditingSubmissionName.value) return;
	submissionNameDraft.value = submissionName.value;
	isEditingSubmissionName.value = false;
};

	// 自动保存状态
	const isSaving = ref(false);
	const isSharing = ref(false);
	const isDirty = ref(false);
	let editRevision = 0;
	const lastSavedAt = ref<Date | null>(null);
	const autoSaveTimer = ref<ReturnType<typeof setTimeout> | null>(null);
	const AUTO_SAVE_INTERVAL = 30_000;  // 30秒

let univerAPI: any = null;
let workbook: any = null;
let sheet: any = null;

const resolveIconDrawingUrls = async (fileIds: number[]) => (
	normalizeIconImageUrlResponse(await ResolveImageUrls(fileIds))
);

const getRenderableIconRefs = (): Record<number, IconRef[]> => Object.fromEntries(
	Object.entries(iconRefsByCard.value).filter(([cardIndex]) => (
		Number(cardIndex) >= 0 && Number(cardIndex) < formCount.value
	)),
);

const renderIconDrawings = async (): Promise<void> => {
	// 初次挂载时图标状态先于模板响应变化，工作簿就绪前不查询 Schema。
	if (!workbook || !univerAPI) return;
	const iconRow = iconFieldRow();
	if (iconRow === undefined) {
		iconDrawingRenderer.clear(workbook);
		return;
	}
	if (iconPermission()?.is_query === false) {
		iconDrawingRenderer.clear(workbook);
		return;
	}
	try {
		await iconDrawingRenderer.render(workbook, univerAPI, {
			rowsPerBlock: rowsPerBlock(),
			columnsPerBlock: colsPerBlock(),
			iconRelativeRow: iconRow,
			iconRefsByCard: getRenderableIconRefs(),
			resolveImageUrls: resolveIconDrawingUrls,
		});
	} catch (error) {
		console.error('渲染规格提报 Icon 图片失败:', error);
	}
};

const scheduleIconDrawingLayoutRefresh = (): void => {
	if (iconDrawingLayoutRefreshTimer !== null) {
		window.clearTimeout(iconDrawingLayoutRefreshTimer);
	}
	iconDrawingLayoutRefreshTimer = window.setTimeout(() => {
		iconDrawingLayoutRefreshTimer = null;
		void renderIconDrawings();
	}, ICON_DRAWING_LAYOUT_REFRESH_DELAY);
};

watch(iconRefsByCard, () => {
	void renderIconDrawings();
}, { deep: true });

/** 读取当前活动工作表的单元格原值；工作表未就绪时返回空串。 */
const readActiveSheetCellValue = (row: number, col: number) => {
	const activeSheet = workbook?.getActiveSheet();
	return activeSheet ? readSheetCellValue(activeSheet, row, col) : '';
};
let disposeSelectionInteractionGuard: (() => void) | null = null;
const CLEAR_SELECTION_CONTENT_COMMAND_ID = 'sheet.command.clear-selection-content';
const AUTO_FILL_COMMAND_ID = 'sheet.command.auto-fill';
const MOVE_RANGE_COMMAND_ID = 'sheet.command.move-range';
const MOVE_ROWS_COMMAND_ID = 'sheet.command.move-rows';
const MOVE_COLS_COMMAND_ID = 'sheet.command.move-cols';
const REORDER_RANGE_COMMAND_ID = 'sheet.command.reorder-range';
const BLOCKED_UNIVER_COMMAND_IDS = new Set([
	CLEAR_SELECTION_CONTENT_COMMAND_ID,
	AUTO_FILL_COMMAND_ID,
	MOVE_RANGE_COMMAND_ID,
	MOVE_ROWS_COMMAND_ID,
	MOVE_COLS_COMMAND_ID,
	REORDER_RANGE_COMMAND_ID,
]);
const formCount = ref(1);
const searchQuery = ref('');
const isDeletingProduct = ref(false);
const BUILTIN_FORM_FIELD_KEYS = new Set([
	'brand',
	'nickname',
	'fullName',
	'efficacy',
	'gifts',
	'thresholdA',
	'sellingPoint',
	'price',
	'dateRange',
	'remarks',
	// icon 由 IconSelector 下拉框承载，不再走通用 textarea。
	'icon',
]);
const dynamicTextFields = ref<FieldDef[]>([]);
const dynamicFieldValues = ref<Record<string, string>>({});

const resetDynamicFieldValues = () => {
	dynamicFieldValues.value = Object.fromEntries(
		dynamicTextFields.value.map((field) => [field.key, ''])
	);
};

const loadTemplateSchema = async (templateCode: string, schema?: any) => {
	const templateSchema = schema || await fetchTemplateSchema(templateCode);
	registerTemplate(templateSchema);
	templateName.value = templateSchema.label || '';
	templateIconName.value = templateSchema.icon || '';
	templateRemark.value = templateSchema.remark || '';
	dynamicTextFields.value = (templateSchema.fields || []).filter(
		(field: FieldDef) =>
			!BUILTIN_FORM_FIELD_KEYS.has(field.key) &&
			(field.kind === 'text' || field.kind === 'longtext')
	);
	resetDynamicFieldValues();
};

const fetchTemplateSchema = async (templateCode: string) => {
	const result: any = await GetTemplateSchema(templateCode);
	if (result.code !== 2000 || !result.data) {
		throw new Error(result.msg || `未能加载模板“${templateCode}”`);
	}
	return result.data;
};

/**
 * 从 snapshot 推回每列的自定义名：仅当表头非空且不是 `商品提报 N` 旧格式时记录。
 * 旧数据视为无自定义名，让自动回显接管；空白列不写入。
 */
/**
 * 从 snapshot 推回每列的自定义名。
 * 当前不还原：历史表头可能只写了一个主品的简称，或与产品库口径不一致，
 * 还可能卡死后续"加主品"的自动回显。让所有历史列都走自动回显路径，
 * 直到用户在弹窗里主动改名时才写入 productColumnNames。
 */
const inferColumnNamesFromSnapshot = (_snapshot: any, _productCount: number): Record<number, string> => {
	return {};
};

const inferFormCountFromSnapshot = (snapshot: any): number => {
	const sheets = snapshot?.sheets;
	if (!sheets || typeof sheets !== 'object') return 0;
	const firstSheet = Object.values(sheets)[0] as any;
	const cellData = firstSheet?.cellData;
	if (!cellData || typeof cellData !== 'object') return 0;

	const rpb = rowsPerBlock();
	const cpb = storageColumnsPerBlock();
	const nicknameRow = rowOf('nickname');
	let count = 0;
	for (let blockStartRow = 0; blockStartRow < Number(firstSheet?.rowCount || 0); blockStartRow += rpb) {
		const headerRow = cellData[String(blockStartRow)];
		if (!headerRow || typeof headerRow !== 'object') continue;
		for (let col = 1; col <= cpb; col++) {
			const headerCell = headerRow[String(col)];
			const headerValue = headerCell && typeof headerCell === 'object' ? headerCell.v : headerCell;
			// 旧数据：表头写死 `商品提报 N`；新数据：表头可能为空、也可能为自定义名。
			// 凡表头以 `商品提报 ` 前缀开头视为已存在列。
			if (String(headerValue || '').trim().startsWith(PRODUCT_HEADER_PREFIX)) { count++; continue; }
			// 新增 fallback：表头被改名或为空时，以 nickname 单元格是否有内容为准。
			const nicknameRowData = cellData[String(blockStartRow + nicknameRow)];
			const nicknameCell = nicknameRowData?.[String(col)];
			const nicknameValue = nicknameCell && typeof nicknameCell === 'object' ? nicknameCell.v : nicknameCell;
			if (String(nicknameValue || '').trim()) count++;
		}
	}
	return count;
};

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

// ========== Tabbed Navigation state & Popup State ==========
const currentColIndex = ref(0);
const formDialogVisible = ref(false);
const formDialogMaximized = ref(false);
const dialogFormScrollBodyRef = ref<HTMLElement | null>(null);
const pendingDialogFieldKey = ref<string | null>(null);
const prevColIndex = ref(0);

const focusDialogField = (fieldKey: string) => {
	const scrollBody = dialogFormScrollBodyRef.value;
	if (!scrollBody) return;
	const escapedFieldKey = window.CSS?.escape ? window.CSS.escape(fieldKey) : fieldKey.replace(/"/g, '\\"');
	const target = scrollBody.querySelector<HTMLElement>(`[data-field-key="${escapedFieldKey}"]`);
	if (!target) return;

	const scrollBodyRect = scrollBody.getBoundingClientRect();
	const targetRect = target.getBoundingClientRect();
	const scrollTop = Math.max(0, scrollBody.scrollTop + targetRect.top - scrollBodyRect.top - 12);
	scrollBody.scrollTo({ top: scrollTop, behavior: 'auto' });
	const focusTarget = target.querySelector<HTMLElement>(
		'input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), [contenteditable="true"]'
	);
	if (focusTarget) {
		focusTarget.focus({ preventScroll: true });
		if (focusTarget instanceof HTMLInputElement || focusTarget instanceof HTMLTextAreaElement) {
			const cursorPosition = focusTarget.value.length;
			focusTarget.setSelectionRange?.(cursorPosition, cursorPosition);
		}
	} else {
		target.focus({ preventScroll: true });
	}
};

const handleFormDialogOpened = () => {
	const fieldKey = pendingDialogFieldKey.value;
	pendingDialogFieldKey.value = null;
	if (!fieldKey) return;
	window.requestAnimationFrame(() => focusDialogField(fieldKey));
};

const toggleFormDialogFullscreen = () => {
	formDialogMaximized.value = !formDialogMaximized.value;
};

const handleFormDialogEscape = () => {
	if (formDialogMaximized.value) {
		formDialogMaximized.value = false;
		return;
	}
	formDialogVisible.value = false;
};

const handleBeforeDialogClose = (done: () => void) => {
	formDialogMaximized.value = false;
	done();
};

watch(formDialogVisible, (visible) => {
	if (!visible) {
		formDialogMaximized.value = false;
		pendingDialogFieldKey.value = null;
	}
});

// ========== Form Editor fields ==========
const brandVal = ref('');
const formMainProducts = ref<FormMainProductItem[]>([]);
const formEfficacyItems = ref<EfficacyItem[]>([]);
const efficacyItemsByCard = ref<Record<number, EfficacyItem[]>>({});
const priceVal = ref('');
const startDateVal = ref('');
const endDateVal = ref('');
const sellingPointVal = ref('');
const remarksVal = ref('');

const mainProductFullNames = computed(() =>
	formMainProducts.value.map((item) => item.fullName).filter(Boolean).join(MAIN_PRODUCT_SEPARATOR)
);

const buildFormProductNumberRegistry = () => {
	const registry = createProductNumberRegistry(rawProductList.value);
	const registerIfEligible = (reference: {
		productCode?: string;
		nickname: string;
		fullName: string;
		spec: string;
	}) => {
		if (isMedicalDeviceProduct(reference)) return;
		registry.register({
			productCode: reference.productCode || '',
			nickname: reference.nickname,
			fullName: reference.fullName,
			spec: reference.spec,
		});
	};
	formMainProducts.value.forEach((item) => registerIfEligible(item));
	formGiftStrategies.value.forEach((strategy) => strategy.items.forEach(registerIfEligible));
	formTiers.value.forEach((tier) => tier.items.forEach(registerIfEligible));
	return registry;
};

const formEfficacyStartNumber = computed(() =>
	buildFormProductNumberRegistry().ordered.length + 1
);

// Icon 下拉框（产品表单弹窗内）：候选与编号起点。
const formIconRefs = ref<IconRef[]>([]);
const formIconLoading = ref(false);
const formIconMasked = computed(() => iconPermission()?.is_query === false);
const formIconEditable = computed(() => {
	const row = iconFieldRow();
	if (row === undefined) return false;
	return hasFormattingFieldPermission(row);
});

const formMainProductCodes = computed(() => {
	const seen = new Set<string>();
	const codes: string[] = [];
	for (const item of formMainProducts.value) {
		const product = findProductByMainRef(item.nickname, item.spec, item.fullName);
		const code = String(
			product?.productCode
			|| resolveProductReference({
				productCode: '',
				nickname: item.nickname,
				fullName: item.fullName,
				spec: item.spec,
			}, rawProductList.value).productCode
			|| '',
		).trim();
		if (code && !seen.has(code)) {
			seen.add(code);
			codes.push(code);
		}
	}
	return codes;
});

const formIconOptions = computed<IconOption[]>(() => {
	iconResolverRevision.value;
	return iconResolver.optionsFor(formMainProductCodes.value);
});

const formIconStartNumber = computed(() =>
	formEfficacyStartNumber.value + countEfficacyFootnotes(formEfficacyItems.value)
);

const refreshFormIconOptions = async () => {
	const codes = formMainProductCodes.value;
	if (!codes.length) {
		formIconLoading.value = false;
		return;
	}
	if (!codes.some((code) => iconResolver.getSync(code) === undefined)) return;
	formIconLoading.value = true;
	try {
		await iconResolver.ensure(codes);
	} finally {
		formIconLoading.value = false;
	}
};

watch([formMainProductCodes, formDialogVisible], ([codes, visible]) => {
	if (visible && codes.length) void refreshFormIconOptions();
});

const formEfficacyAssistantText = computed(() => {
	const entries: string[] = [];
	const seen = new Set<string>();
	for (const item of formMainProducts.value) {
		const product = findProductByMainRef(item.nickname, item.spec, item.fullName);
		const content = String(product?.efficacyScope || '').trim();
		if (!content || content === '***') continue;
		const key = `${item.nickname}\n${content}`;
		if (seen.has(key)) continue;
		seen.add(key);
		entries.push(formMainProducts.value.length > 1 ? `${item.nickname}：${content}` : content);
	}
	return entries.join('\n\n');
});

const copyEfficacyAssistant = async () => {
	if (!formEfficacyAssistantText.value) return;
	try {
		await copyTextToClipboard(formEfficacyAssistantText.value);
		successMessage('产品档案功效辅助信息已复制');
	} catch {
		errorMessage('复制失败，请手动选择复制');
	}
};

const buildMainProductKey = (prod: Pick<DBProductItem, 'nickname' | 'fullName' | 'spec'>): string =>
	`${prod.nickname || ''}__${prod.fullName || ''}__${prod.spec || ''}`;

const createMainProductItem = (prod: DBProductItem): FormMainProductItem => ({
	key: buildMainProductKey(prod),
	cleanNick: prod.nickname,
	nickname: prod.nickname,
	brand: prod.brand || '',
	fullName: prod.fullName || '',
	spec: prod.spec || '',
	qty: 1,
	unit: resolveProductUnit(prod),
});

const dateRangeVal = computed({
	get() {
		if (startDateVal.value && endDateVal.value) return [startDateVal.value, endDateVal.value];
		return [];
	},
	set(val) {
		if (Array.isArray(val) && val.length === 2) {
			startDateVal.value = val[0] || '';
			endDateVal.value = val[1] || '';
			return;
		}
		startDateVal.value = '';
		endDateVal.value = '';
	}
});

const formGiftStrategies = ref<GiftStrategy[]>([]);
const giftStrategiesByCard = ref<Record<number, GiftStrategy[]>>({});

const cloneGiftStrategies = (strategies: GiftStrategy[]): GiftStrategy[] =>
	strategies.map((strategy) => ({
		...strategy,
		items: strategy.items.map((item) => ({ ...item })),
	}));

const formTiers = ref<FormTierItem[]>([]);
const tierStrategiesByCard = ref<Record<number, FormTierItem[]>>({});

const { parseTiersFromText } = createFormTierText(() => rawProductList.value);

const mainSearchQuery = ref('');
const showMainDropdown = ref(false);
const matchingMainProducts = ref<DBProductItem[]>([]);
const tierSelectedProductKeys = ref<Record<number, string>>({});
const isAddingNewProduct = ref(false);
const columnNameDraft = ref('');

const resetFormToDefault = () => {
	brandVal.value = '';
	formMainProducts.value = [];
	formEfficacyItems.value = [];
	priceVal.value = '';
	startDateVal.value = '';
	endDateVal.value = '';
	sellingPointVal.value = '';
	remarksVal.value = '';
	resetDynamicFieldValues();
	formGiftStrategies.value = [];
	formTiers.value = [];
	formIconRefs.value = [];
	mainSearchQuery.value = '';
	showMainDropdown.value = false;
	matchingMainProducts.value = [];
	tierSelectedProductKeys.value = {};
};

const matchProds = (q: string) => {
	if (!q) return rawProductList.value;
	const lq = q.toLowerCase();
	return rawProductList.value.filter(p =>
		(p.nickname && p.nickname.toLowerCase().includes(lq)) ||
		(p.fullName && p.fullName.toLowerCase().includes(lq)) ||
		(p.productCode && p.productCode.toLowerCase().includes(lq))
	);
};

const handleMainSearchInput = (val: string) => {
	mainSearchQuery.value = val;
	matchingMainProducts.value = matchProds(val);
	showMainDropdown.value = true;
};

const selectMainProductFromDropdown = (prod: DBProductItem) => {
	const item = createMainProductItem(prod);
	const existing = formMainProducts.value.find((selected) => selected.key === item.key);
	if (existing) {
		existing.qty = normalizeQty(existing.qty + 1);
	} else {
		const isFirstProduct = formMainProducts.value.length === 0;
		formMainProducts.value.push(item);
		if (isFirstProduct) {
			brandVal.value = prod.brand || '';
		}
	}
	mainSearchQuery.value = '';
	showMainDropdown.value = false;
};

const ensureMainProductName = () => {
	if (formMainProducts.value.length > 0) return true;
	warningMessage('没有该产品请先维护');
	return false;
};

const removeMainProductFromForm = (idx: number) => {
	formMainProducts.value.splice(idx, 1);
};

const formatRetailPrice = (price: string): string =>
	String(price || '').trim() ? `${price} 元` : '待同步';

const addTierGiftFromForm = (tierId: number, prod: DBProductItem) => {
	const tier = formTiers.value.find(t => t.id === tierId);
	if (tier) tier.items.push({
		productCode: prod.productCode,
		nickname: resolveProductDisplayName(prod),
		fullName: prod.fullName,
		spec: prod.spec,
		qty: 1,
		unit: resolveProductUnit(prod),
		retailPrice: prod.retailPrice,
	});
	tierSelectedProductKeys.value[tierId] = '';
};

const addSelectedTierGiftFromForm = (tierId: number) => {
	const selectedKey = tierSelectedProductKeys.value[tierId];
	const product = rawProductList.value.find(
		(item) => getProductSelectionKey(item) === selectedKey
	);
	if (!product) {
		warningMessage('请先选择赠品商品');
		return;
	}
	addTierGiftFromForm(tierId, product);
};

const removeTierGiftFromForm = (tierId: number, giftIdx: number) => {
	const tier = formTiers.value.find(t => t.id === tierId);
	if (tier) tier.items.splice(giftIdx, 1);
};

const addTierFromForm = () => {
	const newId = formTiers.value.length + 1;
	formTiers.value.push({ id: newId, threshold: '', value: '', items: [] });
};

const removeTierFromForm = (idx: number) => {
	formTiers.value.splice(idx, 1);
};

watch(formTiers, (tiers) => tiers.forEach(syncTierValue), { deep: true });

const handleQuickAdd = () => {
	if (!ensureEditableSubmission()) return;
	isAddingNewProduct.value = true;
	const targetIndex = findFirstBlankColumnIndex();
	currentColIndex.value = targetIndex;
	prevColIndex.value = targetIndex;
	columnNameDraft.value = '';
	resetFormToDefault();
	formDialogVisible.value = true;
};

const handleDialogColumnChange = (newVal: number) => {
	// Save current column state first using prevColIndex
	const _originalCol = currentColIndex.value;
	currentColIndex.value = prevColIndex.value;
	syncFormToUniver();

	// Switch to new column index
	currentColIndex.value = newVal;
	prevColIndex.value = newVal;
	syncUniverToForm();
};


const handleDialogCancel = () => {
	// Discard local changes by syncing from Univer back to form
	const wasAddingNewProduct = isAddingNewProduct.value;
	isAddingNewProduct.value = false;
	if (!wasAddingNewProduct) syncUniverToForm();
	formDialogVisible.value = false;
};

const ensureEditableSubmission = () => {
	if (canEditSubmission.value) return true;
	if (submissionStatus.value === 'submitted') {
		warningMessage('当前提报已正式提交归档锁定，仅支持查看与导出！');
	} else {
		warningMessage('当前工单为只读，您没有修改权限');
	}
	return false;
};

const ensureProductColumnExists = (targetIndex: number) => {
	while (targetIndex >= formCount.value) {
		appendNewProductColumn();
	}
};

const ensureDialogCanWrite = () => {
	if (!ensureEditableSubmission()) return false;
	if (!ensureMainProductName()) return false;
	const targetIndex = isAddingNewProduct.value ? findFirstBlankColumnIndex() : currentColIndex.value;
	if (targetIndex < 0) {
		errorMessage('规格表未初始化，无法回显');
		return false;
	}
	ensureProductColumnExists(targetIndex);
	currentColIndex.value = targetIndex;
	prevColIndex.value = targetIndex;
	return true;
};

const writeDialogToSheet = () => {
	if (!ensureDialogCanWrite()) return false;
	syncFormToUniver();
	markDirty();
	return true;
};

const prepareNextAddForm = () => {
	isAddingNewProduct.value = true;
	const targetIndex = findFirstBlankColumnIndex();
	currentColIndex.value = targetIndex;
	prevColIndex.value = targetIndex;
	columnNameDraft.value = '';
	resetFormToDefault();
};

/**
 * 校验弹窗内的列名输入：当前不做唯一性校验，仅 trim。
 */
const validateColumnNameDraft = (): boolean => {
	return true;
};

const commitColumnNameDraft = () => {
	const idx = currentColIndex.value;
	const name = columnNameDraft.value.trim();
	if (name) productColumnNames.value = { ...productColumnNames.value, [idx]: name };
	else if (productColumnNames.value[idx]) {
		const { [idx]: _drop, ...rest } = productColumnNames.value;
		productColumnNames.value = rest;
	}
	// 刷新表头单元格（保持样式）
	const activeSheet = workbook?.getActiveSheet();
	if (activeSheet) {
		const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
		activeSheet.getRange(blockStartRow, blockCol, 1, 1).setValueForCell(
			getProductHeaderCellData(idx, currentTheme.value, canEditSubmission.value),
		);
		// 自定义名变更可能让其它列的显示后缀也变化，全列重写一次。
		renderProductCopyIcons();
	}
};

const handleDialogConfirm = () => {
	if (!validateColumnNameDraft()) return;
	if (!writeDialogToSheet()) return;
	commitColumnNameDraft();
	isAddingNewProduct.value = false;
	formDialogVisible.value = false;
	successMessage('已回显到规格表');
};

const handleDialogContinueAdd = () => {
	if (!validateColumnNameDraft()) return;
	if (!writeDialogToSheet()) return;
	commitColumnNameDraft();
	prepareNextAddForm();
	successMessage('已回显，可继续新增');
};

const moveProductCardCells = (activeSheet: any, sourceIndex: number, targetIndex: number) => {
	const source = getProductCoords(sourceIndex, rowsPerBlock(), colsPerBlock());
	const target = getProductCoords(targetIndex, rowsPerBlock(), colsPerBlock());
	const theme = currentTheme.value;
	activeSheet.getRange(target.blockStartRow, target.blockCol, 1, 1).setValueForCell(
		getProductHeaderCellData(targetIndex, theme, canEditSubmission.value),
	);
	for (const field of getFields(currentTemplateType.value)) {
		const value = readSheetCellValue(activeSheet, source.blockStartRow + field.row, source.blockCol);
		activeSheet.getRange(target.blockStartRow + field.row, target.blockCol, 1, 1).setValue({
			v: value,
			s: styleToUniverStyleName(field.style, theme),
		});
	}
};

/**
 * 列名（存储层）：用户自定义名 || 主品简称自动回显 || ''。
 * 自动回显：单主品取第一个简称；多主品用 + 连接各简称。不做唯一性校验。
 * 仅写回 productColumnNames 的为自定义名；自动回显不写回，避免读回循环。
 */
const getProductColumnName = (idx: number): string => {
	const custom = productColumnNames.value[idx];
	if (custom && custom.trim()) return custom.trim();
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return '';
	const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
	const nicknameRaw = readSheetCellValue(activeSheet, blockStartRow + rowOf('nickname'), blockCol);
	const fullNameRaw = readSheetCellValue(activeSheet, blockStartRow + rowOf('fullName'), blockCol);
	const refs = parseMainProductRefs(nicknameRaw, '', fullNameRaw);
	return refs.map((r) => r.cleanNick).filter(Boolean).join(MAIN_PRODUCT_SEPARATOR);
};

/**
 * 显示名（显示层）：空白列回退为 `商品提报 N`；列名不做撞名去重。
 */
const getProductDisplayLabel = (idx: number): string => {
	const name = getProductColumnName(idx);
	return name || `${PRODUCT_HEADER_PREFIX}${idx + 1}`;
};

const getProductHeaderCellData = (
	productIndex: number,
	theme: string,
	_editable: boolean,
	styleName = `productHeaderStyle_${theme}`,
) => {
	// 空白列（无自定义名 + 无主品简称）写空字符串到单元格，回退显示交给 UI 层。
	const storageName = getProductColumnName(productIndex);
	return {
		v: storageName,
		s: styleName,
	};
};

const isProductCardPopulated = (activeSheet: any, productIndex: number) => {
	const { blockCol, blockStartRow } = getProductCoords(productIndex, rowsPerBlock(), colsPerBlock());
	const nickname = String(readSheetCellValue(activeSheet, blockStartRow + rowOf('nickname'), blockCol) || '').trim();
	const fullName = String(readSheetCellValue(activeSheet, blockStartRow + rowOf('fullName'), blockCol) || '').trim();
	return Boolean(nickname || fullName);
};

const handleProductCopyScroll = (params: any) => {
	const nextX = Number(params?.viewportScrollX ?? params?.scrollX);
	const nextY = Number(params?.viewportScrollY ?? params?.scrollY);
	if (Number.isFinite(nextX)) productCopyScrollPosition.x = nextX;
	if (Number.isFinite(nextY)) productCopyScrollPosition.y = nextY;
	scheduleProductCopyButtonPositionUpdate();
};

const disposeProductCopyViewportScroll = () => {
	if (productCopyViewportBindFrame !== null) {
		window.cancelAnimationFrame(productCopyViewportBindFrame);
		productCopyViewportBindFrame = null;
	}
	for (const subscription of productCopyViewportSubscriptions) {
		if (subscription.dispose) subscription.dispose();
		else subscription.unsubscribe?.();
	}
	productCopyViewportSubscriptions = [];
};

const bindProductCopyViewportScroll = (univer: any, activeWorkbook: any) => {
	disposeProductCopyViewportScroll();
	productCopyScrollPosition = { x: 0, y: 0 };
	const unitId = activeWorkbook?.getId?.();
	let attemptsRemaining = 120;

	const tryBind = () => {
		productCopyViewportBindFrame = null;
		try {
			const renderManager = univer.__getInjector().get(IRenderManagerService);
			const render = unitId ? renderManager.getRenderById(unitId) : null;
			const viewport = render?.scene?.getViewport?.(SHEET_VIEWPORT_KEY.VIEW_MAIN);
			if (viewport) {
				handleProductCopyScroll({
					viewportScrollX: viewport.viewportScrollX,
					viewportScrollY: viewport.viewportScrollY,
				});
				productCopyViewportSubscriptions = [
					viewport.onScrollAfter$.subscribeEvent(handleProductCopyScroll),
					viewport.onScrollByBar$.subscribeEvent(handleProductCopyScroll),
				];
				return;
			}
		} catch (error) {
			if (attemptsRemaining <= 1) {
				console.warn('绑定商品复制按钮滚动位置失败', error);
			}
		}

		attemptsRemaining -= 1;
		if (attemptsRemaining > 0) {
			productCopyViewportBindFrame = window.requestAnimationFrame(tryBind);
		}
	};

	tryBind();
};

const updateProductCopyButtonPositions = () => {
	const wrapper = univerWrapperRef.value;
	const container = univerContainerRef.value;
	const activeSheet = workbook?.getActiveSheet?.() || sheet;
	const skeleton = activeSheet?.getSkeleton?.();
	if (!wrapper || !container || !activeSheet || !skeleton?.getCellWithCoordByIndex) {
		productCopyButtons.value = [];
		return;
	}

	const canvas = container.querySelector<HTMLCanvasElement>('canvas[id^="univer-sheet-main-canvas"]');
	const renderTarget = canvas || container;
	const wrapperRect = wrapper.getBoundingClientRect();
	const renderRect = renderTarget.getBoundingClientRect();
	const { x: scrollX, y: scrollY } = productCopyScrollPosition;
	const zoom = Number(activeSheet.getZoom?.() || 1);
	const buttonSize = Math.round(22 * zoom);
	const buttonGap = Math.round(6 * zoom);
	const iconSize = Math.round(15 * zoom);
	const firstScrollableCell = skeleton.getCellWithCoordByIndex(0, FROZEN_FIELD_COLUMN_COUNT, false);
	const viewportLeft = renderRect.left - wrapperRect.left + Number(firstScrollableCell?.startX || 0) * zoom;
	const viewportTop = renderRect.top - wrapperRect.top;
	const viewportRight = renderRect.right - wrapperRect.left;
	const viewportBottom = renderRect.bottom - wrapperRect.top;
	const positions: Array<{
		index: number;
		left: number;
		top: number;
		size: number;
		iconSize: number;
	}> = [];

	for (let productIndex = 0; productIndex < formCount.value; productIndex++) {
		if (!isProductCardPopulated(activeSheet, productIndex)) continue;

		const { blockCol, blockStartRow } = getProductCoords(productIndex, rowsPerBlock(), colsPerBlock());
		const cell = skeleton.getCellWithCoordByIndex(blockStartRow, blockCol, false);
		if (!cell) continue;

		const mergeInfo = cell.mergeInfo;
		const startColumn = mergeInfo?.startColumn ?? blockCol;
		const endColumn = mergeInfo?.endColumn ?? blockCol + 1;
		const startRow = mergeInfo?.startRow ?? blockStartRow;
		const endRow = mergeInfo?.endRow ?? blockStartRow + 1;
		const rawStartX = Number.isFinite(Number(cell.startX))
			? Number(cell.startX)
			: skeleton.getOffsetByColumn(startColumn - 1);
		const rawEndX = Number.isFinite(Number(cell.endX))
			? Number(cell.endX)
			: skeleton.getOffsetByColumn(endColumn);
		const rawStartY = Number.isFinite(Number(cell.startY))
			? Number(cell.startY)
			: skeleton.getOffsetByRow(startRow);
		const rawEndY = Number.isFinite(Number(cell.endY))
			? Number(cell.endY)
			: skeleton.getOffsetByRow(endRow);
		const cellStartX = (rawStartX - scrollX) * zoom;
		const cellEndX = (rawEndX - scrollX) * zoom;
		const cellStartY = (rawStartY - scrollY) * zoom;
		const cellEndY = (rawEndY - scrollY) * zoom;
		if (!(cellEndX > cellStartX) || !(cellEndY > cellStartY)) continue;
		const left = renderRect.left - wrapperRect.left + cellEndX - buttonSize - buttonGap;
		const top = renderRect.top - wrapperRect.top + cellStartY + Math.max(0, (cellEndY - cellStartY - buttonSize) / 2);
		if (left < viewportLeft || left + buttonSize > viewportRight || top < viewportTop || top + buttonSize > viewportBottom) {
			continue;
		}

		positions.push({
			index: productIndex,
			left,
			top,
			size: buttonSize,
			iconSize,
		});
	}

	productCopyButtons.value = positions;
};

const getResponsiveProductColumnCount = (wrapper: HTMLElement | null = univerWrapperRef.value) => {
	const maxColumns = storageColumnsPerBlock();
	if (!wrapper) return maxColumns;
	const availableWidth = wrapper.clientWidth - PRODUCT_FIELD_COLUMN_WIDTH - 16;
	if (availableWidth <= 0) return 1;
	return Math.max(1, Math.min(maxColumns, Math.floor(availableWidth / PRODUCT_COLUMN_TARGET_WIDTH)));
};

const getProductColumnWidth = (wrapper: HTMLElement, columnsPerRow: number) => {
	const availableWidth = wrapper.clientWidth - PRODUCT_FIELD_COLUMN_WIDTH - 16;
	if (availableWidth <= 0) return PRODUCT_COLUMN_MIN_WIDTH;
	return Math.round(Math.min(
		PRODUCT_COLUMN_MAX_WIDTH,
		Math.max(PRODUCT_COLUMN_MIN_WIDTH, availableWidth / Math.max(1, columnsPerRow)),
	));
};

const cloneProductCellData = (cell: any) =>
	cell && typeof cell === 'object' ? JSON.parse(JSON.stringify(cell)) : cell;

const remapProductCellCoordinate = (
	coordinate: { row: number; col: number } | null,
	fromColumns: number,
	toColumns: number,
) => {
	if (!coordinate || coordinate.col < 1 || coordinate.col > fromColumns) return coordinate;
	const rpb = rowsPerBlock();
	const productIndex = Math.floor(coordinate.row / rpb) * fromColumns + coordinate.col - 1;
	if (productIndex < 0 || productIndex >= formCount.value) return coordinate;
	const target = getProductCoords(productIndex, rpb, toColumns);
	return {
		row: target.blockStartRow + coordinate.row % rpb,
		col: target.blockCol,
	};
};

const reflowActiveProductColumns = (fromColumns: number, toColumns: number) => {
	const activeSheet = workbook?.getActiveSheet?.() || sheet;
	if (!activeSheet || fromColumns === toColumns || formCount.value <= 0) return;

	const rpb = rowsPerBlock();
	const maxColumns = Math.max(storageColumnsPerBlock(), fromColumns, toColumns);
	const activeCell = getActiveCellCoordinates();
	const productCells = Array.from({ length: formCount.value }, (_, productIndex) => {
		const source = getProductCoords(productIndex, rpb, fromColumns);
		return Array.from({ length: rpb }, (_, relativeRow) => cloneProductCellData(
			activeSheet.getRange(source.blockStartRow + relativeRow, source.blockCol, 1, 1).getCellData(),
		));
	});
	const sourceBlockCount = Math.ceil(formCount.value / fromColumns);
	const targetBlockCount = Math.ceil(formCount.value / toColumns);
	const blocksToClear = Math.max(sourceBlockCount, targetBlockCount);

	isHandlingEvent = true;
	try {
		for (let blockIndex = 0; blockIndex < blocksToClear; blockIndex++) {
			const blockStartRow = blockIndex * rpb;
			activeSheet.getRange(blockStartRow, 0, rpb, maxColumns + 1).clear();
		}

		layoutColumnsPerBlock.value = toColumns;
		for (let productIndex = 0; productIndex < productCells.length; productIndex++) {
			const target = getProductCoords(productIndex, rpb, toColumns);
			for (let relativeRow = 0; relativeRow < rpb; relativeRow++) {
				const cell = productCells[productIndex][relativeRow];
				if (cell !== undefined && cell !== null) {
					activeSheet
						.getRange(target.blockStartRow + relativeRow, target.blockCol, 1, 1)
						.setValueForCell(cell);
				}
			}
		}

		updateSheetLabels();
		currentEditingCell.value = remapProductCellCoordinate(currentEditingCell.value, fromColumns, toColumns);
		formattingPointerCell.value = remapProductCellCoordinate(formattingPointerCell.value, fromColumns, toColumns);
		richTextTargetCell.value = remapProductCellCoordinate(richTextTargetCell.value, fromColumns, toColumns);
		const remappedActiveCell = remapProductCellCoordinate(activeCell, fromColumns, toColumns);
		if (remappedActiveCell && (
			remappedActiveCell.row !== activeCell?.row || remappedActiveCell.col !== activeCell?.col
		)) {
			activeSheet.setActiveRange(
				activeSheet.getRange(remappedActiveCell.row, remappedActiveCell.col, 1, 1),
			);
		}
		try {
			activeSheet.autoResizeRows(0, Math.ceil(formCount.value / toColumns) * rpb);
		} catch (error) {
			console.warn('自适应商品提报行高失败:', error);
		}
	} finally {
		isHandlingEvent = false;
	}

	appliedProductColumnCount = toColumns;
	renderProductCopyIcons();
};

const updateProductColumnWidths = () => {
	const activeSheet = workbook?.getActiveSheet?.() || sheet;
	const wrapper = univerWrapperRef.value;
	if (!activeSheet || !wrapper) return;

	const maxColumns = storageColumnsPerBlock();
	const nextColumns = getResponsiveProductColumnCount(wrapper);
	const currentColumns = colsPerBlock();
	if (nextColumns !== currentColumns) {
		reflowActiveProductColumns(currentColumns, nextColumns);
	}

	const columnsPerRow = Math.max(1, colsPerBlock());
	const nextWidth = getProductColumnWidth(wrapper, columnsPerRow);
	if (!Number.isFinite(nextWidth) || nextWidth <= 0) return;
	if (appliedProductColumnWidth === nextWidth && appliedProductColumnCount === columnsPerRow) {
		scheduleProductCopyButtonPositionUpdate();
		scheduleIconDrawingLayoutRefresh();
		return;
	}

	appliedProductColumnWidth = nextWidth;
	appliedProductColumnCount = columnsPerRow;
	for (let column = 1; column <= maxColumns; column++) {
		try {
			activeSheet.setColumnWidth(column, nextWidth);
		} catch (error) {
			console.warn('同步商品提报列宽失败:', error);
		}
	}
	try {
		activeSheet.showColumns(1, maxColumns);
		if (columnsPerRow < maxColumns) {
			activeSheet.hideColumns(columnsPerRow + 1, maxColumns - columnsPerRow);
		}
	} catch (error) {
		console.warn('同步商品提报可见列失败:', error);
	}
	scheduleProductCopyButtonPositionUpdate();
	scheduleIconDrawingLayoutRefresh();
};

const flushProductColumnWidthUpdate = () => {
	productColumnResizeTimer = null;
	if (productColumnWidthFrame !== null) return;
	productColumnWidthFrame = window.requestAnimationFrame(() => {
		productColumnWidthFrame = null;
		updateProductColumnWidths();
	});
};

const scheduleProductColumnWidthUpdate = () => {
	if (productColumnResizeTimer !== null) {
		window.clearTimeout(productColumnResizeTimer);
	}
	productColumnResizeTimer = window.setTimeout(
		flushProductColumnWidthUpdate,
		PRODUCT_RESIZE_SETTLE_DELAY,
	);
};

const handleProductWrapperResize = () => {
	const wrapper = univerWrapperRef.value;
	if (!wrapper) return;
	const size = `${wrapper.clientWidth}x${wrapper.clientHeight}`;
	if (size === lastProductWrapperSize) return;
	lastProductWrapperSize = size;
	scheduleProductColumnWidthUpdate();
};

const observeProductColumnWidth = () => {
	productColumnResizeObserver?.disconnect();
	productColumnResizeObserver = null;
	lastProductWrapperSize = '';
	const wrapper = univerWrapperRef.value;
	if (!wrapper) return;

	if (typeof ResizeObserver !== 'undefined') {
		productColumnResizeObserver = new ResizeObserver(handleProductWrapperResize);
		productColumnResizeObserver.observe(wrapper);
	}
	scheduleProductColumnWidthUpdate();
};

const scheduleProductCopyButtonPositionUpdate = () => {
	if (productCopyPositionFrame !== null) return;
	productCopyPositionFrame = window.requestAnimationFrame(() => {
		productCopyPositionFrame = null;
		updateProductCopyButtonPositions();
	});
};

const renderProductCopyIcons = () => {
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet || formCount.value < 1) {
		productCopyButtons.value = [];
		return;
	}

	const theme = currentTheme.value;
	for (let productIndex = 0; productIndex < formCount.value; productIndex++) {
		const { blockCol, blockStartRow } = getProductCoords(productIndex, rowsPerBlock(), colsPerBlock());
		activeSheet.getRange(blockStartRow, blockCol, 1, 1).setValueForCell(
			getProductHeaderCellData(productIndex, theme, canEditSubmission.value),
		);
	}

	const next = getProductCoords(formCount.value, rowsPerBlock(), colsPerBlock());
	activeSheet.getRange(next.blockStartRow, next.blockCol, 1, 1).clear();
	scheduleProductCopyButtonPositionUpdate();
};

const copyProductCardCells = (activeSheet: any, sourceIndex: number, targetIndex: number) => {
	const source = getProductCoords(sourceIndex, rowsPerBlock(), colsPerBlock());
	const target = getProductCoords(targetIndex, rowsPerBlock(), colsPerBlock());
	clearProductCardCells(activeSheet, targetIndex);

	for (let relativeRow = 0; relativeRow < rowsPerBlock() - 1; relativeRow++) {
		const sourceCell = activeSheet
			.getRange(source.blockStartRow + relativeRow, source.blockCol, 1, 1)
			.getCellData();
		if (!sourceCell) continue;
		activeSheet
			.getRange(target.blockStartRow + relativeRow, target.blockCol, 1, 1)
			.setValueForCell({ ...sourceCell });
	}

	activeSheet.getRange(target.blockStartRow, target.blockCol, 1, 1).setValueForCell(
		getProductHeaderCellData(targetIndex, currentTheme.value, canEditSubmission.value),
	);
};

const duplicateProductCard = (sourceIndex: number) => {
	if (!ensureEditableSubmission()) return;
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet || formCount.value < 1) throw new Error('规格表尚未初始化');
	if (!isProductCardPopulated(activeSheet, sourceIndex)) {
		warningMessage('空白商品提报不能复制');
		return;
	}

	const targetIndex = formCount.value;
	appendNewProductColumn(false);
	copyProductCardCells(activeSheet, sourceIndex, targetIndex);
	formCount.value = targetIndex + 1;
	giftStrategiesByCard.value = {
		...giftStrategiesByCard.value,
		[targetIndex]: cloneGiftStrategies(giftStrategiesByCard.value[sourceIndex] || []),
	};
	tierStrategiesByCard.value = {
		...tierStrategiesByCard.value,
		[targetIndex]: cloneTiers(tierStrategiesByCard.value[sourceIndex] || []),
	};
	efficacyItemsByCard.value = {
		...efficacyItemsByCard.value,
		[targetIndex]: cloneEfficacyItems(efficacyItemsByCard.value[sourceIndex] || []),
	};
	iconRefsByCard.value = {
		...iconRefsByCard.value,
		[targetIndex]: cloneIconRefs(iconRefsByCard.value[sourceIndex] || []),
	};
	// 复制后让目标列自动回显复制过来的主品简称，不沿用源列的自定义名。
	if (productColumnNames.value[targetIndex]) {
		const { [targetIndex]: _drop, ...rest } = productColumnNames.value;
		productColumnNames.value = rest;
	}
	currentColIndex.value = targetIndex;
	prevColIndex.value = targetIndex;
	recalculateSuffixesAndFootnotes(activeSheet);
	renderProductCopyIcons();
	try { activeSheet.autoResizeRows(getProductCoords(targetIndex, rowsPerBlock(), colsPerBlock()).blockStartRow, rowsPerBlock()); } catch { /* ignore */ }
	window.dispatchEvent(new Event('resize'));
	markDirty();
	successMessage(`已复制 ${getProductDisplayLabel(sourceIndex)}，生成 ${getProductDisplayLabel(targetIndex)}`);
};

// ========== 批量应用 ==========
const batchApplyDialogVisible = ref(false);
interface BatchApplyUndoState {
	cells: BatchApplyUndoEntry[];
	efficacyItemsByCard: Record<number, EfficacyItem[]>;
	iconRefsByCard: Record<number, IconRef[]>;
}
const lastBatchApplyUndo = ref<BatchApplyUndoState | null>(null);

const batchApplyDeps: BatchApplyDeps = {
	fields: () => getFields(currentTemplateType.value),
	rowsPerBlock,
	colsPerBlock,
	theme: () => currentTheme.value,
	canEditField: (field) => hasFormattingFieldPermission(field.row),
	readCellData: (row, col) => {
		const activeSheet = workbook?.getActiveSheet();
		const data = activeSheet?.getRange(row, col, 1, 1).getCellData();
		// 结构化克隆，避免 Univer 后续写入改动我们持有的撤销快照。
		return data ? JSON.parse(JSON.stringify(data)) : null;
	},
	restoreCellData: (row, col, data) => {
		const activeSheet = workbook?.getActiveSheet();
		if (!activeSheet) return;
		const range = activeSheet.getRange(row, col, 1, 1);
		if (data) range.setValueForCell(data);
		else range.clear();
	},
	writeText: (row, col, text, styleName) => {
		const activeSheet = workbook?.getActiveSheet();
		if (activeSheet) setCellTextPreservingRichText(activeSheet, row, col, text, styleName);
	},
	writeNumeric: (row, col, value, styleName) => {
		const activeSheet = workbook?.getActiveSheet();
		if (activeSheet) setNumericCellValue(activeSheet, row, col, value, styleName);
	},
};

// 快照在打开弹窗时一次性生成：workbook 是普通变量而非 ref，computed 无法跟踪它的赋值。
const batchApplyFields = ref<BatchApplyField[]>([]);
const batchApplyTargetIndexes = ref<number[]>([]);
const batchApplySourceLabel = ref('');
const batchApplyInitialValues = ref<Record<string, string>>({});

const collectBatchApplyInitialValues = (
	activeSheet: any,
	fields: readonly BatchApplyField[],
): Record<string, string> => {
	const { blockCol, blockStartRow } = getProductCoords(
		currentColIndex.value,
		rowsPerBlock(),
		colsPerBlock(),
	);
	return Object.fromEntries(
		fields.map((field) => [
			field.key,
			String(readSheetCellValue(activeSheet, blockStartRow + field.row, blockCol) ?? ''),
		]),
	);
};

const openBatchApplyDialog = () => {
	if (!ensureEditableSubmission()) return;
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet) {
		errorMessage('规格表尚未初始化');
		return;
	}
	if (formCount.value < 2) {
		warningMessage('至少需要两个商品提报才能批量应用');
		return;
	}

	const fields = listBatchApplyFields(batchApplyDeps);
	if (!fields.length) {
		warningMessage('当前模板没有可批量应用的字段');
		return;
	}
	batchApplyFields.value = fields;
	batchApplyTargetIndexes.value = Array.from({ length: formCount.value }, (_, index) => index);
	batchApplySourceLabel.value = getProductDisplayLabel(currentColIndex.value);
	batchApplyInitialValues.value = collectBatchApplyInitialValues(activeSheet, fields);
	batchApplyDialogVisible.value = true;
};

const undoLastBatchApply = () => {
	const undoState = lastBatchApplyUndo.value;
	if (!undoState?.cells.length) return;
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet) return;
	isHandlingEvent = true;
	try {
		revertBatchApply(batchApplyDeps, undoState.cells);
		efficacyItemsByCard.value = Object.fromEntries(
			Object.entries(undoState.efficacyItemsByCard).map(([index, items]) => [
				Number(index),
				cloneEfficacyItems(items),
			]),
		);
		iconRefsByCard.value = Object.fromEntries(
			Object.entries(undoState.iconRefsByCard || {}).map(([index, refs]) => [
				Number(index),
				cloneIconRefs(refs),
			]),
		);
		recalculateSuffixesAndFootnotes(activeSheet);
		renderProductCopyIcons();
	} finally {
		isHandlingEvent = false;
	}
	lastBatchApplyUndo.value = null;
	syncUniverToForm();
	markDirty();
	successMessage('已撤销上一次批量应用');
};

const refreshBatchDerivedContent = (
	activeSheet: any,
	previousEfficacyItemsByCard: Record<number, EfficacyItem[]> = {},
) => {
	recalculateSuffixesAndFootnotes(activeSheet, previousEfficacyItemsByCard);
	renderProductCopyIcons();
};

const rollbackBatchPostProcess = (
	activeSheet: any,
	entries: readonly BatchApplyUndoEntry[],
) => {
	revertBatchApply(batchApplyDeps, entries);
	refreshBatchDerivedContent(activeSheet);
};

const resizeBatchTargetRows = (activeSheet: any, targetIndexes: readonly number[]) => {
	for (const targetIndex of targetIndexes) {
		const { blockStartRow } = getProductCoords(targetIndex, rowsPerBlock(), colsPerBlock());
		try {
			activeSheet.autoResizeRows(blockStartRow, rowsPerBlock());
		} catch (error) {
			console.error(`批量应用后自动调整商品提报 ${targetIndex + 1} 行高失败`, error);
		}
	}
};

const snapshotEfficacyItemsByCard = (): Record<number, EfficacyItem[]> => Object.fromEntries(
	Object.entries(efficacyItemsByCard.value).map(([index, items]) => [
		Number(index),
		cloneEfficacyItems(items),
	]),
);

const snapshotIconRefsByCard = (): Record<number, IconRef[]> => Object.fromEntries(
	Object.entries(iconRefsByCard.value).map(([index, refs]) => [
		Number(index),
		cloneIconRefs(refs),
	]),
);

const syncBatchEfficacyItems = (
	payload: { fieldKeys: string[]; values: Record<string, string>; targetIndexes: number[] },
	beforeApply: Record<number, EfficacyItem[]>,
) => {
	if (!payload.fieldKeys.includes('efficacy')) return;
	const sourceItems = parseEfficacyText(
		payload.values.efficacy || '',
		efficacyItemsByCard.value[currentColIndex.value] || [],
	);
	for (const targetIndex of payload.targetIndexes) {
		const previousItems = beforeApply[targetIndex] || [];
		efficacyItemsByCard.value[targetIndex] = parseEfficacyText(
			payload.values.efficacy || '',
			sourceItems.length ? sourceItems : previousItems,
		);
	}
};

const handleBatchApply = (payload: {
	fieldKeys: string[];
	values: Record<string, string>;
	targetIndexes: number[];
}) => {
	if (!ensureEditableSubmission()) return;
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet) {
		errorMessage('规格表尚未初始化');
		return;
	}

	let result: BatchApplyResult;
	const efficacyItemsBeforeApply = snapshotEfficacyItemsByCard();
	const iconRefsBeforeApply = snapshotIconRefsByCard();
	isHandlingEvent = true;
	try {
		result = runBatchApplyTransaction({
			apply: () => applyBatchFields(batchApplyDeps, payload),
			postProcess: () => {
				syncBatchEfficacyItems(payload, efficacyItemsBeforeApply);
				refreshBatchDerivedContent(activeSheet, efficacyItemsBeforeApply);
			},
			rollback: (entries) => {
				efficacyItemsByCard.value = efficacyItemsBeforeApply;
				iconRefsByCard.value = iconRefsBeforeApply;
				rollbackBatchPostProcess(activeSheet, entries);
			},
		});
		resizeBatchTargetRows(activeSheet, payload.targetIndexes);
	} catch (error) {
		console.error('批量应用失败', error);
		errorMessage(error instanceof Error ? error.message : '批量应用失败');
		return;
	} finally {
		isHandlingEvent = false;
	}

	batchApplyDialogVisible.value = false;
	syncUniverToForm();
	markDirty();
	lastBatchApplyUndo.value = {
		cells: result.undoEntries,
		efficacyItemsByCard: efficacyItemsBeforeApply,
		iconRefsByCard: iconRefsBeforeApply,
	};
	// 批量应用的提示要读得完，给足 6s，并允许提前关掉
	successMessage(
		`已将 ${result.fieldCount} 个字段应用到${result.targetCount === formCount.value ? '全部 ' : '所选 '}${result.targetCount} 个商品（共 ${result.cellCount} 个单元格）`,
		undefined,
		{ duration: 6000, showClose: true },
	);
};

const clearProductCardCells = (activeSheet: any, productIndex: number) => {
	const coordinates = getProductCoords(productIndex, rowsPerBlock(), colsPerBlock());
	activeSheet
		.getRange(coordinates.blockStartRow, coordinates.blockCol, rowsPerBlock(), 1)
		.clear();
};

const clearUnusedLabelBlock = (activeSheet: any, removedIndex: number, remainingCount: number) => {
	const removed = getProductCoords(removedIndex, rowsPerBlock(), colsPerBlock());
	const remainingBlocks = Math.ceil(remainingCount / colsPerBlock());
	if (removed.blockIndex < remainingBlocks) return;
	activeSheet.getRange(removed.blockStartRow, 0, rowsPerBlock(), 1).clear();
};

const reindexCardRecord = <T,>(
	source: Readonly<Record<number, T>>,
	deletedIndex: number,
	productCount: number,
	clone: (value: T) => T,
) => {
	const result: Record<number, T> = {};
	for (let targetIndex = 0; targetIndex < productCount - 1; targetIndex++) {
		const sourceIndex = targetIndex < deletedIndex ? targetIndex : targetIndex + 1;
		const value = source[sourceIndex];
		if (value !== undefined) result[targetIndex] = clone(value);
	}
	return result;
};

const deleteProductCardAtIndex = (deletedIndex: number) => {
	const activeSheet = workbook?.getActiveSheet();
	if (!activeSheet) throw new Error('规格表尚未初始化');
	const productCount = formCount.value;
	for (let sourceIndex = deletedIndex + 1; sourceIndex < productCount; sourceIndex++) {
		moveProductCardCells(activeSheet, sourceIndex, sourceIndex - 1);
	}
	clearProductCardCells(activeSheet, productCount - 1);
	formCount.value = productCount - 1;
	giftStrategiesByCard.value = reindexCardRecord(
		giftStrategiesByCard.value,
		deletedIndex,
		productCount,
		cloneGiftStrategies,
	);
	tierStrategiesByCard.value = reindexCardRecord(
		tierStrategiesByCard.value,
		deletedIndex,
		productCount,
		cloneTiers,
	);
	efficacyItemsByCard.value = reindexCardRecord(
		efficacyItemsByCard.value,
		deletedIndex,
		productCount,
		cloneEfficacyItems,
	);
	iconRefsByCard.value = reindexCardRecord(
		iconRefsByCard.value,
		deletedIndex,
		productCount,
		cloneIconRefs,
	);
	productColumnNames.value = reindexCardRecord(
		productColumnNames.value,
		deletedIndex,
		productCount,
		(value) => value,
	);
	clearUnusedLabelBlock(activeSheet, productCount - 1, formCount.value);
	renderProductCopyIcons();
	recalculateSuffixesAndFootnotes(activeSheet);
	currentColIndex.value = Math.min(deletedIndex, formCount.value - 1);
	prevColIndex.value = currentColIndex.value;
	markDirty();
	window.dispatchEvent(new Event('resize'));
};

const handleDeleteCurrentProduct = async () => {
	if (!ensureEditableSubmission() || formCount.value <= 1 || isDeletingProduct.value) return;
	const deletedIndex = currentColIndex.value;
	try {
		await ElMessageBox.confirm(
			`确定删除"${getProductDisplayLabel(deletedIndex)}"吗？删除后，后续商品提报会自动前移并重新编号。`,
			'删除商品提报',
			{
				confirmButtonText: '删除并保存',
				cancelButtonText: '取消',
				type: 'warning',
			},
		);
		isDeletingProduct.value = true;
		deleteProductCardAtIndex(deletedIndex);
		formDialogVisible.value = false;
		await saveWorkbookData('draft');
	} catch (error) {
		if (error === 'cancel' || error === 'close') return;
		console.error('删除商品提报失败:', error);
		errorMessage(error instanceof Error ? error.message : '删除商品提报失败');
	} finally {
		isDeletingProduct.value = false;
	}
};

const findFirstBlankColumnIndex = (): number => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return -1;

	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	for (let i = 0; i < formCount.value; i++) {
		const { blockCol, blockStartRow } = getProductCoords(i, rowsPerBlock(), colsPerBlock());
		const nicknameRaw = getValue(blockStartRow + rowOf('nickname'), blockCol);
		const fullNameRaw = getValue(blockStartRow + rowOf('fullName'), blockCol);
		if (!parseMainProductRefs(nicknameRaw, '', fullNameRaw).length) return i;
	}
	return formCount.value;
};

const syncUniverToForm = () => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return;

	const idx = currentColIndex.value;
	const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
	const coordinates = { blockCol, blockStartRow };

	// 同步列名草稿：自定义名优先；否则按当前主品简称占位（不写入 productColumnNames）。
	const customName = productColumnNames.value[idx];
	columnNameDraft.value = (customName && customName.trim())
		? customName.trim()
		: getProductColumnName(idx);

	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	brandVal.value = readOptionalFieldValue(getValue, coordinates, 'brand') || '';

	const nicknameRaw = getValue(blockStartRow + rowOf('nickname'), blockCol);
	const fullNameRaw = getValue(blockStartRow + rowOf('fullName'), blockCol) || '';
	const mainRefs = parseMainProductRefs(nicknameRaw, '', fullNameRaw);
	formMainProducts.value = mainRefs.map((item) => ({
		key: `${item.cleanNick}__${item.fullName}__${item.spec}`,
		cleanNick: item.cleanNick,
		nickname: item.cleanNick,
		brand: brandVal.value,
		fullName: item.fullName,
		spec: item.spec,
		qty: item.qty,
		unit: item.unit,
	}));
	mainSearchQuery.value = formMainProducts.value.length ? '' : stripProductSuffixes(String(nicknameRaw || ''));

	const efficacyText = String(getValue(blockStartRow + rowOf('efficacy'), blockCol) || '');
	const storedEfficacyItems = efficacyItemsByCard.value[idx] || [];
	formEfficacyItems.value = sameEfficacyNames(storedEfficacyItems, efficacyText)
		? cloneEfficacyItems(storedEfficacyItems)
		: parseEfficacyText(efficacyText, storedEfficacyItems);

	const iconCellText = String(readOptionalFieldValue(getValue, coordinates, 'icon') || '');
	const storedIconRefs = iconRefsByCard.value[idx] || [];
	if (iconCellText === '***') {
		formIconRefs.value = cloneIconRefs(storedIconRefs);
	} else if (storedIconRefs.length) {
		// 已选列表以 iconRefsByCard 为准；候选未解析时按单元格文本对齐顺序。
		const namesInCell = parseIconNames(iconCellText);
		const byName = new Map(storedIconRefs.map((ref) => [ref.shortName, ref]));
		const ordered = namesInCell
			.map((name) => byName.get(name))
			.filter((ref): ref is IconRef => Boolean(ref));
		formIconRefs.value = ordered.length === storedIconRefs.length
			? cloneIconRefs(ordered)
			: cloneIconRefs(storedIconRefs);
	} else {
		// 线上旧代码丢过 spec_data.iconRefs 时，用候选集从单元格文本兜底重建。
		const codes = formMainProducts.value
			.map((item) => findProductByMainRef(item.nickname, item.spec, item.fullName)?.productCode || '')
			.filter(Boolean);
		formIconRefs.value = resolveIconRefsFromText(iconCellText, iconResolver.optionsFor(codes));
	}

	const giftsRaw = getValue(blockStartRow + rowOf('gifts'), blockCol);
	const structuredGifts = giftStrategiesByCard.value[idx];
	formGiftStrategies.value = enrichGiftStrategies(
		structuredGifts ? cloneGiftStrategies(structuredGifts) : parseGiftStrategies(giftsRaw),
		rawProductList.value,
	);

	const tiersRaw = readOptionalFieldValue(getValue, coordinates, 'thresholdA');
	const structuredTiers = tierStrategiesByCard.value[idx];
	formTiers.value = structuredTiers ? cloneTiers(structuredTiers) : parseTiersFromText(tiersRaw);

	sellingPointVal.value = getValue(blockStartRow + rowOf('sellingPoint'), blockCol) || '';
	priceVal.value = readOptionalFieldValue(getValue, coordinates, 'price') || '';

	const dateRangeStr = readOptionalFieldValue(getValue, coordinates, 'dateRange') || '';
	if (dateRangeStr.includes('~')) {
		const parts = dateRangeStr.split('~');
		startDateVal.value = parts[0].trim();
		endDateVal.value = parts[1].trim();
	} else {
		startDateVal.value = dateRangeStr.trim();
		endDateVal.value = dateRangeStr.trim();
	}

	remarksVal.value = cleanIconFootnotes(
		cleanEfficacyFootnotes(
			cleanFootnotesAndDetails(getValue(blockStartRow + rowOf('remarks'), blockCol) || ''),
			formEfficacyItems.value,
			storedEfficacyItems,
		),
		formIconRefs.value,
		iconRefsByCard.value[idx] || [],
	);
	dynamicFieldValues.value = Object.fromEntries(
		dynamicTextFields.value.map((field) => [
			field.key,
			String(getValue(blockStartRow + field.row, blockCol) || ''),
		])
	);
};

const syncFormToUniver = () => {
	const activeSheet = workbook?.getActiveSheet() || sheet;
	if (!activeSheet) return;
	if (!canEditSubmission.value) return; // Read-only locked

	const idx = currentColIndex.value;
	const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
	const coordinates = { blockCol, blockStartRow };
	const theme = currentTheme.value;

	const setValue = (r: number, c: number, val: any, styleType: string) => {
		setCellTextPreservingRichText(activeSheet, r, c, String(val || ''), `${styleType}_${theme}`);
	};

	isHandlingEvent = true;
	try {
		activeSheet.getRange(blockStartRow, blockCol, 1, 1).setValueForCell(
			getProductHeaderCellData(idx, theme, canEditSubmission.value),
		);
		writeOptionalFieldValue(setValue, coordinates, {
			key: 'brand',
			value: brandVal.value,
			styleName: 'contentCenterStyle',
		});

			// 昵称写入纯文本（不含编号），由 recalculateSuffixesAndFootnotes 统一添加编号
			const mainRefs = formMainProducts.value.map((item) => ({
				...item,
				cleanNick: item.nickname,
				qty: normalizeQty(item.qty),
				unit: item.unit || extractUnitFromSpec(item.spec),
			}));
			const nicknameText = mainRefs.map(formatMainProductRefText).join(MAIN_PRODUCT_SEPARATOR);
			setValue(blockStartRow + rowOf('nickname'), blockCol, nicknameText, 'editableCenterStyle');

			const fullName = mainRefs.map((item) => item.fullName).filter(Boolean).join(MAIN_PRODUCT_SEPARATOR);
			setValue(blockStartRow + rowOf('fullName'), blockCol, fullName, 'contentLeftStyle');

			efficacyItemsByCard.value[idx] = cloneEfficacyItems(formEfficacyItems.value);
			setValue(
				blockStartRow + rowOf('efficacy'),
				blockCol,
				formEfficacyItems.value.map((item) => item.name).filter(Boolean).join('\n'),
				'contentLeftStyle',
			);

			// icon 交由 IconSelector 维护：写简称文本，编号由 recalculate 统一补齐。
			iconRefsByCard.value[idx] = cloneIconRefs(formIconRefs.value);
			if (!formIconMasked.value) {
				writeOptionalFieldValue(setValue, coordinates, {
					key: 'icon',
					value: formIconRefs.value.map((ref) => ref.shortName).filter(Boolean).join('\n'),
					styleName: 'editableCenterStyle',
				});
			}

			// 赠品策略写入可读文本，由 recalculateSuffixesAndFootnotes 统一添加昵称编号。
			const giftsText = formatGiftStrategies(formGiftStrategies.value);
			setValue(blockStartRow + rowOf('gifts'), blockCol, giftsText, 'editableCenterStyle');
			giftStrategiesByCard.value[idx] = cloneGiftStrategies(formGiftStrategies.value);

		const tiersText = formatTiersToText(formTiers.value);
		writeOptionalFieldValue(setValue, coordinates, {
			key: 'thresholdA',
			value: tiersText,
			styleName: 'editableCenterStyle',
		});
		tierStrategiesByCard.value[idx] = cloneTiers(formTiers.value);

		setValue(blockStartRow + rowOf('sellingPoint'), blockCol, sellingPointVal.value, 'contentLeftStyle_shaded');
		writeOptionalFieldValue((row, col, value, styleName) => {
			setNumericCellValue(
				activeSheet,
				row,
				col,
				value,
				`${styleName}_${theme}`,
			);
		}, coordinates, {
			key: 'price',
			value: priceVal.value,
			styleName: 'editableCenterStyle',
		});

		const dateRangeText = (startDateVal.value && endDateVal.value) ? `${startDateVal.value} ~ ${endDateVal.value}` : '';
		writeOptionalFieldValue(setValue, coordinates, {
			key: 'dateRange',
			value: dateRangeText,
			styleName: 'editableCenterStyle',
		});

			setValue(blockStartRow + rowOf('remarks'), blockCol, remarksVal.value, 'editableCenterStyle');
			for (const field of dynamicTextFields.value) {
				setCellTextPreservingRichText(
					activeSheet,
					blockStartRow + field.row,
					blockCol,
					String(dynamicFieldValues.value[field.key] || ''),
					styleToUniverStyleName(field.style, theme),
				);
			}

			recalculateSuffixesAndFootnotes(activeSheet);


		try { activeSheet.autoResizeRows(blockStartRow, rowsPerBlock()); } catch { /* ignore */ }
	} finally {
		isHandlingEvent = false;
	}
};

// Legacy switchTab and handlers removed

const getLabelData = (rowNum: number) => {
	return getLabelByRow(currentTemplateType.value, rowNum);
};

const updateSheetLabels = () => {
	if (!sheet) return;
	const theme = currentTheme.value;
	const rpb = rowsPerBlock();
	const fieldRows = getFields(currentTemplateType.value).map((f) => f.row);
	isHandlingEvent = true;
	try {
		const totalBlocks = Math.ceil(formCount.value / colsPerBlock());
		for (let blockIdx = 0; blockIdx < totalBlocks; blockIdx++) {
			const blockStartRow = blockIdx * rpb;
			sheet.getRange(blockStartRow, 0, 1, 1).setValue({ v: '配置字段', s: `headerStyle_${theme}` });
			for (const r of fieldRows) {
				sheet.getRange(blockStartRow + r, 0, 1, 1).setValue({ v: getLabelData(r), s: `labelStyle_${theme}` });
			}
		}
	} finally {
		isHandlingEvent = false;
	}
};

watch(currentTemplateType, () => {
	updateSheetLabels();
});

	watch(submissionName, () => {
		markDirty();
	});

// ========== 初始化 Univer ==========
const FROZEN_FIELD_COLUMN_COUNT = 1;

const freezeFieldColumn = (activeSheet: any) => {
	const currentFreeze = activeSheet.getFreeze();
	activeSheet.setFreeze({
		...currentFreeze,
		startColumn: FROZEN_FIELD_COLUMN_COUNT,
		xSplit: FROZEN_FIELD_COLUMN_COUNT,
	});
};

/** sheet 初始行数。覆盖新建提报早期的商品增长，之后由容量修正按需抬高。 */
const SHEET_ROW_COUNT = 500;
/** 抬高 rowCount 时额外预留的商品数，避免刚加载就立刻触发扩容。 */
const ROW_CAPACITY_HEADROOM_PRODUCTS = 8;

/**
 * 计算容纳 productCount 个商品所需的行数。
 * 每行商品数 colsPerBlock 是按窗口宽度响应式算的（见 getResponsiveProductColumnCount），
 * 最窄时会降到 1，此时每个商品独占一个 block、占 rowsPerBlock 行——这是最坏情况。
 * 按 cpb=1 定容，窗口怎么缩放（reflow 重排）都不会越界。
 */
const requiredRowCount = (productCount: number) => {
	const rpb = Math.max(1, rowsPerBlock());
	const worstCaseBlocks = Math.max(productCount, 1) + ROW_CAPACITY_HEADROOM_PRODUCTS;
	return Math.max(SHEET_ROW_COUNT, worstCaseBlocks * rpb);
};

/**
 * 已存快照的 rowCount 是落库时写死的（历史快照为 100）。商品数增长后新 block
 * 会落到 rowCount 之外，getRange 静默失败，表现为“加到 45 个就加不上商品”。
 * 加载前按当前商品数把 rowCount 抬到足够高度。
 */
const ensureSnapshotRowCapacity = (snapshot: any, productCount: number) => {
	if (!snapshot?.sheets) return snapshot;
	const neededRowCount = requiredRowCount(productCount);
	for (const sheet of Object.values(snapshot.sheets) as any[]) {
		if (!sheet) continue;
		if (!(Number(sheet.rowCount) >= neededRowCount)) sheet.rowCount = neededRowCount;
	}
	return snapshot;
};

const initUniver = (savedSnapshot?: any) => {
	if (!univerContainerRef.value) return;
	appliedProductColumnWidth = null;
	appliedProductColumnCount = null;

	const stylesDict = buildProductSpecStylesDict();

	const initialCellData: Record<number, Record<number, any>> = {};
	initialCellData[0] = {
		0: { v: '配置字段', s: 'headerStyle_proya' },
		1: { v: '', s: 'productHeaderStyle_proya' },
	};
	const rowStyleMap: Record<number, { v: string; s: string }> = {};
	for (const f of getFields(currentTemplateType.value)) {
		rowStyleMap[f.row] = {
			v: getPermittedVal(f.row, ''),
			s: styleToUniverStyleName(f.style, 'proya'),
		};
	}
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
				contextMenu: false,
				sheets: {
					// 本规格表允许文本字段填写纯数字，关闭 Univer 的强制字符串提示，避免误报。
					disableForceStringAlert: true,
					disableForceStringMark: true,
				},
			}),
			UniverSheetsDataValidationPreset({
				showEditOnDropdown: false,
				showSearchOnDropdown: true,
			}),
			UniverSheetsDrawingPreset(),
		],
	});

	result.univer.registerPlugin(UniverVue3AdapterPlugin);
	univerAPI = result.univerAPI;
	univerAPI.addEvent(univerAPI.Event.BeforeCommandExecute, (event: any) => {
		if (BLOCKED_UNIVER_COMMAND_IDS.has(event.id)) {
			event.cancel = true;
		}
	});
	const updateFormattingPointerCell = (params: any) => {
		formattingPointerCell.value = { row: params.row, col: params.column };
	};
	const handleCellPointerDown = (params: any) => {
		updateFormattingPointerCell(params);
	};
	univerAPI.addEvent(univerAPI.Event.CellPointerDown, handleCellPointerDown);
	univerAPI.addEvent(univerAPI.Event.CellPointerMove, updateFormattingPointerCell);
	univerAPI.addEvent(univerAPI.Event.SheetSkeletonChanged, scheduleProductCopyButtonPositionUpdate);
	univerAPI.addEvent(univerAPI.Event.SheetZoomChanged, () => {
		scheduleProductCopyButtonPositionUpdate();
		scheduleIconDrawingLayoutRefresh();
	});

	if (savedSnapshot) {
		workbook = univerAPI.createWorkbook(
			ensureSnapshotRowCapacity(savedSnapshot, formCount.value),
		);
	} else {
		workbook = univerAPI.createWorkbook({
			id: 'workbook-product-spec',
			name: '可丽金产品规格书',
			styles: stylesDict,
			sheets: {
				'sheet-product-spec': {
					id: 'sheet-product-spec',
					name: '规格书模版',
					rowCount: SHEET_ROW_COUNT,
					columnCount: 50,
					showGridlines: 0 as any,
					rowHeader: { width: 46, hidden: 1 },
					columnHeader: { height: 20, hidden: 1 },
					columnData: {
						0: { w: PRODUCT_FIELD_COLUMN_WIDTH },
						1: { w: PRODUCT_COLUMN_SNAPSHOT_WIDTH },
						2: { w: PRODUCT_COLUMN_SNAPSHOT_WIDTH },
						3: { w: PRODUCT_COLUMN_SNAPSHOT_WIDTH },
						4: { w: PRODUCT_COLUMN_SNAPSHOT_WIDTH },
						5: { w: PRODUCT_COLUMN_SNAPSHOT_WIDTH },
						6: { w: PRODUCT_COLUMN_SNAPSHOT_WIDTH },
						7: { w: PRODUCT_COLUMN_SNAPSHOT_WIDTH },
					},
					rowData: Object.fromEntries(Array.from({ length: SHEET_ROW_COUNT }, (_, i) => {
						const rpb = rowsPerBlock();
						const relRow = i % rpb;
						if (relRow === rpb - 1) {
							return [i, { h: 16 }];
						}
						return [i, { h: relRow === 0 ? 42 : 36, ia: 1, ah: relRow === 0 ? 42 : 36 }];
					})),
					cellData: initialCellData,
				},
			},
		});
	}
	bindProductCopyViewportScroll(result.univer, workbook);

	disposeSelectionInteractionGuard = bindSelectionInteractionGuard(result.univer, workbook);
	sheet = workbook.getActiveSheet();
	freezeFieldColumn(sheet);

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
	void renderIconDrawings();
	renderProductCopyIcons();

	const runAutoResize = () => {
		try {
			const totalBlocks = Math.ceil(formCount.value / colsPerBlock());
			sheet.autoResizeRows(0, totalBlocks * rowsPerBlock());
			window.dispatchEvent(new Event('resize'));
			void renderIconDrawings();
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

		if (!ensureEditableSubmission()) return;

		const row = params.row;
		const col = params.column;
		const rpb = rowsPerBlock();
		const cpb = colsPerBlock();
		const blockIndex = Math.floor(row / rpb);
		const relativeRow = row % rpb;
		const productIndex = blockIndex * cpb + (col - 1);
		if (col >= 1 && col <= cpb && relativeRow !== rpb - 1 && productIndex >= 0 && productIndex < formCount.value) {
			pendingDialogFieldKey.value = getFieldByRow(currentTemplateType.value, relativeRow)?.key || null;
			currentEditingCell.value = { row, col };
			currentColIndex.value = productIndex;
			prevColIndex.value = productIndex;
			isAddingNewProduct.value = false;

			syncUniverToForm();
			formDialogVisible.value = true;
		}
	});

	univerAPI.addEvent(univerAPI.Event.CommandExecuted, (params: any) => {
		if (!canEditSubmission.value) return;
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

const applyRichTextFormatting = (change: RichTextFormatChange) => {
	const target = richTextTargetCell.value;
	const activeSheet = workbook?.getActiveSheet();
	if (!target || !activeSheet || !univerAPI) return;
	const range = activeSheet.getRange(target.row, target.col, 1, 1);
	const text = richTextEditorText.value;
	const builder = univerAPI.newRichText(createRichTextDocument(text));
	const applyStyle = (start: number, end: number, style: Record<string, unknown>) => {
		const safeStart = Math.min(Math.max(start, 0), text.length);
		const safeEnd = Math.min(Math.max(end, safeStart), text.length);
		if (safeStart < safeEnd) {
			builder.setStyle(safeStart, safeEnd, style);
		}
	};

	for (const run of richTextEditorRuns.value) {
		if (run.ts) {
			applyStyle(run.st, run.ed, run.ts);
		}
	}
	applyStyle(change.start, change.end, change.style);

	const cellData = range.getCellData() || {};
	const rowHeight = activeSheet.getRowHeight(target.row);
	range.setValueForCell({
		...cellData,
		v: text,
		t: 1,
		f: null,
		p: builder.getData(),
	});
	activeSheet.setRowHeight(target.row, rowHeight);
	richTextEditorRuns.value = extractRichTextRuns(builder);
	markDirty();
};



// ========== 追加商品列 ==========
const appendNewProductColumn = (announce = true) => {
	if (!canEditSubmission.value) return;
	const activeSheet = workbook.getActiveSheet();
	const idx = formCount.value;
	const rpb = rowsPerBlock();
	const cpb = colsPerBlock();
	const { blockCol, blockStartRow } = getProductCoords(idx, rpb, cpb);
	const theme = currentTheme.value;

	// 兜底：新 block 末行若超出 sheet 当前 rowCount，getRange 会静默失败。
	// 加载路径已由 ensureSnapshotRowCapacity 定容，这里覆盖新建提报（无快照）的增长。
	// facade 的行数 API 在不同版本命名不一致，逐个尝试，全部失败也不阻断追加。
	const neededRowCount = blockStartRow + rpb;
	try {
		const currentRowCount = Number(
			activeSheet.getRowCount?.() ?? activeSheet.getMaxRows?.() ?? NaN,
		);
		if (Number.isFinite(currentRowCount) && neededRowCount > currentRowCount) {
			const target = requiredRowCount(idx + 1);
			if (typeof activeSheet.setRowCount === 'function') {
				activeSheet.setRowCount(target);
			} else if (typeof activeSheet.insertRows === 'function') {
				activeSheet.insertRows(currentRowCount, Math.max(target, neededRowCount) - currentRowCount);
			}
		}
	} catch { /* 扩容失败不阻断追加 */ }

	if (blockCol === 1) {
		activeSheet.getRange(blockStartRow, 0, 1, 1).setValue({ v: '配置字段', s: `headerStyle_${theme}` });
		for (const f of getFields(currentTemplateType.value)) {
			activeSheet.getRange(blockStartRow + f.row, 0, 1, 1).setValue({
				v: f.label,
				s: `labelStyle_${theme}`,
			});
		}
	}

	activeSheet.getRange(blockStartRow, blockCol, 1, 1).setValueForCell(
		getProductHeaderCellData(idx, theme, canEditSubmission.value),
	);
	for (const f of getFields(currentTemplateType.value)) {
		activeSheet.getRange(blockStartRow + f.row, blockCol, 1, 1).setValue({
			v: '',
			s: styleToUniverStyleName(f.style, theme),
		});
	}

	formCount.value++;
	activeSheet.showColumns(blockCol, 1);
	scheduleProductColumnWidthUpdate();
	try { activeSheet.autoResizeRows(blockStartRow, rpb); } catch { /* ignore */ }
	window.dispatchEvent(new Event('resize'));
	if (announce) successMessage(`已追加第 ${formCount.value} 列商品配置项`);
	renderProductCopyIcons();
	markDirty();
};

// ========== 保存入库 ==========
// ========== 保存入库 ==========
const saveWorkbookData = async (statusVal: string = 'draft', options: { silent?: boolean } = {}) => {
	if (!ensureEditableSubmission()) return;
	if (isSaving.value) return;
	isSaving.value = true;
	const savingRevision = editRevision;
	const activeSheet = workbook.getActiveSheet();
	const productsList: any[] = [];

	const getValue = (r: number, c: number) => {
		const cell = activeSheet.getRange(r, c, 1, 1).getValue() as any;
		return cell && typeof cell === 'object' ? cell.v : cell || '';
	};

	for (let idx = 0; idx < formCount.value; idx++) {
		const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
		const nickname = getValue(blockStartRow + rowOf('nickname'), blockCol);
		if (!nickname) continue;
		const cleanNickname = getCleanNickname(nickname, uniqueNicknames.value);

		// 按当前模板 Schema 收集所有字段值到 specData
		const specData: Record<string, any> = {};
		for (const f of getFields(currentTemplateType.value)) {
			const raw = getValue(blockStartRow + f.row, blockCol);
			if (f.kind === 'gifts') {
				const cachedStrategies = giftStrategiesByCard.value[idx];
				specData[f.key] = cachedStrategies
					? cloneGiftStrategies(cachedStrategies)
					: enrichGiftStrategies(parseGiftStrategies(raw || ''), rawProductList.value);
			} else if (f.kind === 'dateRange') {
				const dateRangeStr = String(raw || '');
				let startDate = '';
				let endDate = '';
				if (dateRangeStr === '***') {
					startDate = '***'; endDate = '***';
				} else if (dateRangeStr.includes('~')) {
					const dates = dateRangeStr.split('~');
					startDate = dates[0].trim();
					endDate = dates[1].trim();
				} else {
					startDate = dateRangeStr.trim();
					endDate = dateRangeStr.trim();
				}
				specData[f.key] = { startDate, endDate };
			} else {
				specData[f.key] = raw;
			}
		}
		const savedEfficacyItems = efficacyItemsByCard.value[idx] || [];
		const efficacyText = String(specData['efficacy'] || '');
		specData['efficacyItems'] = efficacyText === '***'
			? []
			: (
				sameEfficacyNames(savedEfficacyItems, efficacyText)
					? cloneEfficacyItems(savedEfficacyItems)
					: parseEfficacyText(efficacyText, savedEfficacyItems)
			);

		// icon 不再走通用文本：以 iconRefsByCard 的结构化选择为准，*** 时交给后端沿用旧值。
		// 单元格里的编号由 recalculate 维护，保存时只保留简称，避免把过期角标写进数据库。
		const savedIconRefs = iconRefsByCard.value[idx] || [];
		const iconText = String(specData['icon'] ?? '');
		if (iconText === '***') {
			specData['iconRefs'] = cloneIconRefs(savedIconRefs);
		} else {
			specData['icon'] = savedIconRefs.map((ref) => ref.shortName).filter(Boolean).join('\n');
			specData['iconRefs'] = savedIconRefs.length
				? cloneIconRefs(savedIconRefs)
				: resolveIconRefsFromText(iconText, []);
		}

		const mainProductRefs = parseMainProductRefs(nickname, '', specData['fullName']);
		specData['mainProducts'] = mainProductRefs.map((item) => ({
			nickname: item.cleanNick,
			fullName: item.fullName,
			spec: item.spec,
			qty: item.qty,
			unit: item.unit,
		}));
		// 兼容旧提交结构：main_image 标准键平铺到顶层（后端 _do_save 仍读这些键）
		// 模板字段统一存入 specData；主图标准字段同时保留顶层值以兼容既有接口。
		const dateRangeObj = specData['dateRange'] as { startDate: string; endDate: string } | undefined;
		productsList.push({
			cardIndex: idx,
			nickname: mainProductRefs[0]?.cleanNick || cleanNickname,
			brand: specData['brand'] ?? '',
			fullName: specData['fullName'] ?? '',
			efficacy: specData['efficacy'] ?? '',
			gifts: flattenGiftStrategies(specData['gifts'] ?? []),
			thresholdA: specData['thresholdA'] ?? '',
			valueA: '',
			thresholdB: '',
			valueB: '',
			sellingPoint: specData['sellingPoint'] ?? '',
			price: specData['price'] ?? '',
			startDate: dateRangeObj?.startDate ?? '',
			endDate: dateRangeObj?.endDate ?? '',
			remarks: specData['remarks'] ?? '',
			columnName: getProductColumnName(idx),
			specData,
		});
	}

	if (productsList.length === 0 && statusVal === 'submitted') {
		warningMessage('当前没有已填写的有效产品卡片数据！');
		isSaving.value = false;
		return;
	}

	let snapshot = null;
	iconDrawingRenderer.clear(workbook);
	try {
		const runtimeSnapshot = workbook.save();
		snapshot = remapSnapshotProductColumns(runtimeSnapshot, {
			productCount: formCount.value,
			rowsPerBlock: rowsPerBlock(),
			fromColumns: colsPerBlock(),
			toColumns: storageColumnsPerBlock(),
			physicalProductColumns: storageColumnsPerBlock(),
			productColumnWidth: PRODUCT_COLUMN_SNAPSHOT_WIDTH,
		});
	} catch (err) {
		console.warn('保存工作簿快照失败:', err);
	} finally {
		void renderIconDrawings();
	}

	try {
		// 自动保存不喊：工具栏的「已保存 HH:mm」就是它的回声
		if (!options.silent) infoMessage('正在保存提报数据...');
		const result = await request({
			url: '/api/design_order/product_archives/save_spec/',
			method: 'post',
			data: {
				id: submissionId.value,
				name: submissionName.value,
				shop: submissionShop.value,
				platform: submissionPlatform.value,
				status: statusVal,
				products: productsList,
				snapshot,
				formCount: formCount.value,
				templateType: currentTemplateType.value
			},
		});
		if (result.code === 2000 && result.data) {
			const persistedStatus = result.data.status;
			if (!['draft', 'submitted'].includes(persistedStatus)) {
				throw new Error('保存接口未返回有效状态');
			}
			submissionId.value = result.data.id;
			submissionStatus.value = persistedStatus;
			canEditSubmission.value = Boolean(result.data.canEdit);
			canShareSubmission.value = Boolean(result.data.canShare);

			// 如果是新填报，保存成功后，追加ID到URL中防止重复创建
			if (!route.query.id && editRevision === savingRevision) {
				router.replace({
					path: route.path,
					query: { ...route.query, id: result.data.id }
				});
			}

			if (!options.silent) {
				successMessage(persistedStatus === 'submitted' ? '活动提报已正式提交归档并锁定编辑！' : '提报草稿已成功保存入库！');
			}
				if (editRevision === savingRevision) isDirty.value = false;
				else resetAutoSaveTimer();
				lastSavedAt.value = new Date();
		} else {
			throw new Error(result.msg || '保存失败');
		}
	} catch (err: any) {
		errorMessage(`保存失败: ${err.message || '网络连接错误'}`);
		console.log('本地结构化备份数据:', productsList);
	} finally {
		isSaving.value = false;
	}
};

const handleShareLink = async () => {
	if (!canShareSubmission.value) {
		warningMessage('当前用户没有该工单的分享权限');
		return;
	}
	if (isSharing.value) return;
	if (!submissionId.value) {
		await confirmSaveBeforeShare('当前提报还没有保存，是否先保存草稿再生成分享链接？');
		return;
	}
	if (isDirty.value && canEditSubmission.value) {
		await confirmSaveBeforeShare('当前有未保存修改，是否先保存草稿再生成分享链接？');
		return;
	}
	await createAndCopyShareLink();
};

const confirmSaveBeforeShare = async (message: string) => {
	try {
		await ElMessageBox.confirm(message, '生成分享链接', {
			confirmButtonText: '先保存并分享',
			cancelButtonText: '取消',
			type: 'warning',
		});
		await saveWorkbookData('draft');
		if (!submissionId.value || isDirty.value) return;
		await createAndCopyShareLink();
	} catch {
		/* 用户取消 */
	}
};

const createAndCopyShareLink = async () => {
	if (!submissionId.value) return;
	isSharing.value = true;
	try {
		const result: any = await CreateShareLink(submissionId.value);
		const shareCode = result.data?.shareCode;
		if (!shareCode) throw new Error('后端未返回分享码');
		const shareUrl = result.data?.shareUrl || BuildShareUrl(shareCode);
		if (await copyShareUrl(shareUrl)) {
			successMessage('分享链接已复制');
		}
	} catch (error: any) {
		ElMessageBox.alert(error?.message || error?.msg || '分享链接生成失败', '分享失败');
	} finally {
		isSharing.value = false;
	}
};

const copyShareUrl = async (shareUrl: string) => {
	try {
		await copyTextToClipboard(shareUrl);
		return true;
	} catch {
		await ElMessageBox.alert(shareUrl, '请手动复制分享链接', {
			confirmButtonText: '知道了',
			showClose: false,
			closeOnClickModal: false,
			closeOnPressEscape: false,
		});
		return false;
	}
};

// ========== 自动保存 ==========
	const _formatTime = (date: Date | null): string => {
		if (!date) return '';
		return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
	};

	// 工具栏常驻的保存回声，替代每次自动保存都弹一次 toast
	const savedAtText = computed(() => {
		if (!lastSavedAt.value) return '';
		return lastSavedAt.value.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
	});

	const markDirty = () => {
		if (!canEditSubmission.value) return;
		lastBatchApplyUndo.value = null;
		editRevision++;
		isDirty.value = true;
		resetAutoSaveTimer();
	};

	const resetAutoSaveTimer = () => {
		if (autoSaveTimer.value) clearTimeout(autoSaveTimer.value);
		autoSaveTimer.value = setTimeout(autoSave, AUTO_SAVE_INTERVAL);
	};

	const autoSave = async () => {
		if (!isDirty.value || isSaving.value || !canEditSubmission.value) return;
		await saveWorkbookData('draft', { silent: true });
	};

	const handleBeforeUnload = (event: BeforeUnloadEvent) => {
		if (isDirty.value && canEditSubmission.value) {
			event.preventDefault();
			event.returnValue = '';
		}
	};

// ========== 提交前校验 ==========
	const validationDialogVisible = ref(false);
	const validationErrors = ref<ValidationError[]>([]);
	const validationWarnings = ref<ValidationError[]>([]);

	const SHEET_NOT_LOADED_ERROR: ValidationError = {
		productIndex: -1,
		productLabel: '系统',
		field: 'sheet',
		fieldLabel: '工作表',
		rule: 'required',
		message: '工作表未加载',
	};

	/** 校验器按需读取工作表：每次调用都要拿到当前 activeSheet，不能在创建时固定。 */
	const submissionValidator = createSubmissionValidator({
		submissionName: () => submissionName.value,
		submissionShop: () => submissionShop.value,
		formCount: () => formCount.value,
		schema: () => getSchema(currentTemplateType.value),
		fields: () => getFields(currentTemplateType.value),
		rowsPerBlock,
		colsPerBlock,
		nicknameRow: () => rowOf('nickname'),
		readCellValue: (row, col) => readActiveSheetCellValue(row, col),
		cleanNickname: (raw) => getCleanNickname(raw, uniqueNicknames.value),
		productLabel: (index) => getProductDisplayLabel(index),
	});

	const validateBeforeSubmit = (): ValidationResult => {
		if (!workbook?.getActiveSheet()) {
			return { valid: false, errors: [SHEET_NOT_LOADED_ERROR], warnings: [] };
		}
		return submissionValidator.validateBeforeSubmit();
	};

	const confirmAndSubmit = () => {
		if (!ensureEditableSubmission()) return;
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
		if (!ensureEditableSubmission()) return;
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

// 有未保存改动时拦一道，返回 true 表示可以离开
const confirmLeave = async (): Promise<boolean> => {
	if (!needsLeaveConfirm({ isDirty: isDirty.value, canEdit: canEditSubmission.value, isSaving: isSaving.value })) return true;
	try {
		await ElMessageBox.confirm('当前有未保存的修改，离开后这些修改会丢失。', '离开此页', {
			confirmButtonText: '放弃修改并离开',
			cancelButtonText: '继续编辑',
			type: 'warning',
		});
		return true;
	} catch {
		return false;
	}
};

// 浏览器后退、菜单跳转都走这里，不只是点返回按钮
onBeforeRouteLeave(async () => await confirmLeave());

// 返回历史列表页
const goBackToList = async () => {
	if (!(await confirmLeave())) return;
	router.push('/product_spec_submission');
};

// ========== 导出数据 (CSV) ==========
const exportToCSV = () => {
	if (!workbook?.getActiveSheet()) {
		warningMessage('表格尚未加载，无法导出');
		return;
	}

	const csvContent = buildSpecCsvText({
		formCount: () => formCount.value,
		fields: () => getFields(currentTemplateType.value),
		rowsPerBlock,
		colsPerBlock,
		nicknameRow: () => rowOf('nickname'),
		readCellValue: readActiveSheetCellValue,
		productLabel: (index) => getProductDisplayLabel(index),
	});
	downloadCsvFile(`商品活动提报配置表_${new Date().toLocaleDateString()}.csv`, csvContent);
	successMessage('成功导出提报对比数据！');
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
		const { blockCol, blockStartRow } = getProductCoords(idx, rowsPerBlock(), colsPerBlock());
		const coordinates = { blockCol, blockStartRow };

		const nickname = String(getValue(blockStartRow + rowOf('nickname'), blockCol)).toLowerCase();
		const brand = String(readOptionalFieldValue(getValue, coordinates, 'brand')).toLowerCase();
		const fullName = String(getValue(blockStartRow + rowOf('fullName'), blockCol)).toLowerCase();
			const sellingPoint = String(getValue(blockStartRow + rowOf('sellingPoint'), blockCol)).toLowerCase();

			const isMatch = query !== '' && (
				nickname.includes(query) ||
				brand.includes(query) ||
				fullName.includes(query) ||
				sellingPoint.includes(query)
			);

			const headerRange = activeSheet.getRange(blockStartRow, blockCol, 1, 1);
			const styleName = isMatch ? `productHeaderStyle_highlight_${theme}` : `productHeaderStyle_${theme}`;
			headerRange.setValueForCell(
				getProductHeaderCellData(idx, theme, canEditSubmission.value, styleName),
			);

			if (isMatch && !firstMatchedRange) {
				firstMatchedRange = headerRange;
			}
		}

		if (firstMatchedRange) {
			try {
				activeSheet.setActiveRange(firstMatchedRange);
			} catch {
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
	window.addEventListener('resize', scheduleProductColumnWidthUpdate);

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
				const displayName = resolveProductDisplayName({
					nickname: item.nickname,
					shortName: item.short_name,
					fullName: item.product_name,
					productCode: item.product_code,
				});
				if (!displayName) return;

				list.push({
					nickname: displayName,
					shortName: normalizeProductName(item.short_name),
					brand: item.brand || '',
					fullName: item.product_name || '',
					spec: item.specification || '',
					unit: item.unit || '',
					productCode: item.product_code || '',
					retailPrice: item.retail_price == null ? '' : String(item.retail_price),
					efficacyScope: item.efficacy_scope || '',
					regulatoryCategory: item.regulatory_category || '',
				});

				if (item.keywords) {
					PRODUCT_KEYWORDS.value[displayName] = item.keywords.split(',');
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
			submissionPlatform.value = result.data.platform || '京东';
			submissionStatus.value = result.data.status || 'draft';
			canEditSubmission.value = Boolean(result.data.canEdit);
			canShareSubmission.value = Boolean(result.data.canShare);
			giftStrategiesByCard.value = Object.fromEntries(
				(result.data.productGiftStrategies || []).map((item: any) => [
					Number(item.cardIndex),
					enrichGiftStrategies(parseGiftStrategies(item.giftStrategies), rawProductList.value),
				])
			);
			efficacyItemsByCard.value = Object.fromEntries(
				(result.data.productEfficacyItems || []).map((item: any) => [
					Number(item.cardIndex),
					normalizeEfficacyItems(item.efficacyItems),
				])
			);
			iconRefsByCard.value = Object.fromEntries(
				(result.data.productIconRefs || []).map((item: any) => [
					Number(item.cardIndex),
					normalizeIconRefs(item.iconRefs),
				])
			);
			iconResolver.reset();
			tierStrategiesByCard.value = {};
			const templateCode = result.data.templateType || 'main_image';
			await loadTemplateSchema(templateCode, result.data.templateSchema);
			currentTemplateType.value = templateCode;
			layoutColumnsPerBlock.value = storageColumnsPerBlock();
			const loadedFormCount = Math.max(
				result.data.formCount || 1,
				inferFormCountFromSnapshot(result.data.snapshot)
			);
			formCount.value = loadedFormCount;
			productColumnNames.value = inferColumnNamesFromSnapshot(
				result.data.snapshot,
				loadedFormCount,
			);
			const filteredSnapshot = filterSnapshotData(
				result.data.snapshot,
				loadedFormCount,
				storageColumnsPerBlock(),
			);
			initUniver(filteredSnapshot);
			successMessage(`成功加载提报“${submissionName.value}”的数据！`);
		} else {
			submissionId.value = null;
			submissionName.value = '';
			submissionShop.value = '';
			submissionPlatform.value = '京东';
			submissionStatus.value = 'draft';
			canEditSubmission.value = canCreateSubmission;
			canShareSubmission.value = canCreateSubmission && auth('design_order:product_spec_submission:Share');
			formCount.value = 1;
			iconRefsByCard.value = {};
			iconResolver.reset();
			await loadTemplateSchema('main_image');
			currentTemplateType.value = 'main_image';
			layoutColumnsPerBlock.value = storageColumnsPerBlock();
			initUniver();
		}
	} catch (err) {
		console.error('加载规格提报或模板配置失败:', err);
		errorMessage(err instanceof Error ? err.message : '加载规格提报或模板配置失败');
	}
	observeProductColumnWidth();

	// Setup click listener to close dropdowns
	document.addEventListener('contextmenu', preventUniverContextMenu, true);
	document.addEventListener('pointerdown', updateUniverClipboardActive, true);
	document.addEventListener('focusin', updateUniverClipboardActive, true);
	document.addEventListener('paste', handleUniverPaste, true);
	document.addEventListener('beforeinput', handleUniverBeforeInput, true);
	document.addEventListener('keydown', handleUniverPasteShortcut, true);
	document.addEventListener('keydown', handleUniverDeleteShortcut, true);
	document.addEventListener('click', (e) => {
		const target = e.target as HTMLElement;
		if (!target.closest('.prod-search-wrap')) {
			showMainDropdown.value = false;
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
	window.removeEventListener('resize', scheduleProductColumnWidthUpdate);
	productColumnResizeObserver?.disconnect();
	productColumnResizeObserver = null;
	lastProductWrapperSize = '';
	 disposeProductCopyViewportScroll();
	if (productCopyPositionFrame !== null) {
		window.cancelAnimationFrame(productCopyPositionFrame);
		productCopyPositionFrame = null;
	}
	if (productColumnWidthFrame !== null) {
		window.cancelAnimationFrame(productColumnWidthFrame);
		productColumnWidthFrame = null;
	}
	if (productColumnResizeTimer !== null) {
		window.clearTimeout(productColumnResizeTimer);
		productColumnResizeTimer = null;
	}
	if (iconDrawingLayoutRefreshTimer !== null) {
		window.clearTimeout(iconDrawingLayoutRefreshTimer);
		iconDrawingLayoutRefreshTimer = null;
	}
	document.removeEventListener('input', handleEditorInput, true);
	document.removeEventListener('contextmenu', preventUniverContextMenu, true);
	document.removeEventListener('pointerdown', updateUniverClipboardActive, true);
	document.removeEventListener('focusin', updateUniverClipboardActive, true);
	document.removeEventListener('paste', handleUniverPaste, true);
	document.removeEventListener('beforeinput', handleUniverBeforeInput, true);
	document.removeEventListener('keydown', handleUniverPasteShortcut, true);
	document.removeEventListener('keydown', handleUniverDeleteShortcut, true);
		window.removeEventListener('beforeunload', handleBeforeUnload);
		if (autoSaveTimer.value) { clearTimeout(autoSaveTimer.value); autoSaveTimer.value = null; }

	disposeSelectionInteractionGuard?.();
	disposeSelectionInteractionGuard = null;
	if (univerAPI) {
		iconDrawingRenderer.dispose(workbook);
		try {
			univerAPI.dispose();
		} catch {
			/* ignore */
		}
	}
});
</script>

<style scoped src="./index.css"></style>
