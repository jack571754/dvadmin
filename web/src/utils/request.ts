import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { ElMessage, ElMessageBox } from 'element-plus';
import { Session, Local } from '/@/utils/storage';
import qs from 'qs';
import { i18n } from '/@/i18n/index';

// 配置新建一个 axios 实例
const service: AxiosInstance = axios.create({
	baseURL: import.meta.env.VITE_API_URL,
	timeout: 50000,
	headers: { 'Content-Type': 'application/json' },
	paramsSerializer: {
		serialize(params) {
			return qs.stringify(params, { allowDots: true });
		},
	},
});

// 添加请求拦截器
service.interceptors.request.use(
	(config: AxiosRequestConfig) => {
		// 在发送请求之前做些什么 token
		if (Session.get('token')) {
			config.headers!['Authorization'] = `JWT ${Session.get('token')}`;
		}
		// Send Accept-Language header on all requests (FNT-02 per D-02)
		const themeConfig = Local.get('themeConfig') as { [key: string]: any } | null;
		const lang = themeConfig?.globalI18n || 'zh-cn';
		config.headers!['Accept-Language'] = lang;
		return config;
	},
	(error) => {
		// 对请求错误做些什么
		return Promise.reject(error);
	}
);

// 添加响应拦截器
service.interceptors.response.use(
	(response) => {
		// 对响应数据做点什么
		const res = response.data;
		if (res.code && res.code !== 0) {
			// `token` 过期或者账号已在别处登录
			if (res.code === 401 || res.code === 4001) {
				Session.clear(); // 清除浏览器全部临时缓存
				window.location.href = '/'; // 去登录页
				ElMessageBox.alert(i18n.global.t('message.common.logoutPrompt'), i18n.global.t('message.common.prompt'), {})
					.then(() => {})
					.catch(() => {});
			}
			return Promise.reject(service.interceptors.response);
		} else {
			return response.data;
		}
	},
	(error) => {
		// 对响应错误做点什么
		if (error.message.indexOf('timeout') != -1) {
			ElMessage.error(i18n.global.t('message.common.networkTimeout'));
		} else if (error.message == 'Network Error') {
			ElMessage.error(i18n.global.t('message.common.networkError'));
		} else {
			if (error.response.data) ElMessage.error(error.response.statusText);
			else ElMessage.error(i18n.global.t('message.common.endpointNotFound'));
		}
		return Promise.reject(error);
	}
);

// 导出 axios 实例
export default service;
