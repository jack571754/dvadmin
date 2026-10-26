<template>
	<el-dialog
		v-model="visible"
		:title="form.id ? '编辑 Icon' : '新增 Icon'"
		width="760px"
		append-to-body
		destroy-on-close
		:close-on-click-modal="false"
	>
		<el-form ref="formRef" :model="form" :rules="rules" :validate-on-rule-change="false" label-width="110px">
			<div class="form-grid">
				<el-form-item label="简称" prop="short_name">
					<el-input v-model="form.short_name" maxlength="64" show-word-limit />
				</el-form-item>
				<el-form-item label="品牌" prop="brand">
					<el-select v-model="form.brand" filterable allow-create default-first-option>
						<el-option
							v-for="item in brandOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="系列" prop="icon_category">
					<el-select v-model="form.icon_category" clearable filterable placeholder="系列（可选）">
						<el-option
							v-for="item in seriesOptions"
							:key="item.value"
							:label="item.label"
							:value="item.value"
						/>
					</el-select>
				</el-form-item>
				<el-form-item label="商品范围" prop="scope_type">
					<el-radio-group v-model="form.scope_type">
						<el-radio value="selected">指定商品</el-radio>
						<el-radio value="all">品牌全部商品</el-radio>
					</el-radio-group>
				</el-form-item>
				<el-form-item label="状态" prop="status">
					<el-radio-group v-model="form.status">
						<el-radio value="enabled">启用</el-radio>
						<el-radio value="disabled">停用</el-radio>
					</el-radio-group>
				</el-form-item>
			</div>
			<el-form-item label="注释" prop="interpretation">
				<el-input
					v-model="form.interpretation"
					type="textarea"
					:rows="3"
					maxlength="1000"
					show-word-limit
				/>
			</el-form-item>
			<el-form-item label="图片" prop="images">
				<IconImageUploader
					v-model="form.images"
					@uploading-change="uploading = $event"
				/>
			</el-form-item>
			<el-form-item
				v-if="form.scope_type === 'selected'"
				label="适用商品"
				prop="product_codes"
			>
				<div class="product-input">
					<el-input
						v-model="productCodeText"
						type="textarea"
						:rows="5"
						placeholder="填写商品编码，支持换行、空格、中英文逗号或分号分隔；单次最多 500 条"
					/>
					<div class="product-actions">
						<el-button type="primary" plain @click="validateProductCodes">校验编码</el-button>
						<el-button @click="productDialogRef?.open(form.brand)">选择商品</el-button>
					</div>
				</div>
			</el-form-item>
		</el-form>
		<ProductSelectDialog ref="productDialogRef" @confirm="appendProducts" />
		<ProductCodeValidationDialog ref="validationDialogRef" @confirm="replaceProducts" />
		<template #footer>
			<el-button @click="visible = false">取消</el-button>
			<el-button type="primary" :loading="saving" :disabled="uploading" @click="submit">
				保存
			</el-button>
		</template>
	</el-dialog>
</template>

<script setup lang="ts">
import { nextTick, reactive, ref } from 'vue';
import { ElMessage } from 'element-plus';

import * as api from '/@/api/design_order/icon_library';
import { dictionary } from '/@/utils/dictionary';
import { MAX_BATCH_PRODUCTS, SERIES_OPTIONS } from '../constants';
import type { IconFormValue, IconItem } from '../types';
import IconImageUploader from './IconImageUploader.vue';
import ProductCodeValidationDialog from './ProductCodeValidationDialog.vue';
import ProductSelectDialog from './ProductSelectDialog.vue';

const emit = defineEmits<{ (event: 'saved', iconId?: number): void }>();
const visible = ref(false);
const saving = ref(false);
const uploading = ref(false);
const brandOptions = dictionary('design_order_store_brand');
const seriesOptions = SERIES_OPTIONS;
const formRef = ref();
const productDialogRef = ref();
const validationDialogRef = ref();
const productCodeText = ref('');
const form = reactive<IconFormValue>(createEmptyForm());

const rules = {
	short_name: [{ required: true, message: '请输入 Icon 简称', trigger: 'blur' }],
	brand: [{ required: true, message: '请选择品牌', trigger: 'change' }],
	images: [{ required: true, type: 'array', min: 1, message: '请至少上传一张图片', trigger: 'change' }],
};

function createEmptyForm(): IconFormValue {
	return {
		// 必须显式重置 id：Object.assign 不会删除上一次编辑残留的 id，否则新增会走更新接口
		id: undefined,
		short_name: '',
		interpretation: '',
		remark: '',
		brand: '',
		icon_category: '',
		scope_type: 'selected',
		status: 'enabled',
		images: [],
		product_codes: [],
	};
}

function assignForm(value: IconFormValue) {
	Object.assign(form, createEmptyForm(), value);
	productCodeText.value = value.product_codes.join('\n');
}

function splitProductCodes() {
	return productCodeText.value
		.split(/[\s,，、;；]+/)
		.map((item) => item.trim())
		.filter(Boolean);
}

function parseProductCodes() {
	return [...new Set(splitProductCodes())];
}

function appendProducts(codes: string[]) {
	const merged = [...parseProductCodes(), ...codes];
	productCodeText.value = [...new Set(merged)].join('\n');
}

function replaceProducts(codes: string[]) {
	productCodeText.value = codes.join('\n');
}

async function validateProductCodes() {
	const codes = splitProductCodes();
	if (!form.brand) {
		ElMessage.warning('请先选择品牌');
		return;
	}
	if (!codes.length) {
		ElMessage.warning('请先填写商品编码');
		return;
	}
	if (codes.length > MAX_BATCH_PRODUCTS) {
		ElMessage.warning(`商品编码最多支持 ${MAX_BATCH_PRODUCTS} 条`);
		return;
	}
	await validationDialogRef.value?.open(codes, form.brand);
}

async function openAdd() {
	assignForm(createEmptyForm());
	visible.value = true;
	await nextTick();
	formRef.value?.clearValidate();
}

async function openEdit(row: IconItem) {
	const response: any = await api.GetObj(row.id);
	assignForm(response.data);
	visible.value = true;
	await nextTick();
	formRef.value?.clearValidate();
}

async function submit() {
	await formRef.value?.validate();
	const productCodes = form.scope_type === 'selected' ? parseProductCodes() : [];
	if (form.scope_type === 'selected' && !productCodes.length) {
		ElMessage.warning('指定商品范围至少需要一个商品编码');
		return;
	}
	if (productCodes.length > MAX_BATCH_PRODUCTS) {
		ElMessage.warning(`商品编码最多支持 ${MAX_BATCH_PRODUCTS} 条`);
		return;
	}
	saving.value = true;
	try {
		const payload = { ...form, product_codes: productCodes };
		const response: any = form.id
			? await api.UpdateObj(payload)
			: await api.AddObj(payload);
		const savedIconId = form.id || Number(response?.data?.id) || undefined;
		ElMessage.success('Icon 保存成功');
		visible.value = false;
		emit('saved', savedIconId);
	} finally {
		saving.value = false;
	}
}

defineExpose({ openAdd, openEdit });
</script>

<style scoped>
.form-grid {
	display: grid;
	grid-template-columns: 1fr 1fr;
	gap: 0 18px;
}

.form-grid :deep(.el-select) {
	width: 100%;
}

.product-input {
	display: grid;
	grid-template-columns: 1fr auto;
	align-items: start;
	gap: 12px;
	width: 100%;
}

.product-actions {
	display: flex;
	flex-direction: column;
	gap: 8px;
}
</style>
