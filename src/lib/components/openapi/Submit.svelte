<script module lang="ts">
	function makePath(path: string, params: [string, any][]) {
		const replaceIdx: [number, number, any][] = [];
		params.forEach(([name, value]) => {
			const idx = path.indexOf(`{${name}}`);
			if (idx === -1) return;
			if (replaceIdx.find((v) => v[0] === idx)) return;
			replaceIdx.push([idx, idx + name.length, value]);
		});
		replaceIdx.sort((a, b) => a[0] - b[0]);

		return replaceIdx.reduce(
			([path, offset], [start, end, value]) => {
				value = String(value);
				path = path.slice(0, offset + start) + value + path.slice(offset + end + 2);
				offset = offset - (end - start + 2) + value.length;
				return [path, offset] satisfies [string, number];
			},
			[path, 0] satisfies [string, number],
		)[0];
	}
	/** 生成请求信息 */
	function makeReq(
		href: string,
		op: OperationObject,
		values: any[],
		noValues: boolean[],
		path: string,
	) {
		const url = new URL(href);
		const params = ((op.parameters as ParameterObject[]) ?? []).map(
			(p, idx) =>
				[p.in, p.name, values[idx], noValues[idx]] satisfies [string, string, any, boolean],
		); //[in,name,value,noValue]

		url.pathname = makePath(
			path,
			params
				.filter(([type, _n, _v]) => type === 'path')
				.map(([_, name, value, noValue]) => [name, noValue ? '' : value]),
		);
		url.search = new URLSearchParams(
			params
				.filter(([type, _n, _v, noValue]) => type === 'query' && !noValue)
				.map(([_, name, value]) => [name, value]),
		).toString();
		url.hash = '';

		let headers: [string, string][] = params
			.filter(([type, _n, _v, noValue]) => type === 'header' && !noValue)
			.map(([_, name, value]) => [name, value]);
		const cookie = params
			.filter(([type, _n, _v, noValue]) => type === 'cookie' && !noValue)
			.map(([_, name, value]) => `${name}=${value}`)
			.join('; ');
		if (cookie) headers.push(['Cookie', cookie]);

		return { url: url.toString(), headers };
	}
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import type { OperationObject, ParameterLocation, ParameterObject } from 'openapi3-ts/oas30';
	import Button from '../Form/Button.svelte';
	import KeyDownUpListener from '../Global/KeyDownUpListener.svelte';
	let {
		values,
		noValues,
		invalid,
		path,
		method,
		color,
		op,
	}: {
		values: any[];
		noValues: boolean[];
		invalid: boolean[];
		path: string;
		method: string;
		color: any;
		op: OperationObject;
	} = $props();

	const { url, headers } = $derived(makeReq($page.url.href, op, values, noValues, path));

	let isShiftDown = $state(false);
</script>

<div class="flex flex-col gap-2">
	<div class="rounded-md border p-3 {color.border}">
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">请求信息</span>
			</div>

			<div class="flex flex-col gap-1 text-sm">
				<div class="flex items-center gap-2">
					<span class="font-medium {color.t}">{method}:</span>
					<span class="whitespace-pre-wrap break-all font-mono">{url}</span>
				</div>
				{#if headers.length}
					<span class="rounded-md border border-gray-200 p-2 font-mono dark:border-gray-800">
						<pre>{headers.map(([k, v]) => `${k}: ${v}`).join('\n')}</pre>
					</span>
				{/if}
			</div>
		</div>
	</div>
</div>
<div class="flex items-center gap-2">
	{#if op.parameters || op.requestBody}
		<Button color="secondary">填充必填参数</Button>
		<Button color="secondary">填充所有参数</Button>
	{/if}
	<Button color="secondary">生成代码</Button>
	<Button color="white" disabled={!isShiftDown && invalid.some((v) => v)}
		>&nbsp;发送请求&nbsp;</Button
	>
</div>
<KeyDownUpListener key="Shift" bind:down={isShiftDown} />
