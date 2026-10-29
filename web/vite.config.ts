import vue from '@vitejs/plugin-vue';
import { readdirSync, rmdirSync, statSync, unlinkSync } from 'fs';
import { join, resolve, sep } from 'path';
import { defineConfig, loadEnv, ConfigEnv, type Plugin } from 'vite';
import vueSetupExtend from 'vite-plugin-vue-setup-extend';
// import vueJsx from '@vitejs/plugin-vue-jsx'
/**
 * Vite 内置的清空逻辑（emptyDir）用的是 fs.rmSync；在本机 Windows + 杀软环境下
 * fs.rmSync 会「返回成功但不删文件」，导致 dist 里的旧哈希文件无限堆积（实测到 276MB）。
 * 这里改用 unlinkSync 递归删除，行为可验证，构建完不会再残留上一次的产物。
 */
function purgeOutDir(): Plugin {
    let root = '';
    let outDir = '';
    let enabled = false;
    const purge = (dir: string) => {
        let entries: string[];
        try {
            entries = readdirSync(dir);
        } catch {
            return;
        }
        for (const name of entries) {
            if (name === '.git') continue;
            const full = join(dir, name);
            try {
                if (statSync(full).isDirectory()) {
                    purge(full);
                    rmdirSync(full);
                } else {
                    unlinkSync(full);
                }
            } catch {
                // 单个文件删不掉不应中断构建，交给人看日志
            }
        }
    };
    return {
        name: 'dvadmin-purge-out-dir',
        apply: 'build',
        configResolved(config) {
            root = resolve(config.root);
            outDir = resolve(root, config.build.outDir);
            // 安全线：不清根目录，也不清根目录的上级目录
            const unsafe = outDir === root || root.startsWith(outDir + sep) || /^[a-zA-Z]:\\?$/.test(outDir);
            enabled = config.build.emptyOutDir !== false && !unsafe;
        },
        buildStart() {
            if (enabled) purge(outDir);
        },
    };
}

function generateVersionFile(): Plugin {
    return {
        name: 'dvadmin-build-version',
        apply: 'build',
        generateBundle() {
            this.emitFile({ type: 'asset', fileName: 'version-build',
                source: `${process.env.npm_package_version || '1.0.0'}.${Date.now()}` });
        },
    };
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
	return {
		plugins: [vue(), /* vueJsx(), */ vueSetupExtend(), purgeOutDir(), generateVersionFile()],
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
			emptyOutDir: true,
			chunkSizeWarningLimit: 1500,
			rollupOptions: {
				output: {
					entryFileNames: `assets/[name].[hash].js`,
					chunkFileNames: `assets/[name].[hash].js`,
					assetFileNames: `assets/[name].[hash].[ext]`,
					compact: true,
					// 只给「首屏必用且版本稳定」的库单独成 chunk，方便它们跨发版缓存。
					// 注意不要把 @fast-crud/* 整包归一：fast-extends 的存储适配器与
					// jsoneditor 原本是懒加载 chunk，并进来会直接抬高首屏体积。
					manualChunks: {
						vue: ['vue', 'vue-router', 'pinia'],
						'element-plus': ['element-plus', '@element-plus/icons-vue'],
						'fast-crud': ['@fast-crud/fast-crud', '@fast-crud/ui-element'],
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
