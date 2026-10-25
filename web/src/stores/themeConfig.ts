import { defineStore } from 'pinia';
import { presetAppearance } from '../shared/access/themePresets';

/**
 * 布局配置
 * 修复：https://gitee.com/lyt-top/vue-next-admin/issues/I567R1，感谢@lanbao123
 * 2020.05.28 by lyt 优化。开发时配置不生效问题
 * 偏好在 App.vue 中迁移、恢复并实时保存；恢复默认只重置界面配置。
 */
export const useThemeConfig = defineStore('themeConfig', {
	state: (): ThemeConfigState => ({
		themeConfig: {
			// 是否开启布局配置抽屉
			isDrawer: false,

			/**
			 * 全局主题
			 */
			// 四套完整预设；默认使用已确认的深灰方案。
			...presetAppearance('carbon'),

			/**
			 * 界面设置
			 */
			// 是否开启菜单水平折叠效果
			isCollapse: false,
			// 是否开启菜单手风琴效果
			isUniqueOpened: true,
			// 是否开启固定 Header
			isFixedHeader: false,
			// 初始化变量，用于更新菜单 el-scrollbar 的高度，请勿删除
			isFixedHeaderChange: false,
			// 是否开启自动锁屏
			isLockScreen: false,
			// 开启自动锁屏倒计时(s/秒)
			lockScreenTime: 30,

			/**
			 * 界面显示
			 */
			// 是否开启侧边栏 Logo
			isShowLogo: true,
			// 初始化变量，用于 el-scrollbar 的高度更新，请勿删除
			isShowLogoChange: false,
			// 是否开启 Breadcrumb，强制经典、横向布局不显示
			isBreadcrumb: true,
			// 是否开启 Tagsview
			isTagsview: true,
			// 是否开启 Breadcrumb 图标
			isBreadcrumbIcon: true,
			// 是否开启 Tagsview 图标
			isTagsviewIcon: true,
			// 是否开启 TagsView 缓存
			isCacheTagsView: true,
			// 是否开启 TagsView 拖拽
			isSortableTagsView: true,
			// 是否开启 TagsView 共用
			isShareTagsView: false,
			// 是否开启 Footer 底部版权信息
			isFooter: true,
			// 是否开启灰色模式
			isGrayscale: false,
			// 是否开启色弱模式
			isInvert: false,
			// 是否开启水印
			isWartermark: false,
			// 水印文案
			wartermarkText: '',

			/**
			 * 其它设置
			 */
			// Tagsview 风格：可选值"<tags-style-one|tags-style-four|tags-style-five|tags-style-shadcn>"，默认 tags-style-shadcn
			// 定义的值与 `/src/layout/navBars/tagsView/tagsView.vue` 中的 class 同名
			tagsStyle: 'tags-style-shadcn',
			// 主页面切换动画：可选值"<fade|slide-right|slide-left|opacitys>"，默认 fade
			animation: 'fade',

			/**
			 * 布局切换
			 * 注意：为了演示，切换布局时，颜色会被还原成默认，代码位置：/@/layout/navBars/breadcrumb/setings.vue
			 * 中的 `initSetLayoutChange(设置布局切换，重置主题样式)` 方法
			 */
			// 布局切换：可选值"<defaults|transverse>"，默认 defaults
			layout: 'defaults',

			/**
			 * 后端控制路由
			 */
			// 是否开启后端控制路由
			isRequestRoutes: true,

			/**
			 * 全局网站标题 / 副标题
			 */
			// 网站主标题（菜单导航、浏览器当前网页标题）
			globalTitle: 'DVAdmin',
			// 网站副标题（登录页顶部文字）
			globalViceTitle: 'DVAdmin',
			// 网站副标题（登录页顶部文字）
			globalViceTitleMsg: '企业级快速开发平台',
			// 默认初始语言，可选值"<zh-cn|en|zh-tw>"，默认 zh-cn
			globalI18n: 'zh-cn',
			// 默认全局组件大小，可选值"<large|'default'|small>"，默认 'default'
			globalComponentSize: 'default',
		},
	}),
	actions: {
		setThemeConfig(data: ThemeConfigState) {
			this.themeConfig = data.themeConfig;
		},
	},
});
