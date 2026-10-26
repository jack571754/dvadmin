import { routeBootstrap } from './bootstrap';
import { captureSession, sessionViewReady } from '../shared/access/sessionEvents';
import { useKeepALiveNames } from '/@/stores/keepAliveNames';
import { useColumnPermission } from '/@/stores/columnPermission';
import { RouteRecordRaw } from 'vue-router';
import { storeToRefs } from 'pinia';
import pinia from '/@/stores/index';
import { useUserInfo } from '/@/stores/userInfo';
import { useRequestOldRoutes } from '/@/stores/requestOldRoutes';
import { Session } from '/@/utils/storage';
import { startOptionalStartupResources } from '../shared/access/startupResources';
import { NextLoading } from '/@/utils/loading';
import { dynamicRoutes, notFoundAndNoPower, staticRoutes } from '/@/router/route';
import { formatTwoStageRoutes, formatFlatteningRoutes, router } from '/@/router/index';
import { useRoutesList } from '/@/stores/routesList';
import { useTagsViewRoutes } from '/@/stores/tagsViewRoutes';
import {useThemeConfig} from "/@/stores/themeConfig";
import {useMenuApi} from "/@/api/menu/index";
import { handleMenu } from '../utils/menu';
import mittBus from '/@/utils/mitt';
import { BtnPermissionStore } from '/@/plugin/permission/store.permission';
import {SystemConfigStore} from "/@/stores/systemConfig";
import {useDeptInfoStore} from "/@/stores/modules/dept";
import {DictionaryStore} from "/@/stores/dictionary";
import {useFrontendMenuStore} from "/@/stores/frontendMenu";
import {toRaw} from "vue";
const menuApi = useMenuApi();

const layouModules: any = import.meta.glob('../layout/routerView/*.{vue,tsx}');
const viewsModules: any = import.meta.glob('../views/**/*.{vue,tsx}');
const greatDream: any = import.meta.glob('@great-dream/**/*.{vue,tsx}');

/**
 * 获取目录下的 .vue、.tsx 全部文件
 * @method import.meta.glob
 * @link 参考：https://cn.vitejs.dev/guide/features.html#json
 */
const dynamicViewsModules: Record<string, Function> = Object.assign({}, { ...layouModules }, { ...viewsModules }, { ...greatDream });

const PRODUCT_SPEC_ROUTE_NAME = 'productSpec';
const productSpecEditorRoute: RouteRecordRaw = {
	path: 'product_spec',
	name: PRODUCT_SPEC_ROUTE_NAME,
	component: () => import('/@/views/design_order/product_spec/index.vue'),
	meta: {
		title: '产品规格对比',
		isLink: '',
		isHide: true,
		isKeepAlive: false,
		isAffix: false,
		isIframe: false,
		roles: ['admin', 'operation'],
		icon: 'ele-Grid',
	},
};

export function ensureProductSpecEditorRoute() {
	if (router.hasRoute(PRODUCT_SPEC_ROUTE_NAME)) return;
	installedRoutes.push(router.addRoute('/', productSpecEditorRoute));
}

/**
 * 后端控制路由：初始化方法，防止刷新时路由丢失
 * @method NextLoading 界面 loading 动画开始执行
 * @method useUserInfo().setUserInfos() 触发初始化用户信息 pinia
 * @method useRequestOldRoutes().setRequestOldRoutes() 存储接口原始路由（未处理component），根据需求选择使用
 * @method setAddRoute 添加动态路由
 * @method setFilterMenuAndCacheTagsViewRoutes 设置路由到 vuex routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 */
export function initBackEndControlRoutes() {
    return routeBootstrap.ensure(async (assertCurrent) => {
        if (!window.nextLoading) NextLoading.start();
        await useUserInfo(pinia).getApiUserInfo();
        assertCurrent();
        const res = await getBackEndControlRoutes();
        assertCurrent();
        // Tag caches are valid only for the verified account, including after a reload.
        const account = String(useUserInfo(pinia).userInfos.id);
        if (Session.get('sessionAccountId') !== account) Session.remove('tagsViewList');
        Session.set('sessionAccountId', account);
        const { frameIn, frameOut } = handleMenu(res.data);
        dynamicRoutes[0].children = backEndComponent(frameIn);
        // Route publication is synchronous after the final session check.
        setAddRoute();
        ensureProductSpecEditorRoute();
        backEndComponent(frameOut).forEach((route: RouteRecordRaw) => {
            installedRoutes.push(router.addRoute(route));
        });
        setFilterMenuAndCacheTagsViewRoutes();
        sessionViewReady.value = true;
    });
}

const installedRoutes: Array<() => void> = [];

export function resetSessionRoutes() {
    sessionViewReady.value = false;
    routeBootstrap.reset();
    installedRoutes.splice(0).reverse().forEach(remove => remove());
    // Include routes installed by the retained frontend-control compatibility path.
    const publicNames = new Set([...staticRoutes, ...notFoundAndNoPower].map(route => route.name));
    router.getRoutes().forEach(route => {
        if (route.name && !publicNames.has(route.name)) router.removeRoute(route.name);
    });
    notFoundAndNoPower.forEach(route => {
        if (!router.hasRoute(route.name)) router.addRoute(route);
    });
    dynamicRoutes[0].children = [];
    useRoutesList(pinia).$reset();
    useTagsViewRoutes(pinia).$reset();
    useKeepALiveNames(pinia).$reset();
    useColumnPermission(pinia).$reset();
    useRequestOldRoutes(pinia).$reset();
    useFrontendMenuStore(pinia).$reset();
    useUserInfo(pinia).$reset();
    useDeptInfoStore(pinia).$reset();
    DictionaryStore(pinia).$reset();
    SystemConfigStore(pinia).$reset();
    ['userInfo', 'tagsViewList', 'sessionAccountId', 'isTagsViewCurrenFull',
        'BtnPermission', 'Dictionary', 'SystemConfig'].forEach(key => Session.remove(key));
}

export async function setRouters(){
	const assertCurrent = captureSession();
	const {frameInRoutes,frameOutRoutes} = await useFrontendMenuStore().getRouter()
	assertCurrent();
	const frameInRouter = toRaw(frameInRoutes)
	const frameOutRouter = toRaw(frameOutRoutes)
	dynamicRoutes[0].children = frameInRouter
	dynamicRoutes.forEach((item:any)=>{
		router.addRoute(item)
	})
	frameOutRouter.forEach((item:any)=>{
		router.addRoute(item)
	})
	const storesRoutesList = useRoutesList(pinia);
	storesRoutesList.setRoutesList([...dynamicRoutes[0].children,...frameOutRouter]);
	const storesTagsView = useTagsViewRoutes(pinia);
	storesTagsView.setTagsViewRoutes([...dynamicRoutes[0].children,...frameOutRouter])

}

/**
 * 语言切换时刷新路由菜单（重新获取菜单数据，更新 dynamicRoutes）
 */
export async function refreshRoutesForI18n() {
    const assertCurrent = captureSession();
	const { themeConfig } = storeToRefs(useThemeConfig(pinia));
	const res = await menuApi.getSystemMenu({ language: themeConfig.value.globalI18n });
	assertCurrent();
	const { frameIn, frameOut } = handleMenu(res.data);
	dynamicRoutes[0].children = backEndComponent(frameIn);
	const storesRoutesList = useRoutesList(pinia);
	storesRoutesList.setRoutesList([...(dynamicRoutes[0].children || []), ...frameOut]);
	// 更新标签栏路由
	setCacheTagsViewRoutes();
	// 通知侧边栏刷新菜单
	mittBus.emit('getBreadcrumbIndexSetFilterRoutes');
}

/**
 * 设置路由到 vuex routesList 中（已处理成多级嵌套路由）及缓存多级嵌套数组处理后的一维数组
 * @description 用于左侧菜单、横向菜单的显示
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setFilterMenuAndCacheTagsViewRoutes() {
	const storesRoutesList = useRoutesList(pinia);
	storesRoutesList.setRoutesList(dynamicRoutes[0].children as any);
	setCacheTagsViewRoutes();
}

/**
 * 缓存多级嵌套数组处理后的一维数组
 * @description 用于 tagsView、菜单搜索中：未过滤隐藏的(isHide)
 */
export function setCacheTagsViewRoutes() {
	const storesTagsView = useTagsViewRoutes(pinia);
	storesTagsView.setTagsViewRoutes(formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes))[0].children);
}

/**
 * 处理路由格式及添加捕获所有路由或 404 Not found 路由
 * @description 替换 dynamicRoutes（/@/router/route）第一个顶级 children 的路由
 * @returns 返回替换后的路由数组
 */
export function setFilterRouteEnd() {
	let filterRouteEnd: any = formatTwoStageRoutes(formatFlatteningRoutes(dynamicRoutes));
	// notFoundAndNoPower 防止 404、401 不在 layout 布局中，不设置的话，404、401 界面将全屏显示
	// 关联问题 No match found for location with path 'xxx'
	filterRouteEnd[0].children = [...filterRouteEnd[0].children, ...notFoundAndNoPower];
	return filterRouteEnd;
}

/**
 * 添加动态路由
 * @method router.addRoute
 * @description 此处循环为 dynamicRoutes（/@/router/route）第一个顶级 children 的路由一维数组，非多级嵌套
 * @link 参考：https://next.router.vuejs.org/zh/api/#addroute
 */
export function setAddRoute() {
	setFilterRouteEnd().forEach((route: RouteRecordRaw) => {
		installedRoutes.push(router.addRoute(route));
	});
}

/**
 * 请求后端路由菜单接口
 * @description isRequestRoutes 为 true，则开启后端控制路由
 * @returns 返回后端路由菜单数据
 */
export async function getBackEndControlRoutes() {
    const { themeConfig } = storeToRefs(useThemeConfig(pinia));
    // Auxiliary data enriches pages but must never hide the whole backend; failures are reported instead.
    const optional = startOptionalStartupResources([
        { name: 'systemConfig', load: () => SystemConfigStore(pinia).getSystemConfigs() },
        { name: 'departments', load: () => useDeptInfoStore(pinia).requestDeptInfo() },
        { name: 'dictionary', load: () => DictionaryStore(pinia).getSystemDictionarys() },
    ], (name, error) => console.warn(`[startup] optional resource "${name}" failed`, error));
    // Menus and permissions decide what may render, so these stay required and fail closed.
    const [menu] = await Promise.all([
        menuApi.getSystemMenu({ language: themeConfig.value.globalI18n }),
        BtnPermissionStore(pinia).getBtnPermissionStore(),
    ]);
    await optional;
    return menu;
}

/**
 * 重新请求后端路由菜单接口
 * @description 用于菜单管理界面刷新菜单（未进行测试）
 * @description 路径：/src/views/system/menu/component/addMenu.vue
 */
export function setBackEndControlRefreshRoutes() {
	return getBackEndControlRoutes();
}

/**
 * 后端路由 component 转换
 * @param routes 后端返回的路由表数组
 * @returns 返回处理成函数后的 component
 */
export function backEndComponent(routes: any) {
	if (!routes) return;
	return routes.map((item: any) => {
		if (item.component) item.component = dynamicImport(dynamicViewsModules, item.component as string);
		if(item.is_catalog){
			// 对目录的处理
			item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/parent')
		}
		if(item.is_link){
			// 对外链接的处理
			if(item.is_iframe){
				item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/iframes')
			}else {
				item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/link')
			}
		}else{
			if(item.is_iframe){
				// const iframeRoute:RouteRecordRaw = {
				// 	...item
				// }
				// router.addRoute(iframeRoute)
				item.meta.isLink = item.link_url
				// item.path = `${item.path}Link`
				// item.name = `${item.name}Link`
				// item.meta.isIframe = item.is_iframe
				// item.meta.isKeepAlive = false
				// item.meta.isIframeOpen = true
				item.component = dynamicImport(dynamicViewsModules, 'layout/routerView/link.vue')
			}
		}
		item.children && backEndComponent(item.children);
		return item;
	});
}

/**
 * 后端路由 component 转换函数
 * @param dynamicViewsModules 获取目录下的 .vue、.tsx 全部文件
 * @param component 当前要处理项 component
 * @returns 返回处理成函数后的 component
 */
export function dynamicImport(dynamicViewsModules: Record<string, Function>, component: string) {
	const keys = Object.keys(dynamicViewsModules);
	const matchKeys = keys.filter((key) => {
		const k = key.replace(/..\/views|../, '');
		const k0 = k.replace("ode_modules/@great-dream/", '')
		const k1 = k0.replace("/plugins", '')
		const newComponent = component.replace("plugins/", "")
		return k1.startsWith(`${newComponent}`) || k1.startsWith(`/${newComponent}`);
	});
	if (matchKeys?.length === 1) {
		const matchKey = matchKeys[0];
		return dynamicViewsModules[matchKey];
	}
	if (matchKeys?.length > 1) {
		return false;
	}
}
