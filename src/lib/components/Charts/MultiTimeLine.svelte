<script module lang="ts">
	import {
		GridComponent,
		LegendComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
	} from 'echarts/components';
	import { use } from 'echarts/core';
	import { LineChart } from 'echarts/charts';
	use([
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		LineChart,
		UniversalTransition,
	]);
</script>

<script lang="ts">
	import ChartBase from './ChartBase.svelte';
	import type { GridComponentOption } from 'echarts/components';
	import type { LineSeriesOption } from 'echarts/charts';
	import type { ComposeOption, ECharts } from 'echarts/core';
	import type { LegendComponentOption, TitleOption } from 'echarts/types/dist/shared';
	import type { IAllCount } from '$lib/protos';
	import { UniversalTransition } from 'echarts/features';
	import { CountUnitInfo, legend, multiSeries } from './timeline';

	type EChartsOption = ComposeOption<GridComponentOption | LineSeriesOption>;

	let {
		datas,
		names = datas.map((_, i) => `Series ${i + 1}`),
		title,
	}: {
		datas: IAllCount[];
		names?: string[];
		title: string | TitleOption;
	} = $props();

	let displayIdx = $state(0);
	const baseUnit = $derived(datas?.[0]?.units);
	const info = $derived(new CountUnitInfo(baseUnit));
	const seriesData = $derived(
		multiSeries(
			datas.map((x) => x.data),
			info,
			displayIdx,
		),
	);

	const option: EChartsOption = $derived({
		title: typeof title === 'string' ? { text: title } : title,
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
		},
		legend: [
			{
				data: info.idx.map(legend),
				selected: Object.fromEntries(info.idx.map((x) => [legend(x), x === displayIdx])),
				icon: 'pin',
			} satisfies LegendComponentOption,
			{
				data: names,
				left: 0,
			},
		],

		xAxis: {
			type: 'category',
			data: seriesData.x,
			axisPointer: {
				type: 'shadow',
			},
		},
		yAxis: {
			type: 'value',
			name: '计数',
		},

		// 数据系列配置
		series: [
			...names.map(
				(name, i) =>
					({
						name,
						type: 'line',
						data: seriesData.y[i],
						smooth: true,
						showSymbol: false,
					}) satisfies LineSeriesOption,
			),
			...info.idx.map(
				(idx) =>
					({
						name: legend(idx),
						type: 'line',
						data: [],
						showSymbol: false,
					}) satisfies LineSeriesOption,
			),
		],
	});
	function onInit(chart: ECharts) {
		chart.on('legendselectchanged', (ev: any) => {
			const selected: Record<string, boolean> = ev.selected;
			for (const key in selected) {
				if (names.includes(key)) continue;
				const idx = info.legendToIdx[key];
				if (idx !== displayIdx && selected[key]) {
					displayIdx = idx;
					return;
				}
			}
		});
	}
</script>

<ChartBase {option} {onInit} class="h-96 w-full" svg />
