<script lang="ts">
	import {
		GridComponent,
		LegendComponent,
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		type GridComponentOption,
	} from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { init, use, type ComposeOption, type ECharts } from 'echarts/core';
	import ChartBase from './ChartBase.svelte';
	import type { IAllCount } from '$lib/protos';

	use([
		TitleComponent,
		ToolboxComponent,
		TooltipComponent,
		GridComponent,
		LegendComponent,
		LineChart,
		CanvasRenderer,
		UniversalTransition,
	]);
	type EChartsOption = ComposeOption<GridComponentOption | LineSeriesOption>;

	let {
		data,
	}: {
		data: IAllCount;
	} = $props();

	const units = $derived(
		data?.units ? data.units.filter((x) => typeof x.u === 'number').map((x) => x.u as number) : [],
	);
	const legends = $derived(Object.fromEntries(units.map((x) => [`单位${x}`, x])));
	let displayUnit = $state(0);
	const scale = $derived(data?.units?.[displayUnit]?.scale ?? null);

	const seriesData = $derived.by(() => {
		const a = data.data?.filter?.((d) => d.u === displayUnit).sort((a, b) => a.t - b.t);
		const x = a?.map?.((v) => (v.t ?? 0) * (scale ?? 0)).map((x) => new Date(x).toLocaleString());
		const y = a?.map?.((v) => v.c ?? 0);
		return [x, y];
	});

	const option: EChartsOption = $derived({
		// 图表标题
		title: {
			text: '计数数据随时间变化',
		},

		// 提示框配置
		tooltip: {
			trigger: 'axis', // 触发方式：轴触发（即触发器为 x 轴）
			axisPointer: {
				type: 'cross', // 十字准星指示器
			},
		},

		// 图例配置
		legend: {
			data: units.map((x) => `单位${x}`),
			selected: Object.fromEntries(units.map((x) => [`单位${x}`, x === displayUnit])),
		},

		// x 轴配置
		xAxis: {
			type: 'category', // x 轴类型为类目轴
			data: seriesData?.[0], // 时间数据
			axisPointer: {
				type: 'shadow', // 提示框指示类型：阴影
			},
		},

		// y 轴配置
		yAxis: {
			type: 'value', // y 轴为数值型
			name: '计数',
		},

		// 数据系列配置
		series: units.map((x) => ({
			name: `单位${x}`,
			type: 'line',
			data: x === displayUnit ? seriesData?.[1] : [],
			smooth: true,
			showSymbol: false,
		})),
	});
	function onInit(chart: ECharts) {
		chart.on('legendselectchanged', (ev: any) => {
			const selected: Record<string, boolean> = ev.selected;
			for (const key in selected) {
				const unit = legends[key];
				if (unit !== displayUnit && selected[key]) {
					displayUnit = unit;
					break;
				}
			}
		});
	}
</script>

<ChartBase {option} {onInit} class="h-96 w-full" />
