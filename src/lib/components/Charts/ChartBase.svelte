<script module lang="ts">
	import { SVGRenderer, CanvasRenderer } from 'echarts/renderers';
	import { use } from 'echarts/core';
	use([CanvasRenderer, SVGRenderer]);
</script>

<script lang="ts">
	import { init, type ECharts } from 'echarts/core';
	import type { ECBasicOption, EChartsInitOpts } from 'echarts/types/dist/shared';
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
		theme,
		svg,

		onInit,
	}: {
		this?: HTMLDivElement;
		chart?: ECharts;
		option: ECBasicOption;
		SSR?: boolean;
		class?: string;
		style?: string;
		id?: string;
		theme?: string | object | null;
		svg?: boolean;

		onInit?: (chart: ECharts) => void;
	} = $props();

	$effect(() => {
		if ((SSR || browser) && dom && (!chart || chart.isDisposed())) {
			const opts: EChartsInitOpts = {};
			if (svg !== undefined) opts.renderer = svg ? 'svg' : 'canvas';
			if (SSR !== undefined) opts.ssr = SSR;
			chart = init(dom, theme, opts);
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
