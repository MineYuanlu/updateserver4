<script lang="ts">
	import { GridComponent, type GridComponentOption } from 'echarts/components';
	import { LineChart, type LineSeriesOption } from 'echarts/charts';
	import { UniversalTransition } from 'echarts/features';
	import { CanvasRenderer } from 'echarts/renderers';
	import { init, use, type ComposeOption, type ECharts } from 'echarts/core';
	import type { ECBasicOption } from 'echarts/types/dist/shared';
	import { browser } from '$app/environment';
	import { onDestroy } from 'svelte';

	let {
		this: dom = $bindable(undefined),
		chart = $bindable(undefined),
		option = $bindable(),
		SSR = $bindable(undefined),
		class: className,
		style,
		id,

		onInit,
	}: {
		this?: HTMLDivElement;
		chart?: ECharts;
		option: ECBasicOption;
		SSR?: boolean;
		class?: string;
		style?: string;
		id?: string;

		onInit?: (chart: ECharts) => void;
	} = $props();

	$effect(() => {
		if ((SSR || browser) && dom && (!chart || chart.isDisposed())) {
			chart = init(dom);
			onInit?.(chart);
		}
	});

	$effect(() => {
		if (chart && option) chart.setOption(option);
	});

	onDestroy(() => {
		if (chart) chart.dispose();
	});
</script>

<div bind:this={dom} class={className} {style} {id}></div>
