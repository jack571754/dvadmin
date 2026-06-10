
/**
 * window.localStorage 浏览器永久缓存
 * @method set 设置永久缓存
 * @method get 获取永久缓存
 * @method remove 移除永久缓存
 * @method clear 移除全部永久缓存
 */
export const Local = {
	// 设置永久缓存
	set(key: string, val: any) {
		window.localStorage.setItem(key, JSON.stringify(val));
	},
	// 获取永久缓存
	get(key: string) {
		let json = <string>window.localStorage.getItem(key);
		return JSON.parse(json);
	},
	// 移除永久缓存
	remove(key: string) {
		window.localStorage.removeItem(key);
	},
	// 移除全部永久缓存
	clear() {
		window.localStorage.clear();
	},
};

/**
 * window.sessionStorage 浏览器临时缓存
 * @method set 设置临时缓存
 * @method get 获取临时缓存
 * @method remove 移除临时缓存
 * @method clear 移除全部临时缓存
 */
export const Session = {
	// 设置临时缓存
	set(key: string, val: any) {
		if (key === 'token') {
			// Token 存 localStorage（cookie 域跨 origin 无法发送）
			window.localStorage.setItem('token', val);
			return;
		}
		window.sessionStorage.setItem(key, JSON.stringify(val));
	},
	// 获取临时缓存
	get(key: string) {
		if (key === 'token') {
			// 读 localStorage，与 origin 无关
			return window.localStorage.getItem('token');
		}
		let json = <string>window.sessionStorage.getItem(key);
		return JSON.parse(json);
	},
	// 移除临时缓存
	remove(key: string) {
		if (key === 'token') {
			window.localStorage.removeItem('token');
			return;
		}
		window.sessionStorage.removeItem(key);
	},
	// 移除全部临时缓存
	clear() {
		window.localStorage.removeItem('token');
		window.sessionStorage.clear();
	},
};
