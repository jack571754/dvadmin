<template>
	<el-form ref="formRef" size="large" class="login-content-form" :model="state.ruleForm" :rules="rules" @keyup.enter="loginClick">
		<el-form-item class="login-animation1" prop="username">
			<el-input
				type="text"
				:placeholder="$t('message.pages.login.account.accountPlaceholder1')"
				readonly
				v-model="ruleForm.username"
				clearable
				autocomplete="off"
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
				:placeholder="$t('message.pages.login.account.accountPlaceholder4')"
				v-model="ruleForm.password"
				autocomplete="new-password"
			>
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Lock /></el-icon>
				</template>
			</el-input>
		</el-form-item>
		<el-form-item class="login-animation3" prop="password_regain">
			<el-input
				type="password"
				show-password
				:placeholder="$t('message.pages.login.account.accountPlaceholder5')"
				v-model="ruleForm.password_regain"
				autocomplete="new-password"
			>
				<template #prefix>
					<el-icon class="el-input__icon"><ele-Lock /></el-icon>
				</template>
			</el-input>
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
import { FormRules } from 'element-plus';
import { useI18n } from 'vue-i18n';
import Cookies from 'js-cookie';
import { storeToRefs } from 'pinia';
import { useThemeConfig } from '/@/stores/themeConfig';
import { initFrontEndControlRoutes } from '/@/router/frontEnd';
import { initBackEndControlRoutes } from '/@/router/backEnd';
import { Session } from '/@/utils/storage';
import { formatAxis } from '/@/utils/formatTime';
import { NextLoading } from '/@/utils/loading';
import { useUserInfo } from '/@/stores/userInfo';
import { Md5 } from 'ts-md5';
import { errorMessage, successMessage } from '/@/utils/message';
import { getBaseURL } from '/@/utils/baseUrl';
import { loginChangePwd } from '/@/views/system/login/api';

export default defineComponent({
	name: 'changePwd',
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
				password_regain: '',
			},
			loading: {
				signIn: false,
			},
		});

		const validatePass = (rule: any, value: string, callback: any) => {
			const pwdRegex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{8,30}');
			if (value === '') {
				callback(new Error(t('message.pages.login.validation.newPasswordRequired')));
			} else if (!pwdRegex.test(value)) {
				callback(new Error(t('message.pages.login.validation.passwordComplexity')));
			} else {
				callback();
			}
		};

		const validatePass2 = (rule: any, value: string, callback: any) => {
			if (value === '') {
				callback(new Error(t('message.pages.login.validation.confirmPasswordRequired')));
			} else if (value !== state.ruleForm.password) {
				callback(new Error(t('message.pages.login.validation.passwordMismatch')));
			} else {
				callback();
			}
		};

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
			password: [{ required: true, validator: validatePass, trigger: 'blur' }],
			password_regain: [{ required: true, validator: validatePass2, trigger: 'blur' }],
		});
		const formRef = ref();
		const currentTime = computed(() => {
			return formatAxis(new Date());
		});

		const applyBtnClick = async () => {
			window.open(getBaseURL('/api/system/apply_for_trial/'));
		};

		const loginClick = async () => {
			if (!formRef.value) return;
			await formRef.value.validate((valid: any) => {
				if (valid) {
					state.loading.signIn = true;
					loginChangePwd({
						...state.ruleForm,
						password: Md5.hashStr(state.ruleForm.password),
						password_regain: Md5.hashStr(state.ruleForm.password_regain),
					})
						.then(async (res: any) => {
							if (res.code === 2000) {
								Cookies.set('username', res.data.username);
								Session.set('token', res.data.access);
								useUserInfo().setPwdChangeCount(res.data.pwd_change_count);
								if (!themeConfig.value.isRequestRoutes) {
									await initFrontEndControlRoutes();
									loginSuccess();
								} else {
									await initBackEndControlRoutes();
									loginSuccess();
								}
							}
						})
						.catch(() => {
							state.loading.signIn = false;
							NextLoading.done();
						});
				} else {
					errorMessage(t('message.pages.login.validation.fillLoginInfo'));
				}
			});
		};

		const loginSuccess = () => {
			let currentTimeInfo = currentTime.value;
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
			successMessage(`${currentTimeInfo}，${signInText}`);
			NextLoading.start();
		};

		onMounted(() => {
			state.ruleForm.username = Cookies.get('username') || '';
		});

		const showApply = () => {
			return window.location.href.indexOf('public') != -1;
		};

		return {
			loginClick,
			loginSuccess,
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
