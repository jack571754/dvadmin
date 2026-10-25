<template>
	<div class="layout-footer pb5 pt2">
		<div class="layout-footer-warp">
			<div>{{ $t('message.footer.copyright') }}</div>
		</div>
	</div>
</template>

<script setup lang="ts" name="layoutFooter">
import { useI18n } from 'vue-i18n';
const { t } = useI18n();
// 此处需有内容（注释也得），否则缓存将失败
</script>

<style scoped lang="scss">
.layout-footer {
	width: 100%;
	display: flex;
	&-warp {
		margin: auto;
		color: var(--el-text-color-secondary);
		text-align: center;
		animation: error-num 0.3s ease;
	}
}
</style>
