/**
 * mitt 事件类型定义
 *
 * 经典（classic）与分栏（columns）布局已移除，随之删掉了只服务于它们的
 * restoreDefault / setSendColumnsChildren / setSendClassicChildren 三个事件。
 *
 * @method openSetingsDrawer 打开布局设置弹窗
 * @method getBreadcrumbIndexSetFilterRoutes 布局设置弹窗，开启切割菜单时，菜单数据传入到 navMenu 下的菜单中
 * @method layoutMobileResize 浏览器窗口改变时，用于适配移动端界面显示
 * @method openOrCloseSortable 布局设置弹窗，开启 TagsView 拖拽
 * @method openShareTagsView 布局设置弹窗，开启 TagsView 共用
 * @method onTagsViewRefreshRouterView tagsview 刷新界面
 * @method onCurrentContextmenuClick tagsview 右键菜单每项点击时
 */
declare type MittType<T = any> = {
	openSetingsDrawer?: string;
	getBreadcrumbIndexSetFilterRoutes?: string;
	layoutMobileResize: T;
	openOrCloseSortable?: string;
	openShareTagsView?: string;
	onTagsViewRefreshRouterView?: T;
	onCurrentContextmenuClick?: T;
};

// mitt 参数类型定义
declare type LayoutMobileResize = {
	// 经典（classic）与分栏（columns）布局已移除
	layout: 'defaults' | 'transverse';
	clientWidth: number;
};

// mitt 参数菜单类型
declare type MittMenu = {
	children: RouteRecordRaw[];
	item?: RouteItem;
};
