<script module lang="ts">
	const resizeArr = <T,>(v: T[], len: number, fill: T) => {
		if (v.length > len) {
			v.length = len;
		} else if (v.length < len) {
			v.length = len;
			v.fill(fill, v.length - len);
		}
		return v;
	};
</script>

<script lang="ts">
	import type { OpenAPIObject, ParameterObject, RequestBodyObject } from 'openapi3-ts/oas30';
	import { notRef, type ApiParseCfg } from './utils';
	import { toLowerHttpMethod, type HttpMethod } from '$lib/api/common';
	import { methodToColor } from './methods';
	import Schema from './Schemas/Schema.svelte';
	import { runeDesc, runeTypes, type RuneTypes } from './param_rune';
	import Rune from './Rune.svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';
	import Submit from './Submit.svelte';
	import { dev } from '$app/environment';
	import TxtBtn from './TxtBtn.svelte';
	let {
		data,
		cfg = {},
		display,
	}: {
		data: OpenAPIObject;
		cfg?: ApiParseCfg;
		display: [string, HttpMethod];
	} = $props();
	const [path, method] = $derived(display);

	const op = $derived(data.paths[path][toLowerHttpMethod(method)]!);
	const color = $derived(methodToColor[method]);

	/** 参数所在位置的集合 */
	const [paramIns, medias] = $derived.by(() => {
		const ins = new Set<string>(); // 'query' | 'header' | 'path' | 'cookie' | 'body'
		const ms = new Set<string>();
		if (op.parameters)
			op.parameters.filter(notRef).forEach((p) => {
				ins.add(p.in);
				if (p.content) Object.keys(p.content).forEach((m) => ms.add(m));
			});

		if (op.requestBody) {
			ins.add('body');
			const c = (op.requestBody as RequestBodyObject).content;
			if (c) Object.keys(c).forEach((m) => ms.add(m));
		}

		return [ins as Set<RuneTypes>, ms];
	});

	let media: string | undefined = $state(undefined);

	const values: any[] = $state([]); // 参数值
	const noValues: boolean[] = $state([]); // 是否未输入
	const invalid: boolean[] = $state([]); // 是否无效
	const doFastFills: (() => void)[] = $state([]); // 快速填充
	$effect(() => {
		// 修改数组长度对齐参数数量
		const len = (op.parameters?.length ?? 0) + (op.requestBody ? 1 : 0);
		resizeArr(values, len, undefined);
		resizeArr(noValues, len, false);
		resizeArr(invalid, len, false);
		resizeArr(doFastFills, len, () => {});
	});

	const params = $derived([
		...(op.parameters ?? []).filter(notRef),
		...(op.requestBody ? [{ name: 'Body', in: 'body', ...op.requestBody }] : []),
	] as (Omit<ParameterObject, 'in'> & { in: RuneTypes })[]);
</script>

<div class="flex flex-col gap-2 rounded-md border p-0 {color.border}">
	<div class="p-3 {color.bg}">
		<div>
			<span class="text-md mr-2 font-medium">{op.operationId}</span>
			<span class="text-sm">{op.summary}</span>
		</div>
		<div>
			<span class="mr-2 text-sm">{method}</span>
			<span class="text-sm">{path}</span>
		</div>
	</div>
	<div class="p-3">
		<h4 class="mb-2 text-sm font-medium {color.t}">接口描述</h4>
		<div class="text-sm">{op.description}</div>
		<hr class="my-3" />

		{#snippet paramT(type: RuneTypes)}
			{#if paramIns.has(type)}
				<Rune {type} />
				<span class="mr-2 text-sm">{runeDesc[type]}</span>
			{/if}
		{/snippet}

		<div class="flex flex-row gap-2">
			{#if op.parameters || op.requestBody}
				<div class="flex w-full flex-col gap-2">
					<h4 class="mb-2 text-sm font-medium">
						<span class="mr-2 {color.t}">请求参数</span>
						{#each runeTypes as type}{@render paramT(type)}{/each}
					</h4>
					{#if medias.size > 0}
						<div>
							<TxtBtn
								label="媒体类型"
								btn={Array.from(medias)}
								class="mb-2 block"
								bind:value={media}
							/>
						</div>
					{/if}
					{#if params.length && values.length >= params.length && noValues.length >= params.length && invalid.length >= params.length && doFastFills.length >= params.length}
						{#each params as param, idx}
							{#if notRef(param)}
								{#key param}
									<Schema
										{media}
										{param}
										bind:value={values[idx]}
										bind:noValue={noValues[idx]}
										setInvalid={(v) => (invalid[idx] = v)}
										bind:doFastFill={doFastFills[idx]}
									/>
								{/key}
							{/if}
						{/each}
					{/if}
				</div>
			{/if}
			<div class="w-[1px] bg-gray-200 dark:bg-gray-700"></div>
			<div class="flex w-full flex-col gap-2">
				<Submit
					{media}
					{op}
					{values}
					{noValues}
					{invalid}
					{path}
					{method}
					{color}
					doFastFill={() => {
						doFastFills.forEach((v) => v?.());
					}}
				/>
			</div>
		</div>
	</div>
</div>
{#if dev}
	<span class="text-blue-500">display:</span>
	<pre>
	{JSON.stringify(display, null, 2)}
</pre>
	<span class="text-blue-500">values:</span>
	<pre>{JSON.stringify(values)}</pre>
	<span class="text-blue-500">noValues:</span>
	<pre>{JSON.stringify(noValues)}</pre>
	<span class="text-blue-500">invalid:</span>
	<pre>{JSON.stringify(invalid)}</pre>
	<span class="text-blue-500">op:</span>
	<CodeMirror value={JSON.stringify(op, null, 2)} readonly lang={json()} />
{/if}
