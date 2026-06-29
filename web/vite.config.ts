import vue from '@vitejs/plugin-vue';
import { resolve } from 'path';
import { defineConfig, loadEnv, ConfigEnv } from 'vite';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
// import vueJsx from '@vitejs/plugin-vue-jsx'
import fs from 'fs';

function generateVersionFile() {
	const version = `${process.env.npm_package_version || '1.0.0'}.${new Date().getTime()}`;
	fs.writeFileSync(`public/version-build`, version);
}

const pathResolve = (dir: string) => {
	return resolve(__dirname, '.', dir);
};

const alias: Record<string, string> = {
	'/@': pathResolve('./src/'),
	'@great-dream': pathResolve('./node_modules/@great-dream/'),
	'@views': pathResolve('./src/views'),
	'vue-i18n': 'vue-i18n/dist/vue-i18n.cjs.js',
	'@dvaformflow':pathResolve('./src/viwes/plugins/dvaadmin_form_flow/src/')
};

const viteConfig = defineConfig((mode: ConfigEnv) => {
	const env = loadEnv(mode.mode, process.cwd());
	// 当Vite构建时，生成版本文件
	generateVersionFile()
	return {
		plugins: [vue(), /* vueJsx(), */ vueSetupExtend()],
		root: process.cwd(),
		resolve: { alias },
		base: mode.command === 'serve' ? './' : env.VITE_PUBLIC_PATH,
		optimizeDeps: {
			include: ['element-plus/es/locale/lang/zh-cn', 'element-plus/es/locale/lang/en', 'element-plus/es/locale/lang/zh-tw'],
		},
		server: {
			host: '0.0.0.0',
			port: env.VITE_PORT as unknown as number,
			open: false,
			hmr: true,
			proxy: {
				'/gitee': {
					target: 'https://gitee.com',
					ws: true,
					changeOrigin: true,
					rewrite: (path) => path.replace(/^\/gitee/, ''),
				},
			},
		},
		build: {
			outDir: env.VITE_DIST_PATH || 'dist',
			// 各 vendor 拆分后单 chunk 仍可能 > 1500kB（如 univer/element-plus），按需放宽告警阈值
			chunkSizeWarningLimit: 2000,
			rollupOptions: {
				output: {
					entryFileNames: `assets/[name].[hash].js`,
					chunkFileNames: `assets/[name].[hash].js`,
					assetFileNames: `assets/[name].[hash].[ext]`,
					compact: true,
					// 按 node_modules 包名拆分大体积依赖，避免入口包堆积。
					// 路由视图本身已通过 import.meta.glob 懒加载，这里只处理 main.ts 静态引入的 vendor。
					manualChunks(id) {
						if (!id.includes('node_modules')) return;
						// 图表全家桶（echarts / echarts-gl / echarts-wordcloud / zrender）
						if (/[\\/]node_modules[\\/](echarts|echarts-gl|echarts-wordcloud|zrender)[\\/]/.test(id)) return 'echarts';
						// Univer 电子表格（仅 product_spec 页面使用，懒加载进该页 chunk）
						if (id.includes('@univerjs')) return 'univer';
						// 富文本编辑器
						if (id.includes('@wangeditor')) return 'wangeditor';
						// JSON 编辑器
						if (/[\\/]node_modules[\\/](jsoneditor|json-editor-vue3)[\\/]/.test(id)) return 'jsoneditor';
						// fast-crud 全家桶
						if (id.includes('@fast-crud')) return 'fast-crud';
						// Element Plus + 其图标
						if (/[\\/]node_modules[\\/](element-plus|@element-plus)[\\/]/.test(id)) return 'element-plus';
						// vxe-table + xe-utils
						if (/[\\/]node_modules[\\/](vxe-table|xe-utils)[\\/]/.test(id)) return 'vxe-table';
						// Vant 移动端组件（仅部分页面使用）
						if (/[\\/]node_modules[\\/](vant|vant4-kit|@meetjs[\\/]vant4-kit)[\\/]/.test(id)) return 'vant';
						// 图标选择器 + iconify
						if (/[\\/]node_modules[\\/](e-icon-picker|@iconify)[\\/]/.test(id)) return 'icons';
						// 拖拽 / 布局 / 裁剪等较大独立库
						if (id.includes('vue-grid-layout')) return 'grid-layout';
						if (/[\\/]node_modules[\\/](cropperjs|vue-cropper)[\\/]/.test(id)) return 'cropper';
						if (id.includes('jsplumb')) return 'jsplumb';
						// Vue 核心（vue / vue-router / pinia / @vue/*）独立成最早加载的 chunk
						if (/[\\/]node_modules[\\/](@vue|vue|vue-router|pinia)[\\/]/.test(id)) return 'vue';
					},
				},
			},
		},
		css: { preprocessorOptions: { css: { charset: false } } },
		define: {
			__VUE_I18N_LEGACY_API__: JSON.stringify(false),
			__VUE_I18N_FULL_INSTALL__: JSON.stringify(false),
			__INTLIFY_PROD_DEVTOOLS__: JSON.stringify(false),
			__VERSION__: JSON.stringify(process.env.npm_package_version),
		},
	};
});

export default viteConfig;
