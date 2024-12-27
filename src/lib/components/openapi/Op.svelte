<script lang="ts">
	import type { OpenAPIObject } from 'openapi3-ts/oas30';
	import { notRef, type ApiParseCfg } from './utils';
	import { toLowerHttpMethod, type HttpMethod } from '$lib/api/common';
	import { methodToColor } from './methods';
	import Schema from './Schemas/Schema.svelte';
	import { runeDesc, runeTypes, type RuneTypes } from './param_rune';
	import Rune from './Rune.svelte';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json } from '@codemirror/lang-json';
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

	const paramIns = $derived.by(() => {
		const ins = new Set<string>(); // 'query' | 'header' | 'path' | 'cookie' | 'body'
		if (op.parameters) op.parameters.filter(notRef).forEach((p) => ins.add(p.in));
		if (op.requestBody) ins.add('body');
		return ins as Set<RuneTypes>;
	});
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
					{#if op.parameters}
						{#each op.parameters as param}
							{#if notRef(param)}
								{#key param}
									<Schema {param} />
								{/key}
							{/if}
						{/each}
					{/if}
					{#if op.requestBody}{/if}
				</div>
			{/if}
			<div class="w-[1px] bg-gray-200 dark:bg-gray-700"></div>
			<div class="flex w-full flex-col gap-2">
				<!-- TODO: 发起请求 -->
				<button class="btn btn-primary">发起请求</button>
			</div>
		</div>
	</div>
</div>

<pre>
	{JSON.stringify(display, null, 2)}
</pre>
<!-- <pre>
	{JSON.stringify(op, null, 2)}
</pre> -->
<CodeMirror value={JSON.stringify(op, null, 2)} readonly lang={json()} />
