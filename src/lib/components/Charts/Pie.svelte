<script module lang="ts">
	import { use, type ComposeOption } from 'echarts/core';
	import { TooltipComponent, LegendComponent } from 'echarts/components';
	import { PieChart } from 'echarts/charts';
	import { LabelLayout } from 'echarts/features';
	use([TooltipComponent, LegendComponent, PieChart, LabelLayout]);
</script>

<script lang="ts">
	import type { TooltipComponentOption, LegendComponentOption } from 'echarts/components';
	import type { PieSeriesOption } from 'echarts/charts';
	import ChartBase from './ChartBase.svelte';

	type EChartsOption = ComposeOption<
		TooltipComponentOption | LegendComponentOption | PieSeriesOption
	>;

	const option = $derived({
		tooltip: {
			trigger: 'item',
		},
		legend: {
			top: '5%',
			left: 'center',
		},
		series: [
			{
				name: 'Access From',
				type: 'pie',
				radius: ['40%', '70%'],
				avoidLabelOverlap: false,
				itemStyle: {
					borderRadius: 10,
					borderColor: '#fff',
					borderWidth: 2,
				},
				label: {
					show: false,
					position: 'center',
				},
				emphasis: {
					label: {
						show: true,
						fontSize: 40,
						fontWeight: 'bold',
					},
				},
				labelLine: {
					show: false,
				},
				data: [
					{ value: 1048, name: 'Search Engine' },
					{ value: 735, name: 'Direct' },
					{ value: 580, name: 'Email' },
					{ value: 484, name: 'Union Ads' },
					{ value: 300, name: 'Video Ads' },
				],
			},
		],
	} satisfies EChartsOption);
</script>

<ChartBase {option} class="h-96 w-full" />
