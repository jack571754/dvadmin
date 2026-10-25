<template>
	<div class="area-trend-chart-card">
		<div class="chart-header">
			<div class="chart-header-left">
				<h3 class="chart-title">系统访问趋势</h3>
				<p class="chart-subtitle">系统用户登录人次与独立活跃账户聚合走势</p>
			</div>
			<div class="chart-range-selector">
				<button
					v-for="range in rangeOptions"
					:key="range.value"
					class="range-btn"
					:class="{ 'is-active': currentRange === range.value }"
					type="button"
					@click="changeRange(range.value)"
				>
					{{ range.label }}
				</button>
			</div>
		</div>

		<div class="chart-container" ref="chartRef" v-loading="loading" />
	</div>
</template>

<script setup lang="ts" name="AreaTrendChart">
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue';
import * as echarts from 'echarts';
import type { ECharts } from 'echarts';
import { useThemeConfig } from '/@/stores/themeConfig';
import { request } from '/@/utils/service';

const props = defineProps<{
	onDataLoaded?: (summary: { total_users: number; active_today: number; total_operations: number }) => void;
}>();

const themeStore = useThemeConfig();
const chartRef = ref<HTMLDivElement | null>(null);
let myChart: ECharts | null = null;
const loading = ref(false);
const currentRange = ref<number>(30);

const rangeOptions = [
	{ label: '近 7 天', value: 7 },
	{ label: '近 30 天', value: 30 },
	{ label: '近 90 天', value: 90 },
];

const fetchTrendData = async (days: number) => {
	loading.value = true;
	try {
		const res: any = await request({
			url: '/api/system/login_log/trend/',
			method: 'get',
			params: { days },
		});

		if (res?.data) {
			const { dates, total_counts, unique_counts, summary } = res.data;
			renderChart(dates, total_counts, unique_counts);
			if (summary && props.onDataLoaded) {
				props.onDataLoaded(summary);
			}
		}
	} catch (e) {
		console.warn('Failed to load login trend data:', e);
		// Fallback mock dates
		const dates = Array.from({ length: days }, (_, i) => {
			const d = new Date();
			d.setDate(d.getDate() - (days - 1 - i));
			return d.toISOString().slice(5, 10);
		});
		renderChart(dates, Array(days).fill(0), Array(days).fill(0));
	} finally {
		loading.value = false;
	}
};

const renderChart = (dates: string[], totalCounts: number[], uniqueCounts: number[]) => {
	if (!chartRef.value) return;

	if (!myChart) {
		myChart = echarts.init(chartRef.value);
	}

	const isDark = themeStore.themeConfig.isIsDark;
	const textColor = isDark ? '#a3a3a3' : '#737373';
	const gridLineColor = isDark ? '#262626' : '#f0f0f0';

	const option: echarts.EChartsOption = {
		tooltip: {
			trigger: 'axis',
			backgroundColor: isDark ? '#171717' : '#ffffff',
			borderColor: isDark ? '#262626' : '#e5e5e5',
			textStyle: {
				color: isDark ? '#ededed' : '#171717',
				fontSize: 12,
			},
			padding: [8, 12],
			axisPointer: {
				type: 'line',
				lineStyle: {
					color: isDark ? '#525252' : '#d4d4d4',
					type: 'dashed',
				},
			},
		},
		legend: {
			data: ['总登录人次', '独立活跃账户'],
			top: 0,
			right: 10,
			textStyle: {
				color: textColor,
				fontSize: 12,
			},
			itemWidth: 14,
			itemHeight: 8,
		},
		grid: {
			top: 36,
			left: 12,
			right: 16,
			bottom: 10,
			containLabel: true,
		},
		xAxis: {
			type: 'category',
			data: dates,
			boundaryGap: false,
			axisLine: {
				lineStyle: {
					color: gridLineColor,
				},
			},
			axisLabel: {
				color: textColor,
				fontSize: 11,
				formatter: (val: string) => (val.length > 5 ? val.slice(5) : val),
			},
			axisTick: {
				show: false,
			},
		},
		yAxis: {
			type: 'value',
			splitLine: {
				lineStyle: {
					color: gridLineColor,
					type: 'dashed',
				},
			},
			axisLabel: {
				color: textColor,
				fontSize: 11,
			},
		},
		series: [
			{
				name: '总登录人次',
				type: 'line',
				smooth: true,
				showSymbol: false,
				lineStyle: {
					width: 2.5,
					color: isDark ? '#fafafa' : '#171717',
				},
				itemStyle: {
					color: isDark ? '#fafafa' : '#171717',
				},
				areaStyle: {
					color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
						{
							offset: 0,
							color: isDark ? 'rgba(250, 250, 250, 0.22)' : 'rgba(23, 23, 23, 0.16)',
						},
						{
							offset: 1,
							color: isDark ? 'rgba(250, 250, 250, 0.01)' : 'rgba(23, 23, 23, 0.01)',
						},
					]),
				},
				data: totalCounts,
			},
			{
				name: '独立活跃账户',
				type: 'line',
				smooth: true,
				showSymbol: false,
				lineStyle: {
					width: 2,
					color: isDark ? '#a3a3a3' : '#737373',
					type: 'dotted',
				},
				itemStyle: {
					color: isDark ? '#a3a3a3' : '#737373',
				},
				data: uniqueCounts,
			},
		],
	};

	myChart.setOption(option);
};

const changeRange = (days: number) => {
	currentRange.value = days;
	fetchTrendData(days);
};

const handleResize = () => {
	myChart?.resize();
};

onMounted(() => {
	nextTick(() => {
		fetchTrendData(currentRange.value);
		window.addEventListener('resize', handleResize);
	});
});

onUnmounted(() => {
	window.removeEventListener('resize', handleResize);
	myChart?.dispose();
	myChart = null;
});

watch(
	() => themeStore.themeConfig.isIsDark,
	() => {
		myChart?.dispose();
		myChart = null;
		fetchTrendData(currentRange.value);
	}
);
</script>

<style scoped lang="scss">
.area-trend-chart-card {
	background: var(--admin-surface);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-lg, 10px);
	padding: 18px 20px 14px;
	box-shadow: var(--admin-shadow-xs);
	display: flex;
	flex-direction: column;
	gap: 12px;
}

.chart-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	flex-wrap: wrap;
	gap: 12px;
}

.chart-title {
	font-size: 15px;
	font-weight: 600;
	color: var(--admin-text);
	margin: 0;
	line-height: 1.2;
}

.chart-subtitle {
	font-size: 12px;
	color: var(--admin-muted);
	margin: 4px 0 0;
}

.chart-range-selector {
	display: inline-flex;
	align-items: center;
	background: var(--admin-surface-2);
	border: 1px solid var(--admin-border);
	border-radius: var(--admin-radius-sm, 6px);
	padding: 2px;
	gap: 2px;
}

.range-btn {
	border: none;
	background: transparent;
	padding: 4px 10px;
	font-size: 12px;
	font-weight: 500;
	color: var(--admin-muted);
	border-radius: var(--admin-radius-xs, 4px);
	cursor: pointer;
	transition: all 0.12s ease;

	&:hover {
		color: var(--admin-text);
	}

	&.is-active {
		background: var(--admin-surface);
		color: var(--admin-text);
		box-shadow: var(--admin-shadow-xs);
	}
}

.chart-container {
	width: 100%;
	height: 280px;
}
</style>
