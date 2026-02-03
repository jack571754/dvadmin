import { defineAsyncComponent, AsyncComponentLoader } from 'vue';
export let pluginsAll: any = [];
// 用于追踪已注册的组件，避免重复注册
const registeredComponents = new Set<string>();

// 安全注册组件函数
const safeRegisterComponent = (app: any, name: string, component: AsyncComponentLoader) => {
	if (name && !registeredComponents.has(name)) {
		app.component(name, defineAsyncComponent(component));
		registeredComponents.add(name);
	}
};

// 扫描插件目录并注册插件
export const scanAndInstallPlugins = (app: any) => {
	const pluginNames = new Set();

	// 扫描本地插件目录中的 .ts 文件（只扫描一级子目录的 index.ts）
	const localPluginModules = import.meta.glob('./*/index.ts');
	for (const [key, value] of Object.entries(localPluginModules)) {
		const pluginName = key.match(/\.\/([^\/]+)\/index\.ts/)?.[1];
		if (pluginName) {
			pluginNames.add(pluginName);
		}
	}

	// 扫描 node_modules/@great-dream 中的插件
	const dreamComponents = import.meta.glob('/node_modules/@great-dream/*/index.ts');
	for (let [key, value] of Object.entries(dreamComponents)) {
		key = key.replace('node_modules/@great-dream/', '');
		const name = key.slice(key.lastIndexOf('/') + 1, key.lastIndexOf('.'));
		// 使用插件名作为前缀避免冲突
		const pluginName = key.match(/\/([^\/]+)\//)?.[1];
		if (pluginName && name === 'index') {
			const componentName = `${pluginName}Index`;
			safeRegisterComponent(app, componentName, value as AsyncComponentLoader);
		}
		if (pluginName) {
			pluginNames.add(pluginName);
		}
	}

	pluginsAll = Array.from(pluginNames);
	console.log('已发现插件：', pluginsAll);

	// 尝试加载插件的 index.ts（如果存在）
	for (const pluginName of pluginsAll) {
		// 先尝试本地插件
		try {
			const plugin = import(`./${pluginName}/index.ts`);
			plugin.then((module) => {
				if (module.default) {
					app.use(module.default);
					console.log(`${pluginName}插件已加载`);
				}
			}).catch((error) => {
				// 静默处理，避免大量控制台输出
			});
		} catch (e) {
			// 静默处理
		}
	}
};
