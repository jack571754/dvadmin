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
	// 确保弹窗本身不滚动
	.el-dialog__body {
		padding: 20px;
		overflow: hidden;
	}

	// 表单容器样式
	.el-form {
		// 设置最大高度并启用滚动
		max-height: 75vh;
		overflow-y: auto;
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
