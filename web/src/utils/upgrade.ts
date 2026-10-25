import axios from 'axios';
import { Local, Session } from '/@/utils/storage';
import { ElNotification } from 'element-plus';

// 是否显示升级提示信息框
const IS_SHOW_UPGRADE_SESSION_KEY = 'isShowUpgrade';
const VERSION_KEY = 'DVADMIN3_VERSION';
const VERSION_FILE_NAME = 'version-build';
const CHECK_INTERVAL = 5 * 60 * 1000; // 最多每 5 分钟检查一次版本，避免每次切换路由均发送网络请求

let lastCheckTime = 0;

const META_ENV = import.meta.env;

export function showUpgrade() {
	const isShowUpgrade = Session.get(IS_SHOW_UPGRADE_SESSION_KEY) ?? false;
	if (isShowUpgrade) {
		Session.remove(IS_SHOW_UPGRADE_SESSION_KEY);
		ElNotification({
			title: '新版本升级',
			message: '检测到系统新版本，正在更新中！不用担心，更新很快的哦！',
			type: 'success',
			duration: 5000,
		});
	}
}

// 生产环境前端版本校验
export async function checkVersion() {
	if (META_ENV.MODE === 'development') {
		// 开发环境无需校验前端版本
		return;
	}
	const now = Date.now();
	if (now - lastCheckTime < CHECK_INTERVAL) {
		return;
	}
	lastCheckTime = now;
	try {
		// 获取线上版本号 t为时间戳，防止缓存
		const res = await axios.get(`${META_ENV.VITE_PUBLIC_PATH}${VERSION_FILE_NAME}?t=${now}`);
		const { status, data } = res || {};
		if (status === 200 && data) {
			// 获取当前版本号
			const localVersion = Local.get(VERSION_KEY);
			// 将当前版本号持久缓存至本地
			Local.set(VERSION_KEY, data);
			// 当用户本地存在版本号并且和线上版本号不一致时，进行页面刷新操作
			if (localVersion && localVersion !== data) {
				Session.set(IS_SHOW_UPGRADE_SESSION_KEY, true);
				window.location.reload();
			}
		}
	} catch (e) {
		// 静默失败，不阻断正常导航
		console.warn('[checkVersion] failed quietly', e);
	}
}
