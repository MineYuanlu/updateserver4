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
	import { use, type ComposeOption, type ECharts } from 'echarts/core';
	import ChartBase from './ChartBase.svelte';
	import type { IAllCount } from '$lib/protos';
	import * as m from '$lib/paraglide/messages';

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
		title,
	}: {
		data: IAllCount;
		title: string;
	} = $props();

	const legend = (unit: number) => {
		const unitStr = m[`counter__unit_${unit as 0}`];
		return m.component_charts_time_line__legend({ unit: unitStr() });
	};

	/** 各个时间单位 idx - scale*/
	const idxToScale = $derived(Object.fromEntries(data.units!.map((x) => [x.u, x.scale])));
	const idx = $derived(data.units!.map((x) => x.u!));
	const legendToIdx = $derived(Object.fromEntries(idx.map((x) => [legend(x), x])));
	let displayIdx = $state(0);
	const scale = $derived(data.units![displayIdx]!.scale);

	const seriesData = $derived.by(() => {
		const add: Map<number, number> = new Map<number, number>();
		debugger;
		data.data!.forEach((d) => {
			if (d.u === -1) return;
			if (d.u === displayIdx) {
				add.set(d.t!, (add.get(d.t!) || 0) + d.c!);
			} else if (d.u! < displayIdx) {
				// 在大范围低精度的统计上补全最后一个point的计数
				const point = (d.t! * (idxToScale[d.u!] / idxToScale[displayIdx])) | 0;
				add.set(point, (add.get(point) || 0) + d.c!);
			}
		});
		const arr = Array.from(add).sort((a, b) => a[0] - b[0]);
		const x = arr.map(([point, _]) => new Date(point * scale!).toLocaleString());
		const y = arr.map(([_, count]) => count);
		return [x, y];
	});

	const option: EChartsOption = $derived({
		title: { text: title },
		tooltip: {
			trigger: 'axis',
			axisPointer: { type: 'cross' },
		},
		legend: {
			data: idx.map(legend),
			selected: Object.fromEntries(idx.map((x) => [legend(x), x === displayIdx])),
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
		series: idx.map((x) => ({
			name: legend(x),
			type: 'line',
			data: x === displayIdx ? seriesData?.[1] : [],
			smooth: true,
			showSymbol: false,
		})),
	});
	function onInit(chart: ECharts) {
		chart.on('legendselectchanged', (ev: any) => {
			const selected: Record<string, boolean> = ev.selected;
			for (const key in selected) {
				const idx = legendToIdx[key];
				if (idx !== displayIdx && selected[key]) {
					displayIdx = idx;
					break;
				}
			}
		});
	}
</script>

<ChartBase {option} {onInit} class="h-96 w-full" />
