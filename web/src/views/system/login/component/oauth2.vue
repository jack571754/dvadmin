<template>
	<div class="other-fast-way" v-if="backends && backends.length">
		<div class="fast-title">
			<span>{{ $t('message.pages.login.link.one3') || '第三方账号快速登录' }}</span>
		</div>
		<ul class="fast-list">
			<li v-for="v in backends" :key="v.app_name">
				<a @click.once="handleOAuth2LoginClick(v)" class="fast-link-item">
					<img :src="v.icon" :alt="v.app_name" class="fast-icon" />
					<p class="fast-name">{{ v.app_name }}</p>
				</a>
			</li>
		</ul>
	</div>
</template>

<script lang="ts">
import { defineComponent, onMounted, reactive, toRefs } from 'vue';
import * as loginApi from '../api';
import { OAuth2Backend } from '/@/views/system/login/types';

export default defineComponent({
	name: 'loginOAuth2',
	setup() {
		const handleOAuth2LoginClick = (backend: OAuth2Backend) => {
			history.replaceState(null, '', location.pathname + location.search);
			window.location.href = backend.authentication_url + '?next=' + window.location.href;
		};
		const state = reactive({
			handleOAuth2LoginClick,
			backends: [] as OAuth2Backend[],
		});
		const getBackends = async () => {
			try {
				const ret: any = await loginApi.getBackends();
				state.backends = ret.data || [];
			} catch {
				// Third party oauth2 plugin not enabled; silently skip
			}
		};

		onMounted(() => {
			// Third party backends are enabled when dvadmin3_social_oauth2 is installed
			// getBackends();
		});
		return {
			...toRefs(state),
		};
	},
});
</script>

<style scoped lang="scss">
@keyframes oauthFadeIn {
	from {
		opacity: 0;
		transform: translateY(8px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.other-fast-way {
	position: relative;
	z-index: 1;
	margin-top: 24px;

	.fast-title {
		display: flex;
		align-items: center;
		justify-content: center;

		span {
			color: var(--admin-muted, #737373);
			font-size: 12px;
			padding: 0 16px;
		}

		&:before,
		&:after {
			content: '';
			flex: 1;
			height: 1px;
			background: var(--admin-border, #e5e5e5);
		}
	}
}

.fast-list {
	display: flex;
	justify-content: center;
	gap: 20px;
	margin-top: 14px;
	padding: 0;
	list-style: none;

	li {
		animation: oauthFadeIn 0.35s ease forwards;

		.fast-link-item {
			display: flex;
			flex-direction: column;
			align-items: center;
			cursor: pointer;
			text-decoration: none;
			padding: 8px 12px;
			border-radius: var(--admin-radius, 8px);
			transition: all 0.2s ease;

			&:hover {
				background: var(--admin-hover, #f5f5f5);
			}

			.fast-icon {
				width: 32px;
				height: 32px;
				margin-bottom: 6px;
				object-fit: contain;
			}

			.fast-name {
				font-size: 12px;
				color: var(--admin-text-secondary, #525252);
			}
		}
	}
}
</style>
