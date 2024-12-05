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

	const {
		series,
	}: {
		series: PieSeriesOption[] | PieSeriesOption;
	} = $props();
	const option = $derived({
		tooltip: {
			trigger: 'item',
		},
		legend: {
			top: '5%',
			left: 'center',
		},
		series,
	} satisfies EChartsOption);
</script>

<ChartBase {option} class="h-96 w-full" />
