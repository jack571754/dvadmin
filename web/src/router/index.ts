import {createRouter, createWebHashHistory, type RouteLocationNormalized} from 'vue-router';
import NProgress from 'nprogress';
import 'nprogress/nprogress.css';
import pinia from '/@/stores/index';
import {storeToRefs} from 'pinia';
import {useKeepALiveNames} from '/@/stores/keepAliveNames';
import {useThemeConfig} from '/@/stores/themeConfig';
import {Session} from '/@/utils/storage';
import {dynamicRoutes, notFoundAndNoPower, staticRoutes} from '/@/router/route';
import {initFrontEndControlRoutes} from '/@/router/frontEnd';
import {initBackEndControlRoutes, resetSessionRoutes} from '/@/router/backEnd';
import {useFrontendMenuStore} from "/@/stores/frontendMenu";
import {useTagsViewRoutes} from "/@/stores/tagsViewRoutes";
import {toRaw} from "vue";
import {checkVersion} from "/@/utils/upgrade";
import { NextLoading } from '/@/utils/loading';
import { onSessionChanged, sessionRevision, sessionViewReady } from '../shared/access/sessionEvents';
import { startupState } from '../shared/access/startup';
import websocket from '/@/utils/websocket';
import { messageCenterStore } from '/@/stores/messageCenter';

/**
 * 1、前端控制路由时：isRequestRoutes 为 false，需要写 roles，需要走 setFilterRoute 方法。
 * 2、后端控制路由时：isRequestRoutes 为 true，不需要写 roles，不需要走 setFilterRoute 方法），
 * 相关方法已拆解到对应的 `backEnd.ts` 与 `frontEnd.ts`（他们互不影响，不需要同时改 2 个文件）。
 * 特别说明：
 * 1、前端控制：路由菜单由前端去写（无菜单管理界面，有角色管理界面），角色管理中有 roles 属性，需返回到 userInfo 中。
 * 2、后端控制：路由菜单由后端返回（有菜单管理界面、有角色管理界面）
 */

// 读取 `/src/stores/themeConfig.ts` 是否开启后端控制路由配置
const storesThemeConfig = useThemeConfig(pinia);
const {themeConfig} = storeToRefs(storesThemeConfig);
const {isRequestRoutes} = themeConfig.value;
import {useUserInfo} from "/@/stores/userInfo";
const { userInfos } = storeToRefs(useUserInfo());

/**
 * 创建一个可以被 Vue 应用程序使用的路由实例
 * @method createRouter(options: RouterOptions): Router
 * @link 参考：https://next.router.vuejs.org/zh/api/#createrouter
 */
export const router = createRouter({
    history: createWebHashHistory(),
    /**
     * 说明：
     * 1、notFoundAndNoPower 默认添加 404、401 界面，防止一直提示 No match found for location with path 'xxx'
     * 2、backEnd.ts(后端控制路由)、frontEnd.ts(前端控制路由) 中也需要加 notFoundAndNoPower 404、401 界面。
     *    防止 404、401 不在 layout 布局中，不设置的话，404、401 界面将全屏显示
     */
    routes: [...notFoundAndNoPower, ...staticRoutes]
});

onSessionChanged(() => {
    const revision = sessionRevision.value;
    resetSessionRoutes();
    startupState.reset();
    messageCenterStore(pinia).$reset();
    websocket.close();
    NextLoading.done();
    // Wait for a login callback to set its password state before navigating.
    queueMicrotask(() => {
        if (revision !== sessionRevision.value) return;
        const current = router.currentRoute.value;
        if (current.path === '/login' || current.matched.length === 0) return;
        const target = Session.get('token')
            ? { path: current.path, query: current.query, hash: current.hash, force: true }
            : { path: '/login', force: true };
        void router.replace(target).catch(() => {});
    });
});

/**
 * 路由多级嵌套数组处理成一维数组
 * @param arr 传入路由菜单数据数组
 * @returns 返回处理后的一维路由菜单数组
 */
export function formatFlatteningRoutes(arr: any) {
    if (arr.length <= 0) return false;
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].children) {
            arr = arr.slice(0, i + 1).concat(arr[i].children, arr.slice(i + 1));
        }
    }
    return arr;
}

/**
 * 一维数组处理成多级嵌套数组（只保留二级：也就是二级以上全部处理成只有二级，keep-alive 支持二级缓存）
 * @description isKeepAlive 处理 `name` 值，进行缓存。顶级关闭，全部不缓存
 * @link 参考：https://v3.cn.vuejs.org/api/built-in-components.html#keep-alive
 * @param arr 处理后的一维路由菜单数组
 * @returns 返回将一维数组重新处理成 `定义动态路由（dynamicRoutes）` 的格式
 */
export function formatTwoStageRoutes(arr: any) {
    if (arr.length <= 0) return false;
    const newArr: any = [];
    const cacheList: Array<string> = [];
    arr.forEach((v: any) => {
        if (v.path === '/') {
            newArr.push({component: v.component,name: v.name,path: v.path,redirect: v.redirect,meta: v.meta,children: []});
        } else {
            // 判断是否是动态路由（xx/:id/:name），用于 tagsView 等中使用
            // 修复：https://gitee.com/lyt-top/vue-next-admin/issues/I3YX6G
            if (v.path.indexOf('/:') > -1) {
                v.meta['isDynamic'] = true;
                v.meta['isDynamicPath'] = v.path;
            }
            newArr[0].children.push({...v});
            // 存 name 值，keep-alive 中 include 使用，实现路由的缓存
            // 路径：/@/layout/routerView/parent.vue
            if (newArr[0].meta.isKeepAlive && v.meta.isKeepAlive && v.component_name != "") {
                cacheList.push(v.name);
                const stores = useKeepALiveNames(pinia);
                stores.setCacheKeepAlive(cacheList);
            }
        }
    });
    return newArr;
}

const frameOutRoutes = staticRoutes.map(item => item.path)

const checkToken = ()=>{
    const urlParams = new URLSearchParams(window.location.search);
    const _oauth2_token = urlParams.get('_oauth2_token');
    if (_oauth2_token) {
        Session.set('token', _oauth2_token);
        const cleanUrl = new URL(window.location.href);
        cleanUrl.searchParams.delete('_oauth2_token');
        window.history.replaceState({}, '', cleanUrl.pathname + cleanUrl.search + cleanUrl.hash);

    }
}
/** Retry the same deep link instead of stacking new navigations on the failed attempt. */
function retrySessionStartup(to: RouteLocationNormalized) {
    void router.replace({ path: to.path, query: to.query, hash: to.hash, force: true }).catch(() => {});
}

// 路由加载前
router.beforeEach(async (to, from, next) => {
    // 异步非阻塞执行版本检查，避免在每次页面导航时等待网络 RTT
    void checkVersion();
    checkToken();
    NProgress.configure({showSpinner: false});
    if (to.meta.title) NProgress.start();
    const token = Session.get('token');
    const whitelist = ['/login'];
    if (whitelist.includes(to.path) && !token) {
        next();
        NProgress.done();
    } else {
        if (!token) {
            next(`/login?redirect=${to.path}&params=${JSON.stringify(to.query ? to.query : to.params)}`);
            Session.clear();
            NProgress.done();
        }else if (token && to.path === '/login' && userInfos.value.pwd_change_count===0 ) {
            next();
            NProgress.done();
        } else if (token && to.path === '/login' && userInfos.value.pwd_change_count>0) {
            next('/home');
            NProgress.done();
        }else if(token &&  frameOutRoutes.includes(to.path) ){
            next()
        } else {
            if (!sessionViewReady.value) {
                const attempt = startupState.begin();
                try {
                    if (isRequestRoutes) {
                        // 后端控制路由：路由数据初始化，防止刷新时丢失
                        await initBackEndControlRoutes();
                        // 解决刷新时，一直跳 404 页面问题，关联问题 No match found for location with path 'xxx'
                        // to.query 防止页面刷新时，普通路由带参数时，参数丢失。动态路由（xxx/:id/:name"）isDynamic 无需处理

                        startupState.ready(attempt);
                        next({ path: to.path, query: to.query });
                    } else {
                        // https://gitee.com/lyt-top/vue-next-admin/issues/I5F1HP
                        await initFrontEndControlRoutes();
                        startupState.ready(attempt);
                        next({ path: to.path, query: to.query });
                    }
                } catch (error) {
                    // Keep the current page usable and expose a retry panel instead of a blank shell.
                    // Menus and permissions stay closed because sessionViewReady remains false.
                    startupState.fail(attempt, error, () => retrySessionStartup(to));
                    next(false);
                    NProgress.done();
                    NextLoading.done();
                }
            } else {
                next();
            }
        }
    }
});

// 路由加载后
router.afterEach(() => {
    NProgress.done();
});

// 导出路由
export default router;
