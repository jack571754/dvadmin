<template>
	<div class="personal-container">
    <div class="personal-header">
      <h1 class="personal-title">
        <span :style="{ color: headerTextColor }">{{ currentTime }}，{{ state.personalForm.username }}</span>
        <span class="personal-subtitle">{{$t('message.pages.personal.PersonalInfo1')}}</span>
      </h1>
    </div>
		<el-row :gutter="20">

			<!-- 个人信息 -->
			<el-col :span="16">
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="personal-card">
              <div class="personal-card-header">
                <h2 class="personal-card-title">{{ $t('message.pages.personal.info.myInfoTitle') }}</h2>
              </div>
              <div class="personal-card-body">
                <el-row :gutter="20">
                  <el-col :span="24" class="personal-info-section">
                    <div class="avatar-section">
                      <avatarSelector v-model="selectImgVisible" @uploadImg="uploadImg" ref="avatarSelectorRef"></avatarSelector>
                    </div>
                    <el-form :model="state.personalForm" :rules="rules" ref="userInfoFormRef" label-width="100px" class="personal-form">
                      <div class="info-list">
                        <div class="info-item">
                          <span class="info-label">{{ $t('message.pages.personal.info.nickname') }}</span>
                          <el-form-item prop="name" class="info-form-item" style="margin-bottom: 0px !important;">
                            <el-input v-model="state.personalForm.name" :placeholder="$t('message.pages.personal.form.nicknamePlaceholder')" clearable class="form-input" :disabled="!isEditing"></el-input>
                          </el-form-item>
                        </div>
                        <div class="info-item">
                          <span class="info-label">{{ $t('message.pages.personal.form.email') }}</span>
                          <el-form-item prop="email" class="info-form-item"  style="margin-bottom: 0px !important;">
                            <el-input v-model="state.personalForm.email" :placeholder="$t('message.pages.personal.form.emailPlaceholder')" clearable class="form-input" :disabled="!isEditing"></el-input>
                          </el-form-item>
                        </div>
                        <div class="info-item">
                          <span class="info-label">{{ $t('message.pages.personal.form.mobile') }}</span>
                          <el-form-item prop="mobile" class="info-form-item"  style="margin-bottom: 0px !important;">
                            <el-input v-model="state.personalForm.mobile" :placeholder="$t('message.pages.personal.form.mobilePlaceholder')" clearable class="form-input" :disabled="!isEditing"></el-input>
                          </el-form-item>
                        </div>
                        <div class="info-item">
                          <span class="info-label">{{ $t('message.pages.personal.form.gender') }}</span>
                          <el-form-item prop="gender" class="info-form-item" style="margin-bottom: 0px !important;">
                            <el-select v-model="state.personalForm.gender" :placeholder="$t('message.pages.personal.form.genderPlaceholder')" clearable class="form-input" :disabled="!isEditing">
                              <el-option v-for="(item, index) in translatedGenderList" :key="index" :label="item.label" :value="item.value"></el-option>
                            </el-select>
                          </el-form-item>
                        </div>
                        <div class="info-item">
                          <span class="info-label">{{ $t('message.pages.personal.info.department') }}</span>
                          <el-tag class="info-tag">{{ state.personalForm.dept_info.dept_name }}</el-tag>
                        </div>
                        <div class="info-item">
                          <span class="info-label">{{ $t('message.pages.personal.info.roles') }}</span>
                          <div class="info-tags">
                            <el-tag v-for="(item, index) in state.personalForm.role_info" :key="index" class="role-tag">{{ item.name }}</el-tag>
                          </div>
                        </div>
                        <div class="info-item">
                          <span class="info-label">{{ $t('message.pages.personal.form.passwd') }}</span>
                          <el-button text type="primary" @click="passwordFormShow = true" class="security-button">
                    {{ $t('message.pages.personal.info.changePasswordNow') }}
                    <el-icon class="button-icon"><Edit /></el-icon>
                  </el-button>
                        </div>
                      </div>
                    </el-form>
                  </el-col>
                </el-row>
              </div>
              
              <div class="form-button-section">
                <el-form-item>
                  <template v-if="!isEditing">
                    <el-button type="primary" @click="isEditing = true" class="submit-button">
                        更新信息
                        <el-icon class="button-icon">
                          <Position />
                        </el-icon>
                      </el-button>
                  </template>
                  <template v-else>
                    <el-button type="primary" @click="submitForm" class="submit-button">
                      提交
                    </el-button>
                    <el-button @click="isEditing = false" class="cancel-button">
                      取消
                    </el-button>
                  </template>
                </el-form-item>
              </div>
            </div>
          </el-col>
          <el-col :span="24">
            <div class="personal-card quote-card" :style="{ background: smokeTextBgColor }">
              <div class="quote-container">
                <p class="smoke-text" ref="smokeTextRef" :style="{ color: smokeTextColor }">
                  {{$t('message.pages.personal.PersonalInfo2')}}
                </p>
              </div>
            </div>
          </el-col>
        </el-row>
			</el-col>

			<!-- 消息通知 -->
      <el-col :span="8" class="home-card-one mb15">
        <div class="notification-card">
          <div class="notification-card-header">
            <h3 class="notification-card-title">{{ $t('message.router.systemNotice') }}</h3>
            <button type="button" class="more-button" @click="msgMore">
              {{ $t('message.home.more') }}
              <i class="el-icon fs-icon fs-button-icon-right"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024"><path fill="currentColor" d="M512 160c320 0 512 352 512 352S832 864 512 864 0 512 0 512s192-352 512-352m0 64c-225.28 0-384.128 208.064-436.8 288 52.608 79.872 211.456 288 436.8 288 225.28 0 384.128-208.064 436.8-288-52.608-79.872-211.456-288-436.8-288m0 64a224 224 0 1 1 0 448 224 224 0 0 1 0-448m0 64a160.19 160.19 0 0 0-160 160c0 88.192 71.744 160 160 160s160-71.808 160-160-71.744-160-160-160"></path></svg></i>
            </button>
          </div>
          <div class="notification-list">
            <div v-for="(item, index) in state.newsInfoList" :key="index" class="notification-item">
              <div class="notification-icon">
                <i class="fa fa-commenting-o"></i>
              </div>
              <div class="notification-content">
                <div class="notification-header">
                  <span class="notification-creator">[{{ item.creator_name }}]</span>
                  <span class="notification-time">{{ item.create_datetime }}</span>
                </div>
                <div class="notification-title">{{ item.title }}</div>
              </div>
            </div>
          </div>
        </div>
		</el-col>
    </el-row>
    <el-row>

		</el-row>
		<!--    密码修改-->
		<el-dialog v-model="passwordFormShow" :title="$t('message.pages.personal.dialog.passwordChange')">
			<el-form
				ref="userPasswordFormRef"
				:model="userPasswordInfo"
				required-asterisk
				label-width="100px"
				label-position="left"
				:rules="passwordRules"
				center
			>
				<el-form-item :label="$t('message.pages.personal.dialog.oldPassword')" required prop="oldPassword">
					<el-input type="password" v-model="userPasswordInfo.oldPassword" :placeholder="$t('message.pages.personal.dialog.oldPasswordPlaceholder')" show-password clearable></el-input>
				</el-form-item>
				<el-form-item required prop="newPassword" :label="$t('message.pages.personal.dialog.newPassword')">
					<el-input type="password" v-model="userPasswordInfo.newPassword" :placeholder="$t('message.pages.personal.dialog.newPasswordPlaceholder')" show-password clearable></el-input>
				</el-form-item>
				<el-form-item required prop="newPassword2" :label="$t('message.pages.personal.dialog.confirmPassword')">
					<el-input type="password" v-model="userPasswordInfo.newPassword2" :placeholder="$t('message.pages.personal.dialog.confirmPasswordPlaceholder')" show-password clearable></el-input>
				</el-form-item>
			</el-form>
			<template #footer>
				<span class="dialog-footer">
					<el-button type="primary" @click="settingPassword"> <i class="fa fa-check"></i>{{ $t('message.pages.personal.button.submit') }} </el-button>
				</span>
			</template>
		</el-dialog>
	</div>
</template>

<script setup lang="ts" name="personal">
import { reactive, computed, onMounted, ref, defineAsyncComponent, nextTick, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { formatAxis } from '/@/utils/formatTime';
import * as api from './api';
import { ElMessage } from 'element-plus';
import { getBaseURL } from '/@/utils/baseUrl';
import { Session } from '/@/utils/storage';
import { useRouter } from 'vue-router';
import { useUserInfo } from '/@/stores/userInfo';
import { useThemeConfig } from '/@/stores/themeConfig';
import { successMessage } from '/@/utils/message';
import { dictionary } from '/@/utils/dictionary';
import { Md5 } from 'ts-md5';
import { Edit, Position } from '@element-plus/icons-vue';

interface NewsItem {
	creator_name: string;
	create_datetime: string;
	title: string;
}

interface PersonalState {
	newsInfoList: NewsItem[];
	personalForm: {
		avatar: string;
		username: string;
		name: string;
		email: string;
		mobile: string;
		gender: string | number;
		dept_info: {
			dept_id: number;
			dept_name: string;
		};
		role_info: Array<{
			id: number;
			name: string;
		}>;
	};
}

const router = useRouter();
const themeConfigStore = useThemeConfig();
const { t } = useI18n();

const avatarSelector = defineAsyncComponent(() => import('/@/components/avatarSelector/index.vue'));
const avatarSelectorRef = ref<any>(null);
const smokeTextRef = ref<HTMLElement | null>(null);
const currentTime = computed(() => {
	return formatAxis(new Date());
});

const isDark = computed(() => {
	return themeConfigStore.themeConfig.isIsDark;
});

const smokeTextBgColor = computed(() => {
	return isDark.value ? '#191919' : '#fff';
});

const smokeTextColor = computed(() => {
	return isDark.value ? '#fff' : '#000';
});

const headerTextColor = computed(() => {
	return isDark.value ? '#e6e6e6' : '#000000';
});
const userInfoFormRef = ref();
const isEditing = ref(false);
const rules = reactive({
	name: [{ required: true, validator: (rule: any, value: any, callback: any) => {
		if (!value) callback(new Error(t('message.pages.personal.validation.nicknameRequired')));
		else callback();
	}, trigger: 'blur' }],
	mobile: [{ pattern: /^1[3-9]\d{9}$/, validator: (rule: any, value: any, callback: any) => {
		if (value && !/^1[3-9]\d{9}$/.test(value)) callback(new Error(t('message.pages.personal.validation.mobileInvalid')));
		else callback();
	}, trigger: 'blur' }],
});

let selectImgVisible = ref(false);

const state = reactive<PersonalState>({
	newsInfoList: [],
	personalForm: {
		avatar: '',
		username: '',
		name: '',
		email: '',
		mobile: '',
		gender: '',
		dept_info: {
			dept_id: 0,
			dept_name: '',
		},
		role_info: [
			{
				id: 0,
				name: '',
			},
		],
	},
});


/**
 * 跳转消息中心
 */
const route = useRouter();
const msgMore = () => {
	route.push({ path: '/messageCenter' });
};

const genderList = ref();
const translatedGenderList = computed(() => {
	if (!genderList.value) return [];
	const labelMap: Record<string, string> = {
		'男': t('message.pages.personal.form.genderMale'),
		'女': t('message.pages.personal.form.genderFemale'),
		'保密': t('message.pages.personal.form.genderSecret'),
	};
	return genderList.value.map((item: any) => ({
		...item,
		label: labelMap[item.label] || item.label,
	}));
});
/**
 * 获取用户个人信息
 */
const getUserInfo = function () {
	api.GetUserInfo({}).then((res: any) => {
		const { data } = res;
		genderList.value = dictionary('gender');
		state.personalForm.avatar = data.avatar || '';
		state.personalForm.username = data.username || '';
		state.personalForm.name = data.name || '';
		state.personalForm.email = data.email || '';
		state.personalForm.mobile = data.mobile || '';
		state.personalForm.gender = data.gender;
		state.personalForm.dept_info.dept_name = data.dept_info.dept_name || '';
		state.personalForm.role_info = data.role_info || [];
	});
};

/**
 * 更新用户信息
 * @param formEl
 */
const submitForm = async () => {
	if (!userInfoFormRef.value) return;
	await userInfoFormRef.value.validate((valid: boolean, fields: any) => {
		if (valid) {
			api.updateUserInfo(state.personalForm).then((res: any) => {
				ElMessage.success(t('message.pages.personal.messages.updateSuccess'));
				getUserInfo();
				isEditing.value = false;
			});
		} else {
			ElMessage.error(t('message.pages.personal.validation.formValidationFailed'));
		}
	});
};

/**
 * 获取消息通知
 */
const getMsg = async () => {
	try {
		const res = await api.GetSelfReceive({});
		const { data } = res || {};
		
		if (data && Array.isArray(data) && data.length > 0) {
			state.newsInfoList = data.map((item: any) => ({
				creator_name: String(item.creator_name || '未知用户'),
				create_datetime: String(item.create_datetime || ''),
				title: String(item.title || ''),
			}));
		} else {
			state.newsInfoList = [];
		}
	} catch (error) {
		console.error('Failed to fetch messages:', error);
		state.newsInfoList = [];
	}
};
onMounted(() => {
	getUserInfo();
	getMsg();
	nextTick(() => {
		initSmokeText();
	});
});

watch(() => themeConfigStore.themeConfig.globalI18n, () => {
	nextTick(() => {
		initSmokeText();
	});
});

const initSmokeText = () => {
	if (smokeTextRef.value) {
		const text = smokeTextRef.value;
		text.innerHTML = text.textContent.replace(/\S/g, "<span>$&</span>");
		const spans = text.querySelectorAll('span');
		for (let i = 0; i < spans.length; i++) {
			spans[i].addEventListener("mouseover", () => {
				spans[i].classList.add('action');
			});
		}
	}
};

/**************************密码修改部分************************/
const passwordFormShow = ref(false);
const userPasswordFormRef = ref();
const userPasswordInfo = reactive({
	oldPassword: '',
	newPassword: '',
	newPassword2: '',
});

const validatePass = (rule: any, value: any, callback: any) => {
	const pwdRegex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{8,30}');
	if (value === '') {
		callback(new Error(t('message.pages.personal.validation.oldPasswordRequired')));
	} else if (value === userPasswordInfo.oldPassword) {
		callback(new Error(t('message.pages.personal.validation.sameAsOldPassword')));
	} else if (!pwdRegex.test(value)) {
		callback(new Error(t('message.pages.personal.validation.passwordComplexity')));
	} else {
		if (userPasswordInfo.newPassword2 !== '') {
			userPasswordFormRef.value.validateField('newPassword2');
		}
		callback();
	}
};
const validatePass2 = (rule: any, value: any, callback: any) => {
	if (value === '') {
		callback(new Error(t('message.pages.personal.validation.confirmPasswordRequired')));
	} else if (value !== userPasswordInfo.newPassword) {
		callback(new Error(t('message.pages.personal.validation.passwordMismatch')));
	} else {
		callback();
	}
};

const passwordRules = reactive({
	oldPassword: [
		{
			required: true,
			message: t('message.pages.personal.validation.oldPasswordRequired'),
			trigger: 'blur',
		},
	],
	newPassword: [{ validator: validatePass, trigger: 'blur' }],
	newPassword2: [{ validator: validatePass2, trigger: 'blur' }],
});

/**
 * 重新设置密码
 */
const settingPassword = () => {
	userPasswordFormRef.value.validate((valid: boolean) => {
		if (valid) {
			api.UpdatePassword(userPasswordInfo).then((res: any) => {
				ElMessage.success(t('message.pages.personal.messages.passwordChangeSuccess'));
				setTimeout(() => {
					Session.remove('token');
					router.push('/login');
				}, 1000);
			});
		} else {
			// 校验失败
			// 登录表单校验失败
			ElMessage.error(t('message.pages.personal.messages.formValidationFailed'));
		}
	});
};

const uploadImg = (data: any) => {
	let formdata = new FormData();
	formdata.append('file', data);
	api.uploadAvatar(formdata).then((res: any) => {
		if (res.code === 2000) {
			selectImgVisible.value = false;
			// state.personalForm.avatar = getBaseURL() + res.data.url;
			state.personalForm.avatar = res.data.url;
			api.updateUserInfo(state.personalForm).then((_res: any) => {
				successMessage(t('message.pages.personal.messages.updateSuccess'));
				getUserInfo();
				useUserInfo().updateUserInfos();
				if (avatarSelectorRef.value && typeof avatarSelectorRef.value.updateAvatar === 'function') {
					avatarSelectorRef.value.updateAvatar(state.personalForm.avatar);
				}
			});
		}
	});
};
</script>

<style scoped lang="scss">
$homeNavLengh: 8;

// 个人中心容器
.personal-container {
  padding: 20px;
  overflow: hidden;

  // 头部
  .personal-header {
    margin-bottom: 24px;
  }

  .personal-title {
    font-size: 20px;
    font-weight: 700;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;

    .personal-subtitle {
      font-size: 14px;
      font-weight: normal;
      color: var(--el-text-color-secondary);
    }
  }

  // 卡片样式
  .personal-card {
    background: var(--el-color-white);
    border: 1px solid var(--el-border-color);
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;
    margin-bottom: 20px;

    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    // 卡片头部
    .personal-card-header {
      padding: 20px 24px 0;

      .personal-card-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0 0 16px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
    }

    // 卡片内容
    .personal-card-body {
      padding: 0 24px 24px;
    }
  }

  // 个人信息部分
  .personal-info-section {
    .avatar-section {
      margin-bottom: 20px;
      display: flex;
      justify-content: center;
    }

    .info-list {
      .info-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 6px 0;
        border-bottom: 1px solid var(--el-border-color-light);

        &:last-child {
          border-bottom: none;
        }

        .info-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
          flex: 1;
        }

        .info-value {
          font-size: 14px;
          color: var(--el-text-color-primary);
          flex: 1;
          text-align: right;
        }

        .info-tag {
          flex-shrink: 0;
        }

        .info-tags {
          flex: 1;
          text-align: right;
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          flex-wrap: wrap;

          .role-tag {
            margin-bottom: 4px;
          }
        }

        .info-form-item {
          flex: 1;
          margin: 0;
          text-align: right;
          display: flex;
          align-items: center;
          height: 32px;

          .form-input {
            width: 100%;
            max-width: 300px;
            --el-input-height: 32px;
            --el-select-height: 32px;
            margin: 0;
          }
          
          :deep(.el-form-item) {
            margin: 0 !important;
            margin-bottom: 0 !important;
          }
          
          :deep(.el-input) {
            margin: 0;
            height: 32px;
          }
          
          :deep(.el-select) {
            margin: 0;
            height: 32px;
          }
        }
        
        /* 全局覆盖最后一个表单项目的边距 */
        :deep(.el-form .el-form-item:last-of-type) {
          margin-bottom: 0 !important;
        }
      }
    }
  }

  // 表单部分
  .personal-form-section {
    .personal-form {
      .form-input {
        width: 100%;
      }

      .form-button-section {
        display: flex;
        justify-content: flex-end;
        margin-top: 8px;
      }

      .submit-button {
        padding: 10px 24px;
        font-size: 14px;

        .button-icon {
          margin-left: 8px;
        }
      }
    }
  }

    // 表单部分
    .form-button-section {
      display: flex;
      justify-content: flex-end;
      padding: 0 24px 24px;
      
      .submit-button {
        padding: 10px 24px;
        font-size: 14px;

        .button-icon {
          margin-left: 8px;
        }
      }
      
      .cancel-button {
        margin-left: 12px;
        padding: 10px 24px;
        font-size: 14px;
      }
    }

  // 安全设置部分
  .security-card {
    .security-list {
      .security-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px solid var(--el-border-color-light);

        &:last-child {
          border-bottom: none;
        }

        .security-label {
          font-size: 14px;
          color: var(--el-text-color-secondary);
        }

        .security-value {
          font-size: 14px;
          color: var(--el-text-color-primary);
        }

        .security-button {
          font-size: 14px;

          .button-icon {
            margin-left: 4px;
          }
        }
      }
    }
  }

  // 引用卡片
  .quote-card {
    .quote-container {
      padding: 32px 24px;
      display: flex;
      align-items: center;
      justify-content: center;

      .quote-text {
        font-size: 16px;
        line-height: 24px;
        text-align: center;
        max-width: 800px;
        margin: 0;
      }
    }
  }

  // 通知卡片
  .notification-card {
    width: 100%;
    max-width: 350px;
    height: 100%;
    max-height: 580px;
    background: var(--el-color-white);
    border: 1px solid var(--el-border-color);
    border-radius: 12px;
    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.08);
    transition: all 0.3s ease;

    &:hover {
      box-shadow: 0 4px 16px 0 rgba(0, 0, 0, 0.12);
      transform: translateY(-2px);
    }

    .notification-card-header {
      padding: 20px 24px;
      border-bottom: 1px solid var(--el-border-color-light);
      display: flex;
      justify-content: space-between;
      align-items: center;

      .notification-card-title {
        font-size: 16px;
        font-weight: 600;
        color: var(--el-text-color-primary);
        margin: 0;
      }
    }

    .more-button {
      background: none;
      border: none;
      color: var(--el-text-color-secondary);
      font-size: 14px;
      cursor: pointer;
      padding: 0;

      &:hover {
        color: var(--el-color-primary);
      }
    }

    .notification-list {
      padding: 16px 24px;
      overflow-y: auto;
      max-height: calc(580px - 70px);

      .notification-item {
        display: flex;
        gap: 12px;
        padding: 16px 0;
        border-bottom: 1px solid var(--el-border-color-light);

        &:last-child {
          border-bottom: none;
        }

        .notification-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #f8f9fa;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;

          i {
            font-size: 18px;
            color: #409eff;
          }
        }

        .notification-content {
          flex: 1;

          .notification-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 8px;

            .notification-creator {
              font-size: 14px;
              font-weight: 500;
              color: var(--el-text-color-primary);
            }

            .notification-time {
              font-size: 12px;
              color: var(--el-text-color-secondary);
            }
          }

          .notification-title {
            font-size: 14px;
            color: var(--el-text-color-secondary);
            line-height: 20px;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }
      }

      .empty-notification {
        padding: 40px 0;
        text-align: center;
        color: var(--el-text-color-secondary);
      }
    }
  }

  // 密码表单
  .password-form {
    .form-input {
      width: 100%;
    }
  }
}

// 烟雾文字效果
.smoke-text-container {
	width: 100%;
	height: 100%;
	display: flex;
	align-items: center;
	justify-content: center;
}

.smoke-text {
	font-size: 16px;
	line-height: 24px;
	text-align: left;
	width: 100%;
}

.smoke-text :deep(span) {
	position: relative;
	display: inline-block;
	cursor: pointer;
}

.smoke-text :deep(span.action) {
	animation: smoke 2s linear forwards;
	transform-origin: bottom;
}

@keyframes smoke {
	0% {
		opacity: 1;
		filter: blur(0);
		transform: translateX(0) translateY(0) rotate(0deg) scale(1);
	}
	50% {
		opacity: 1;
		pointer-events: none;
	}
	100% {
		opacity: 0;
		filter: blur(20px);
		transform: translateX(300px) translateY(-300px) rotate(720deg) scale(4);
	}
}

// 滚动文字效果
.text-container {
width: 420px;
white-space: nowrap;
overflow: hidden;
text-overflow: ellipsis;
}
.text-container:hover {
animation: scrollText 5s linear infinite;
}
@keyframes scrollText {
0% { transform: translateX(0); }
100% { transform: translateX(-100%); }
}
</style>