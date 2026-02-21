<template>
	<fs-page>
		<fs-crud ref="crudRef" v-bind="crudBinding"> </fs-crud>
	</fs-page>
</template>

<script lang="ts" setup name="blogArticle">
import { ref, onMounted } from 'vue';
import { useFs } from '@fast-crud/fast-crud';
import { createCrudOptions } from './crud';

const { crudBinding, crudRef, crudExpose } = useFs({ createCrudOptions });

onMounted(() => {
	crudExpose.doRefresh();
});
</script>

<style scoped lang="scss">
// 文章表单弹窗样式优化
:deep(.article-form-dialog) {
	// 弹窗整体布局
	.el-dialog {
		display: flex;
		flex-direction: column;
		max-height: 90vh;
	}

	.el-dialog__header {
		flex-shrink: 0;
	}

	// 内容区域 - 可滚动
	.el-dialog__body {
		padding: 20px;
		overflow-y: auto;
		flex: 1;
		min-height: 0;
	}

	// Footer 固定在底部
	.el-dialog__footer {
		flex-shrink: 0;
		position: sticky;
		bottom: 0;
		background: #fff;
		border-top: 1px solid #ebeef5;
		padding: 15px 20px;
		margin-top: 0;
		z-index: 10;
	}

	// 表单容器样式
	.el-form {
		padding-right: 5px;

		.el-row {
			margin-bottom: 0;
		}
	}

	// 文章内容编辑器容器
	.article-content-wrapper {
		border: 1px solid #dcdfe6;
		border-radius: 4px;
		overflow: hidden;
		background: #fff;
		margin-top: 10px;

		// 修复 WangEditor 滚动问题
		:deep(.editor-container) {
			.w-e-text-container {
				overflow-y: auto !important;
			}

			.w-e-text-content {
				overflow-y: auto !important;
				min-height: 400px;
			}
		}
	}
}

// 表单项间距优化
:deep(.article-form-dialog) {
	.el-form-item {
		margin-bottom: 12px;
	}

	.el-form-item:last-child {
		margin-bottom: 0;
	}
}
</style>
