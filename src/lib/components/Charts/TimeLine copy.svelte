<script lang="ts">
	import { GridComponent, type GridComponentOption } from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { init, use, type ComposeOption, type ECharts } from 'echarts/core';

	use([GridComponent, LineChart, CanvasRenderer, UniversalTransition]);

	type EChartsOption = ComposeOption<GridComponentOption | LineSeriesOption>;

	var chartDom: HTMLDivElement | undefined = undefined;
	var myChart: ECharts | undefined = undefined;
	function init1(chartDom: HTMLDivElement) {
		const myChart = init(chartDom);
		var option: EChartsOption;

		option = {
			xAxis: {
				type: 'category',
				data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
			},
			yAxis: {
				type: 'value',
			},
			series: [
				{
					data: [820, 932, 901, 934, 1290, 1330, 1320],
					type: 'line',
					smooth: true,
				},
			],
		};

		option && myChart.setOption(option);
		return myChart;
	}
	$: myChart = myChart || (chartDom ? init1(chartDom) : undefined);
</script>

<div bind:this={chartDom} style="width: 600px;height:400px;"></div>
