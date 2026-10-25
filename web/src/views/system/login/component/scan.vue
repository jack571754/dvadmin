<template>
	<div class="login-scan-container">
		<div class="qrcode-card">
			<div ref="qrcodeRef" class="qrcode-target"></div>
		</div>
		<div class="login-scan-tip">{{ $t('message.pages.login.scan.text') }}</div>
	</div>
</template>

<script lang="ts">
import { ref, defineComponent, onMounted } from 'vue';
import QRCode from 'qrcodejs2-fixes';

export default defineComponent({
	name: 'loginScan',
	setup() {
		const qrcodeRef = ref<HTMLElement | null>(null);
		const initQrcode = () => {
			if (!qrcodeRef.value) return;
			qrcodeRef.value.innerHTML = '';
			new QRCode(qrcodeRef.value, {
				text: `https://django-vue-admin.com`,
				width: 180,
				height: 180,
				colorDark: '#171717',
				colorLight: '#ffffff',
			});
		};
		onMounted(() => {
			initQrcode();
		});
		return { qrcodeRef };
	},
});
</script>

<style scoped lang="scss">
@keyframes scanFadeIn {
	from {
		opacity: 0;
		transform: scale(0.96);
	}
	to {
		opacity: 1;
		transform: scale(1);
	}
}

.login-scan-container {
	padding: 16px 0;
	display: flex;
	flex-direction: column;
	align-items: center;
	animation: scanFadeIn 0.3s ease forwards;

	.qrcode-card {
		padding: 12px;
		background: #ffffff;
		border: 1px solid var(--admin-border, #e5e5e5);
		border-radius: var(--admin-radius, 8px);
		box-shadow: var(--admin-shadow-xs);
		display: flex;
		align-items: center;
		justify-content: center;

		.qrcode-target {
			width: 180px;
			height: 180px;

			:deep(img) {
				margin: auto;
				display: block;
			}
		}
	}

	.login-scan-tip {
		margin-top: 14px;
		font-size: 12px;
		color: var(--admin-muted, #737373);
	}
}
</style>
