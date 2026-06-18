import { defineStore } from 'pinia';
import { request } from '/@/utils/service';
import type { TemplateSchema } from '/@/views/design_order/product_spec/schema/types';

interface TemplateListItem extends TemplateSchema {
	id: any;
	builtin: boolean;
}

interface State {
	templates: Record<string, TemplateListItem>;
	loaded: boolean;
	loading: boolean;
}

/**
 * 产品规格书模板 store
 * 从后端 /api/design_order/product_spec_templates/ 拉取内置 + 自定义模板
 * 加载失败时由 schema/index.ts 降级到内置常量
 */
export const useProductSpecTemplateStore = defineStore('ProductSpecTemplate', {
	state: (): State => ({
		templates: {},
		loaded: false,
		loading: false,
	}),
	actions: {
		async load(force = false) {
			if (this.loaded && !force) return;
			if (this.loading) return;
			this.loading = true;
			try {
				const res: any = await request({
					url: '/api/design_order/product_spec_templates/',
					method: 'get',
				});
				if (res.code === 2000) {
					const map: Record<string, TemplateListItem> = {};
					for (const t of res.data || []) {
						map[t.templateType] = t;
					}
					this.templates = map;
					this.loaded = true;
				}
			} catch (e) {
				// 加载失败保持 loaded=false，调用方降级到内置常量
				console.warn('加载产品规格书模板失败，将使用内置默认模板', e);
			} finally {
				this.loading = false;
			}
		},
		async reload() {
			return this.load(true);
		},
		getSchema(tt?: string): TemplateSchema {
			const key = tt || 'main_image';
			return this.templates[key] || this.templates['main_image'];
		},
		listTypes(): { value: string; label: string; builtin: boolean }[] {
			return Object.values(this.templates).map((t) => ({
				value: t.templateType,
				label: t.label,
				builtin: t.builtin,
			}));
		},
	},
});
