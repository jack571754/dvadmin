import type { App } from 'vue';

export let pluginsAll: string[] = [];

/**
 * 扫描并安装前后端扩展插件
 * 仅加载每个插件根目录的 index.ts 入口，避免将普通 ts 文件误当作全局 Vue 组件注册
 */
export const scanAndInstallPlugins = (app: App) => {
	const pluginNames = new Set<string>();

	// 1. 本地插件 (src/views/plugins/*/index.ts)
	const localPlugins: Record<string, any> = import.meta.glob('./*/index.ts', { eager: true });
	for (const [path, module] of Object.entries(localPlugins)) {
		const match = path.match(/\.\/([^/]+)\/index\.ts/);
		if (match && match[1]) {
			const pluginName = match[1];
			pluginNames.add(pluginName);
			const plugin = module?.default;
			if (plugin && typeof plugin.install === 'function') {
				app.use(plugin);
			}
		}
	}

	// 2. 外部包插件 (@great-dream/*/index.ts)
	const npmPlugins: Record<string, any> = import.meta.glob('/node_modules/@great-dream/*/index.ts', { eager: true });
	for (const [path, module] of Object.entries(npmPlugins)) {
		const match = path.match(/@great-dream\/([^/]+)\/index\.ts/);
		if (match && match[1]) {
			const pluginName = match[1];
			pluginNames.add(pluginName);
			const plugin = module?.default;
			if (plugin && typeof plugin.install === 'function') {
				app.use(plugin);
			}
		}
	}

	pluginsAll = Array.from(pluginNames);
};
