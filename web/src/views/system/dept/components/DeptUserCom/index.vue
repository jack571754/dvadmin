<template>
	<div v-show="!showCount" class="dept-user-com-box dept-info">
		<div class="dept-info-header" @click="toggleInfoCollapse">
			<div class="header-left">
				<div class="dept-icon" :class="{ 'is-active': !isInfoCollapsed }">
					<el-icon :size="20">
						<OfficeBuilding />
					</el-icon>
				</div>
				<span class="collapse-text">{{ $t('message.pages.dept.user.deptDetail') }}</span>
			</div>
			<div class="collapse-icon" :class="{ 'is-active': !isInfoCollapsed }">
				<el-icon :size="16" class="arrow-icon">
					<ArrowRight />
				</el-icon>
			</div>
		</div>
		<transition name="collapse-transition">
			<div v-show="!isInfoCollapsed" class="dept-info-content">
				<div class="di-left">
					<h3>{{ deptInfo.dept_name || '' }}</h3>
					<div class="di-cell">
						<p>{{ $t('message.pages.dept.user.deptLeader') }}</p>
						<p class="content">{{ deptInfo.owner || $t('message.pages.dept.user.none') }}</p>
					</div>
					<div class="di-cell">
						<p>{{ $t('message.pages.dept.user.deptCount') }}</p>
						<p class="content">{{ deptInfo.dept_user || 0 }}{{ $t('message.pages.dept.user.peopleUnit') }}</p>
					</div>
					<div class="di-cell">
						<p>{{ $t('message.pages.dept.user.deptDesc') }}</p>
						<p class="content">{{ deptInfo.description || $t('message.pages.dept.user.none') }}</p>
					</div>
					<div class="di-cell">
						<p>{{ $t('message.pages.dept.user.showChild') }}</p>
						<el-switch
							v-model="isShowChildFlag"
							inline-prompt
							:active-text="$t('message.pages.dept.user.yes')"
							:inactive-text="$t('message.pages.dept.user.no')"
							:disabled="!currentDeptId"
							@click.stop
							@change="handleSwitchChange"
							style="--el-switch-on-color: var(--el-color-primary)"
						/>
					</div>
				</div>
				<div class="di-charts">
					<div style="height: 180px; width: 380px" ref="deptCountBar"></div>
					<div style="height: 180px; width: 200px" ref="deptSexPie"></div>
				</div>
			</div>
		</transition>
	</div>

	<fs-crud
		ref="crudRef"
		v-bind="crudBinding"
		:customClass="!showCount ? (isInfoCollapsed ? 'dept-user-com-box dept-user-com-table-collapsed' : 'dept-user-com-box dept-user-com-table') : 'dept-user-com-box dept-user-com-table-cover'"
	>
		<template #toolbar-left>
			<el-button :icon="!showCount ? 'Hide' : 'View'" circle @click="showCount = !showCount"></el-button>
		</template>
		<template #actionbar-right>
			<importExcel api="api/system/user/" v-auth="'user:Import'">{{ $t('message.pages.dept.user.import') }} </importExcel>
		</template>
		<template #cell_avatar="scope">
			<div v-if="scope.row.avatar" style="display: flex; justify-content: center; align-items: center;">
				<el-image
					style="width: 25px; height: 25px; border-radius: 50%; aspect-ratio: 1 / 1"
					:src="getBaseURL(scope.row.avatar)"
					:preview-src-list="[getBaseURL(scope.row.avatar)]"
					:preview-teleported="true"
				/>
			</div>
		</template>
	</fs-crud>

	<el-dialog v-model="resetPwdVisible" :title="$t('message.pages.dept.user.resetPwd')" width="400px" draggable :before-close="handleResetPwdClose">
		<div>
			<el-input v-model="resetPwdFormState.newPassword" type="password" :placeholder="$t('message.pages.dept.user.pwdPlaceholder')" show-password style="margin-bottom: 20px" />
			<el-input v-model="resetPwdFormState.newPassword2" type="password" :placeholder="$t('message.pages.dept.user.pwdAgainPlaceholder')" show-password />
		</div>
		<template #footer>
			<span class="dialog-footer">
				<el-button @click="handleResetPwdClose">{{ $t('message.pages.dept.buttons.cancel') }}</el-button>
				<el-button type="primary" @click="handleResetPwdSubmit">{{ $t('message.pages.dept.buttons.save') }}</el-button>
			</span>
		</template>
	</el-dialog>
</template>

<script lang="ts" setup name="user">
import { ref, reactive, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useExpose, useCrud } from '@fast-crud/fast-crud';
import { useThemeConfig } from '/@/stores/themeConfig';
import { storeToRefs } from 'pinia';
import { Md5 } from 'ts-md5';
import { createCrudOptions } from './crud';
import importExcel from '/@/components/importExcel/index.vue';
import * as echarts from 'echarts';
import { ECharts, EChartsOption, init } from 'echarts';
import { getDeptInfoById, resetPwd } from './api';
import { warningNotification, successNotification } from '/@/utils/message';
import { HeadDeptInfoType } from '../../types';
import {getBaseURL} from '/@/utils/baseUrl';
import { ArrowUp, ArrowDown, ArrowRight, OfficeBuilding } from '@element-plus/icons-vue';

const { themeConfig } = storeToRefs(useThemeConfig());

const { t } = useI18n();

let deptCountChart: ECharts;
let deptSexChart: ECharts;

// crud组件的ref
const crudRef = ref();
// crud 配置的ref
const crudBinding = ref();
// 暴露的方法
const { crudExpose } = useExpose({ crudRef, crudBinding });

let currentDeptId = ref('');
let deptCountBar = ref();
let deptSexPie = ref();
let isShowChildFlag = ref(false);
let deptInfo = ref<Partial<HeadDeptInfoType>>({});
let showCount = ref(false);
let isInfoCollapsed = ref(false); // 控制信息区域折叠状态

let resetPwdVisible = ref(false);
let resetPwdFormState = reactive({
	id: 0,
	newPassword: '',
	newPassword2: '',
});

/**
 * 初始化顶部部门折线图
 */
const initDeptCountBarChart = () => {
	const xAxisData = deptInfo.value.sub_dept_map?.map((item) => item.name) || [];
	const yAxisData = deptInfo.value.sub_dept_map?.map((item) => item.count) || [];

	const option: EChartsOption = {
		tooltip: {
			trigger: 'axis',
			axisPointer: {
				type: 'shadow',
			},
		},
		xAxis: {
			type: 'category',
			data: xAxisData,
			axisTick: {
				alignWithLabel: true,
			},
		},
		yAxis: {
			type: 'value',
		},
		dataZoom: [
			{
				type: 'inside',
			},
		],
		grid: {
			top: '6%',
			right: '5%',
			bottom: '10%',
			left: '10%',
		},
		series: [
			{
				data: yAxisData,
				type: 'bar',
				barWidth: '60%',
				showBackground: true,
				itemStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{ offset: 0, color: '#83bff6' },
						{ offset: 0.5, color: '#188df0' },
						{ offset: 1, color: '#188df0' },
					]),
				},
			},
		],
	};

	deptCountChart.setOption(option);
};

/**
 * 初始化顶部性别统计
 */
const initDeptSexPieChart = () => {
	const option: EChartsOption = {
		tooltip: {
			trigger: 'item',
		},
		legend: {
			orient: 'vertical',
			right: '0%',
			left: '65%',
			top: 'center',
			itemWidth: 12,
			itemHeight: 12,
		},
		series: [
			{
				type: 'pie',
				radius: '65%',
				center: ['32%', '50%'],
				label: {
					show: false,
					position: 'center',
				},
				color: ['#188df0', '#f56c6c', '#dcdfe6'],
				data: [
					{ value: deptInfo.value.gender?.male || 0, name: t('message.pages.dept.user.male') },
					{ value: deptInfo.value.gender?.female || 0, name: t('message.pages.dept.user.female') },
					{ value: deptInfo.value.gender?.unknown || 0, name: t('message.pages.dept.user.unknown') },
				],
			},
		],
	};
	deptSexChart.setOption(option);
};

/**
 * 获取顶部部门信息
 */
const getDeptInfo = async () => {
	const res = await getDeptInfoById(currentDeptId.value, isShowChildFlag.value ? '1' : '0');
	if (res?.code === 2000) {
		deptInfo.value = res.data;
		initDeptCountBarChart();
		initDeptSexPieChart();
	}
};

/**
 * 部门切换刷新用户列表
 */
const handleDoRefreshUser = (id: string) => {
	currentDeptId.value = id;
	crudExpose.doSearch({ form: { dept: id } });
	getDeptInfo();
};

const handleSwitchChange = () => {
	handleDoRefreshUser(currentDeptId.value);
};

// 切换信息区域折叠状态
const toggleInfoCollapse = () => {
	isInfoCollapsed.value = !isInfoCollapsed.value;
};

const handleResetPwdOpen = ({ id }: { id: number }) => {
	resetPwdFormState.id = id;
	resetPwdVisible.value = true;
};
const handleResetPwdClose = () => {
	resetPwdVisible.value = false;
	resetPwdFormState.id = 0;
	resetPwdFormState.newPassword = '';
	resetPwdFormState.newPassword2 = '';
};
const handleResetPwdSubmit = async () => {
	if (!resetPwdFormState.id) {
		warningNotification(t('message.pages.dept.user.selectUser'));
		return;
	}
	if (!resetPwdFormState.newPassword || !resetPwdFormState.newPassword2) {
		warningNotification(t('message.pages.dept.user.inputPwd'));
		return;
	}
	if (resetPwdFormState.newPassword !== resetPwdFormState.newPassword2) {
		warningNotification(t('message.pages.dept.user.pwdMismatch'));
		return;
	}
	const pwdRegex = new RegExp('(?=.*[0-9])(?=.*[a-zA-Z]).{8,30}');
	if (!pwdRegex.test(resetPwdFormState.newPassword) || !pwdRegex.test(resetPwdFormState.newPassword2)) {
		warningNotification(t('message.pages.dept.user.pwdComplexity'));
		return;
	}
	const res = await resetPwd(resetPwdFormState.id, {
		newPassword: Md5.hashStr(resetPwdFormState.newPassword),
		newPassword2: Md5.hashStr(resetPwdFormState.newPassword2),
	});

	if (res?.code === 2000) {
		successNotification(t('message.pages.dept.user.changeSuccess'));
		handleResetPwdClose();
	}
};

onMounted(() => {
	deptCountChart = init(deptCountBar.value as HTMLElement);
	deptSexChart = init(deptSexPie.value as HTMLElement);
	getDeptInfo();
  crudExpose.doRefresh();
});

defineExpose({
	handleDoRefreshUser,
});

// 你的crud配置
const { crudOptions } = createCrudOptions({ crudExpose, context: { getDeptInfo, isShowChildFlag, handleResetPwdOpen } });

// 初始化crud配置
const { resetCrudOptions } = useCrud({
	crudExpose,
	crudOptions,
	context: {},
});

// 语言切换时重新构建 crud options 和图表
watch(
	() => themeConfig.value.globalI18n,
	async () => {
		resetCrudOptions();
		// 重新获取部门信息以更新图表
		if (currentDeptId.value) {
			await getDeptInfo();
		}
	}
);
</script>

<style lang="scss" scoped>
.dept-user-com-box {
	padding: 0 10px;
	border-radius: 8px 0 0 8px;
	box-sizing: border-box;
	color: var(--next-bg-topBarColor);
	background-color: var(--el-fill-color-blank);
}

// 部门详情展开时,表格高度减去详情区域的高度
.dept-user-com-table {
	height: calc(100% - 260px);
}

// 部门详情折叠时,表格高度只需要减去header的高度
.dept-user-com-table-collapsed {
	height: calc(100% - 70px);
}

// 隐藏部门详情时,表格占满全部高度
.dept-user-com-table-cover {
	height: 100%;
}
.dept-info {
	width: 100%;
	height: auto;
	min-height: 40px;
	margin-bottom: 10px;

	.dept-info-header {
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 10px 15px;
		cursor: pointer;
		user-select: none;
		border-radius: 8px;
		background-color: var(--el-fill-color-blank);

		.header-left {
			display: flex;
			align-items: center;
			gap: 10px;
			flex: 1;

			.dept-icon {
				display: flex;
				align-items: center;
				justify-content: center;
				color: var(--el-color-primary);
				transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
				transform: rotate(0deg);

				.el-icon {
					transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
				}
			}

			.dept-icon.is-active {
				transform: rotate(360deg);
			}

			.collapse-text {
				font-size: 14px;
				font-weight: 500;
				color: var(--el-text-color-primary);
			}
		}

		.collapse-icon {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 32px;
			height: 32px;
			border-radius: 50%;
			background-color: var(--el-fill-color-light);
			transition: background-color 0.3s ease;

			.arrow-icon {
				transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55);
				transform: rotate(0deg);
			}
		}

		.collapse-icon.is-active {
			.arrow-icon {
				transform: rotate(90deg);
			}
		}

		.collapse-icon:hover {
			background-color: var(--el-fill-color);
		}
	}

	.dept-info-content {
		padding: 15px;
		background-color: var(--el-fill-color-blank);
		border-radius: 8px;
		margin-top: 8px;
		display: flex;
		gap: 20px;

		.di-left {
			flex: 1;
			h3 {
				font-size: 18px;
				font-weight: 900;
				margin: 0 0 10px 0;
			}
			.di-cell {
				margin-top: 6px;
				display: flex;
				align-items: center;

				p:nth-child(1) {
					display: block;
					width: 85px;
					text-align: left;
				}
				.content {
					max-width: 120px;
					overflow: hidden;
					white-space: nowrap;
					text-overflow: ellipsis;
				}
			}
		}

		.di-charts {
			display: flex;
			gap: 20px;
		}
	}
}

// 折叠过渡动画
.collapse-transition-enter-active,
.collapse-transition-leave-active {
	transition: all 0.6s cubic-bezier(0.68, -0.55, 0.27, 1.55);
}

.collapse-transition-enter-from,
.collapse-transition-leave-to {
	opacity: 0;
	transform: translateY(-10px);
}
</style>
