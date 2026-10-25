<template>
	<div class="el-menu-horizontal-warp">
		<el-menu :default-active="defaultActive" router background-color="transparent" mode="horizontal">
			<template v-for="(val, index) in menuLists">
				<el-sub-menu :index="val.path" v-if="val.children && val.children.length > 0" :key="val.path">
					<template #title>
						<SvgIcon :name="val.meta?.icon" />
						<span>{{ val.meta?.title }}</span>
					</template>
					<SubItem :chil="val.children" />
				</el-sub-menu>
				<template v-else>
					<el-menu-item :index="val.path" :key="val.path" @click="onToRouteClick(val, index)">
						<template #title v-if="!val.meta?.isLink || (val.meta?.isLink && val.meta?.isIframe)">
							<SvgIcon :name="val.meta?.icon" />
							<span>{{ val.meta?.title }}</span>
						</template>
						<template #title v-else>
							<a class="w100" @click.prevent="onALinkClick(val)">
								<SvgIcon :name="val.meta?.icon" />
								{{ val.meta?.title }}
							</a>
						</template>
					</el-menu-item>
				</template>
			</template>
		</el-menu>
	</div>
</template>

<script setup lang="ts" name="navMenuHorizontal">
import { defineAsyncComponent, reactive, computed, onMounted, nextTick, onBeforeMount, ref, watch } from 'vue';
import { useRoute, onBeforeRouteUpdate, RouteRecordRaw, useRouter } from 'vue-router';
import { storeToRefs } from 'pinia';
import { useRoutesList } from '/@/stores/routesList';
import other from '/@/utils/other';

const router = useRouter();
// 引入组件
const SubItem = defineAsyncComponent(() => import('/@/layout/navMenu/subItem.vue'));
const state = reactive<AsideState>({
	menuList: [],
	clientWidth: 0,
});
// 定义父组件传过来的值
const props = defineProps({
	// 菜单列表
	menuList: {
		type: Array<RouteRecordRaw>,
		default: () => [],
	},
});

// 定义变量内容
const elMenuHorizontalScrollRef = ref();
const stores = useRoutesList();
const { routesList } = storeToRefs(stores);
const route = useRoute();
const defaultActive = ref('');
// 获取父级菜单数据
const menuLists = computed(() => {
	return <RouteItems>props.menuList;
});

// 初始化数据，页面刷新时，滚动条滚动到对应位置
const initElMenuOffsetLeft = () => {
	nextTick(() => {
		let els = <HTMLElement>document.querySelector('.el-menu.el-menu--horizontal li.is-active');
		if (!els) return false;
	});
};
// 路由过滤递归函数
const filterRoutesFun = <T extends RouteItem>(arr: T[]): T[] => {
	return arr
		.filter((item: T) => !item.meta?.isHide)
		.map((item: T) => {
			item = Object.assign({}, item);
			if (item.children) item.children = filterRoutesFun(item.children);
			return item;
		});
};
// 传送当前子级数据到菜单中
const setSendClassicChildren = (path: string) => {
	const currentPathSplit = path.split('/');
	let currentData: MittMenu = { children: [] };
	filterRoutesFun(routesList.value).map((v, k) => {
		if (v.path === `/${currentPathSplit[1]}`) {
			v['k'] = k;
			currentData['item'] = { ...v };
			currentData['children'] = [{ ...v }];
			if (v.children) currentData['children'] = v.children;
		}
	});
	return currentData;
};
// 设置页面当前路由高亮
const setCurrentRouterHighlight = (currentRoute: RouteToFrom) => {
	const { path, meta } = currentRoute;
	const pathSplit = meta?.isDynamic ? meta.isDynamicPath!.split('/') : path!.split('/');
	if (pathSplit.length >= 4 && meta?.isHide) defaultActive.value = pathSplit.splice(0, 3).join('/');
	else defaultActive.value = path;
};
// 打开外部链接
const onALinkClick = (val: RouteItem) => {
	other.handleOpenLink(val);
};
// 跳转页面
const onToRouteClick = (val: RouteItem, index: number) => {
	let children = val.children;
	if (children === undefined) {
		defaultActive.value = val.path;
		children = setSendClassicChildren(val.path).children;
	}
	if (children && children.length >= 1) {
		if (children[0].is_catalog) {
			onToRouteClick(children[0], index);
			return;
		}
		router.push(children[0].path);
	} else {
		router.push(val.path || '/home');
	}
};

// 页面加载前
onBeforeMount(() => {
	setCurrentRouterHighlight(route);
});
// 页面加载时
onMounted(() => {
	initElMenuOffsetLeft();
});
// 路由更新监听与高亮同步
onBeforeRouteUpdate((to) => {
	setCurrentRouterHighlight(to);
});
watch(
	() => route.path,
	() => {
		setCurrentRouterHighlight(route);
	}
);
</script>

<style scoped lang="scss">
.el-menu-horizontal-warp {
	flex: 1;
	min-width: 0;
	height: 100%;
	overflow: hidden;
	margin-right: 16px;

	:deep(.el-scrollbar__bar.is-vertical) {
		display: none;
	}
	:deep(a) {
		width: 100%;
	}
	.el-menu.el-menu--horizontal {
		display: flex;
		align-items: center;
		height: 48px;
		width: 100%;
		box-sizing: border-box;
		border-bottom: none;
	}
}
</style>
