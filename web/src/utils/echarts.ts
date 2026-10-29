import * as echarts from 'echarts/core';
import { LineChart, BarChart, PieChart } from 'echarts/charts';
import {
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	DataZoomComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

// 注册必须的组件与图表
echarts.use([
	LineChart,
	BarChart,
	PieChart,
	TitleComponent,
	TooltipComponent,
	GridComponent,
	LegendComponent,
	DataZoomComponent,
	CanvasRenderer,
]);

export default echarts;
export const { init, graphic } = echarts;
export type { ECharts, EChartsOption } from 'echarts';

