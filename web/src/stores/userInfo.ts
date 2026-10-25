import { defineStore } from 'pinia';
import { UserInfosStates } from './interface';
import { Session } from '/@/utils/storage';
import { request } from '../utils/service';
import { getBaseURL } from '../utils/baseUrl';
import { captureSession } from '../shared/access/sessionEvents';
import headerImage from '/@/assets/img/headerImage.png';

/**
 * 用户信息
 * @methods setUserInfos 设置用户信息
 */
export const useUserInfo = defineStore('userInfo', {
	state: (): UserInfosStates => ({
		userInfos: {
			id:'',
			avatar: '',
			username: '',
			name: '',
			email: '',
			mobile: '',
			gender: '',
			pwd_change_count:null,
			is_superuser: false,
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
		isSocketOpen: false
	}),
	actions: {
		async setPwdChangeCount(count: number) {
			this.userInfos.pwd_change_count = count;
		},
		async updateUserInfos(userInfos:any) {
			this.userInfos.id = userInfos.id;
			this.userInfos.username = userInfos.name;
			this.userInfos.avatar = userInfos.avatar ? getBaseURL(userInfos.avatar) : headerImage;
			this.userInfos.name = userInfos.name;
			this.userInfos.email = userInfos.email;
			this.userInfos.mobile = userInfos.mobile;
			this.userInfos.gender = userInfos.gender;
			this.userInfos.dept_info = userInfos.dept_info;
			this.userInfos.role_info = userInfos.role_info;
			this.userInfos.pwd_change_count = userInfos.pwd_change_count;
			this.userInfos.is_superuser = userInfos.is_superuser;
			Session.set('userInfo', this.userInfos);
		},
		async setUserInfos() {
            // Always validate the current session; cached profiles can belong to another account.
            return this.getApiUserInfo();
        },
		async setWebSocketState(socketState: boolean) {
			this.isSocketOpen = socketState;
		},
		async getApiUserInfo() {
			const assertCurrent = captureSession();
			return request({
				url: '/api/system/user/user_info/',
				method: 'get',
			}).then(async (res:any)=>{
				assertCurrent();
                await this.updateUserInfos(res.data);
                return res;

			})
		},
	},
});
