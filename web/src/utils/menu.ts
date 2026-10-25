import XEUtils from "xe-utils"
import {dynamicRoutes, staticRoutes} from "/@/router/route";
import { useThemeConfig } from "/@/stores/themeConfig";
import pinia from "/@/stores/index";
import { storeToRefs } from "pinia";

/**
 * @description: 处理后端菜单数据格式
 * @param {Array} menuData
 * @return {*}
 */
export const handleMenu = (menuData: Array<any>) => {
    // 先处理menu meta数据转换
    const handleMeta = (item: any) => {
        item.meta = {
            title: item.title,
            isLink: item.link_url,
            isHide: !item.visible,
            isKeepAlive: item.cache,
            isAffix: item.is_affix,
            isIframe: item.is_iframe,
            roles: ['admin'],
            icon: item.icon
        }
        item.name = item.component_name
        item.path = item.web_path
        return item
    }

    // 处理框架外的路由
    const handleFrame = (item: any) => {
        if (item.is_iframe) {
            item.meta = {
                title: item.title,
                isLink: item.link_url,
                isHide: !item.visible,
                isKeepAlive: item.cache,
                isAffix: item.is_affix,
                isIframe: item.is_iframe,
                roles: ['admin'],
                icon: item.icon
            }
            item.name = item.component_name
            item.path = item.web_path
        }
        return item
    }

    // 框架内路由
    const defaultRoutes:Array<any> = []
    // 框架外路由
    const iframeRoutes:Array<any> = []

    menuData.forEach((val) => {
        // if (val.is_iframe) {
        //     // iframeRoutes.push(handleFrame(val))
        // } else {
        //     defaultRoutes.push(handleMeta(val))
        // }
        defaultRoutes.push(handleMeta(val))
    })
    const data = XEUtils.toArrayTree(defaultRoutes, {
        parentKey: 'parent',
        strict: true,
    })
    
    // 根据当前语言设置首页标题
    const { themeConfig } = storeToRefs(useThemeConfig(pinia));
    const currentLanguage = themeConfig.value.globalI18n;
    let homeTitle = '首页';
    if (currentLanguage === 'en') {
        homeTitle = 'Home';
    } else if (currentLanguage === 'zh-tw') {
        homeTitle = '首頁';
    }
    
    const dynamicRoutes = [
        {
            path: '/home', name: 'home', component: '/system/home/index', meta: {
                title: homeTitle,
                isLink: '',
                isHide: false,
                isKeepAlive: true,
                isAffix: true,
                isIframe: false,
                roles: ['admin'],
                icon: 'iconfont icon-shouye'
            }
        },
        ...data
    ]
    return {frameIn:dynamicRoutes,frameOut:iframeRoutes}
}
