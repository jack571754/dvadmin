<template>
	<el-form ref="formRef" size="large" class="login-content-form" :model="state.ruleForm" :rules="rules" @keyup.enter="loginClick">
		<el-form-item class="login-animation1" prop="username">
			<el-input
				type="text"
				:placeholder="$t('message.pages.login.account.accountPlaceholder1')"
				v-model="ruleForm.username"
				clearable
				autocomplete="username"
			>
				<template #prefix>
					<el-icon class="el-input__icon"><ele-User /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation2" prop="password">
			<el-input
				type="password"
				show-password
				:placeholder="$t('message.pages.login.account.accountPlaceholder2')"
				v-model="ruleForm.password"
				autocomplete="current-password"
			>
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Lock /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation3" v-if="isShowCaptcha" prop="captcha">
			<div class="login-captcha-row">
				<el-input
					type="text"
					maxlength="4"
					:placeholder="$t('message.pages.login.account.accountPlaceholder3')"
					v-model="ruleForm.captcha"
					clearable
					autocomplete="off"
					class="login-captcha-input"
				>
					<template #prefix>
						<el-icon class="el-input__icon"><ele-Key /></el-icon>
					</template>
				</el-input>
				<div class="login-captcha-box" :title="'点击刷新验证码'" @click="refreshCaptcha">
					<img v-if="ruleForm.captchaImgBase" :src="ruleForm.captchaImgBase" alt="captcha" class="login-captcha-img" />
					<el-icon v-else class="is-loading"><ele-Loading /></el-icon>
				</div>
			</div>
		</el-form-item>
		<el-form-item class="login-animation4">
			<el-button
				type="primary"
				class="login-content-submit"
				:loading="loading.signIn"
				@click="loginClick"
			>
				<span>{{ $t('message.pages.login.account.accountBtnText') }}</span>
			</el-button>
		</el-form-item>
	</el-form>
	<!-- 申请试用 -->
	<div style="text-align: center" v-if="showApply()">
		<el-button class="login-content-apply" link type="primary" plain @click="applyBtnClick">
			<span>{{ $t('message.pages.login.account.apply') }}</span>
		</el-button>
	</div>
</template>

<script lang="ts">
import { toRefs, reactive, defineComponent, computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { ElMessage, FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import * as loginApi from '/@/views/system/login/api';
import { useUserInfo } from '/@/stores/userInfo';
import { SystemConfigStore } from '/@/stores/systemConfig';
import { Md5 } from 'ts-md5';
import { errorMessage } from '/@/utils/message';
import { getBaseURL } from '/@/utils/baseUrl';

export default defineComponent({
	name: 'loginAccount',
	setup() {
		const { t } = useI18n();
		const storesThemeConfig = useThemeConfig();
		const { themeConfig } = storeToRefs(storesThemeConfig);
		const { userInfos } = storeToRefs(useUserInfo());
		const route = useRoute();
		const router = useRouter();
		const state = reactive({
			ruleForm: {
				username: '',
				password: '',
				captcha: '',
				captchaKey: '',
				captchaImgBase: '',
			},
			loading: {
				signIn: false,
			},
		});
		const rules = reactive<FormRules>({
			username: [
				{
					required: true,
					validator: (rule, value, callback) => {
						if (!value) callback(new Error(t('message.pages.login.validation.usernameRequired')));
						else callback();
					},
					trigger: 'blur',
				},
			],
			password: [
				{
					required: true,
					validator: (rule, value, callback) => {
						if (!value) callback(new Error(t('message.pages.login.validation.passwordRequired')));
						else callback();
					},
					trigger: 'blur',
				},
			],
			captcha: [
				{
					required: true,
					validator: (rule, value, callback) => {
						if (!value) callback(new Error(t('message.pages.login.validation.captchaRequired')));
						else callback();
					},
					trigger: 'blur',
				},
			],
		});
		const formRef = ref();
		// 时间获取
		const currentTime = computed(() => {
			return formatAxis(new Date());
		});
		// 是否开启验证码
		const isShowCaptcha = computed(() => {
			return SystemConfigStore().systemConfig['base.captcha_state'];
		});

		const getCaptcha = async () => {
			loginApi.getCaptcha().then((ret: any) => {
				state.ruleForm.captchaImgBase = ret.data.image_base;
				state.ruleForm.captchaKey = ret.data.key;
			});
		};
		const applyBtnClick = async () => {
			window.open(getBaseURL('/api/system/apply_for_trial/'));
		};
		const refreshCaptcha = async () => {
			state.ruleForm.captcha = '';
			loginApi.getCaptcha().then((ret: any) => {
				state.ruleForm.captchaImgBase = ret.data.image_base;
				state.ruleForm.captchaKey = ret.data.key;
			});
		};
		const loginClick = async () => {
			if (!formRef.value) return;
			await formRef.value.validate((valid: any) => {
				if (valid) {
					state.loading.signIn = true;
					loginApi
						.login({ ...state.ruleForm, password: Md5.hashStr(state.ruleForm.password) })
						.then(async (res: any) => {
							if (res.code === 2000) {
								const { data } = res;
								Cookies.set('username', res.data.username);
								Session.set('token', res.data.access);
								useUserInfo().setPwdChangeCount(data.pwd_change_count);
								if (data.pwd_change_count == 0) {
									return router.push('/login');
								}
								if (!themeConfig.value.isRequestRoutes) {
									// 前端控制路由
									await initFrontEndControlRoutes();
									loginSuccess();
								} else {
									// 模拟后端控制路由
									await initBackEndControlRoutes();
									loginSuccess();
								}
							}
						})
						.catch(() => {
							state.loading.signIn = false;
							NextLoading.done();
							refreshCaptcha();
						});
				} else {
					errorMessage(t('message.pages.login.validation.fillLoginInfo'));
				}
			});
		};

		// 登录成功后的跳转
		const loginSuccess = () => {
			let currentTimeInfo = currentTime.value;
			const pwd_change_count = userInfos.value.pwd_change_count ?? 0;
			if (pwd_change_count > 0) {
				if (route.query?.redirect) {
					router.push({
						path: <string>route.query?.redirect,
						query: Object.keys(<string>route.query?.params).length > 0 ? JSON.parse(<string>route.query?.params) : '',
					});
				} else {
					router.push('/');
				}
				state.loading.signIn = false;
				const signInText = t('message.pages.login.signInText');
				ElMessage.success(`${currentTimeInfo}，${signInText}`);
			}
			NextLoading.start();
		};
		onMounted(() => {
			getCaptcha();
			void SystemConfigStore().getSystemConfigs().catch(() => {});
		});
		const showApply = () => {
			return window.location.href.indexOf('public') != -1;
		};

		return {
			refreshCaptcha,
			loginClick,
			loginSuccess,
			isShowCaptcha,
			state,
			formRef,
			rules,
			applyBtnClick,
			showApply,
			...toRefs(state),
		};
	},
});
</script>

<style scoped lang="scss">
@keyframes loginFadeUp {
	from {
		opacity: 0;
		transform: translateY(12px);
	}
	to {
		opacity: 1;
		transform: translateY(0);
	}
}

.login-content-form {
	margin-top: 10px;

	:deep(.el-input__wrapper) {
		border-radius: var(--admin-radius, 8px) !important;
		padding: 4px 12px;
		transition: all 0.2s ease;
	}

	:deep(.el-input__inner) {
		font-size: 13px !important;
	}

	@for $i from 1 through 4 {
		.login-animation#{$i} {
			opacity: 0;
			animation-name: loginFadeUp;
			animation-duration: 0.35s;
			animation-fill-mode: forwards;
			animation-delay: calc(#{$i} * 0.06s);
		}
	}

	.login-captcha-row {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;

		.login-captcha-input {
			flex: 1;
		}

		.login-captcha-box {
			width: 110px;
			height: 40px;
			flex-shrink: 0;
			border: 1px solid var(--el-border-color, #e5e5e5);
			border-radius: var(--admin-radius, 8px);
			overflow: hidden;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			background: var(--el-fill-color-light, #f5f5f5);
			transition: all 0.2s ease;

			&:hover {
				border-color: var(--el-color-primary);
				opacity: 0.85;
			}

			.login-captcha-img {
				width: 100%;
				height: 100%;
				object-fit: cover;
				display: block;
			}
		}
	}

	.login-content-submit {
		width: 100%;
		height: 42px;
		font-size: 14px;
		font-weight: 600;
		letter-spacing: 2px;
		border-radius: var(--admin-radius, 8px) !important;
		margin-top: 10px;
		box-shadow: var(--admin-shadow-xs);
		transition: all 0.2s ease;

		background-color: var(--admin-primary) !important;
		border-color: var(--admin-primary) !important;
		color: var(--admin-primary-foreground) !important;

		&:hover,
		&:focus {
			opacity: 0.9;
			background-color: var(--admin-primary) !important;
			border-color: var(--admin-primary) !important;
			color: var(--admin-primary-foreground) !important;
		}
	}
}

:global(html.dark) {
	.login-content-form .login-content-submit {
		background-color: #fafafa !important;
		border-color: #fafafa !important;
		color: #0a0a0a !important;

		&:hover,
		&:focus {
			background-color: #ffffff !important;
			border-color: #ffffff !important;
			color: #0a0a0a !important;
		}
	}
}

.login-content-apply {
	margin-top: 12px;
	font-size: 13px;
}
</style>
