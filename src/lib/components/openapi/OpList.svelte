<script lang="ts">
	import type { OpenAPIObject, PathsObject, OperationObject } from 'openapi3-ts/oas30';
	import type { ApiParseCfg } from './utils';
	import { HttpMethods, toLowerHttpMethod, type HttpMethod } from '$lib/api/common';
	import { Icon } from '@steeze-ui/svelte-icon';
	import { ChevronDown } from '@steeze-ui/radix-icons';
	import { methodToColor, methodToShort } from './methods';
	let {
		data,
		cfg = {},
		display = $bindable(),
	}: {
		data: OpenAPIObject;
		cfg?: ApiParseCfg;
		display?: [string, HttpMethod];
	} = $props();

	type OpInfo = [OperationObject, string, HttpMethod];

	function getOpList(paths: PathsObject) {
		const tagsToOps: Record<string, OpInfo[]> = {};
		for (const path in paths) {
			const item = paths[path];
			for (const method of HttpMethods) {
				let op = item[toLowerHttpMethod(method)];
				if (!op) continue;
				op = {
					summary: item.summary,
					description: item.description,
					servers: item.servers,
					operationId: path,
					...op,
				};
				const tags = op.tags && op.tags.length > 0 ? op.tags : [''];
				tags.forEach((tag) => (tagsToOps[tag] ?? (tagsToOps[tag] = [])).push([op, path, method]));
			}
		}
		return Object.entries(tagsToOps);
	}
	if (!data) console.log('data', data);
	const opList = $derived(data ? getOpList(data.paths) : []);
	const opTagHide: Record<string, boolean> = $state({});
</script>

{#snippet opItem(op: OperationObject, path: string, method: HttpMethod)}
	{@const selected = display && display[0] === path && display[1] === method}
	<button
		id={op.operationId}
		class="relative flex h-[54px] w-full items-center overflow-hidden rounded border-b border-gray-200 p-3 text-justify no-underline"
		class:bg-gray-50={!selected}
		class:dark:bg-gray-800={!selected}
		class:text-blue-700={selected}
		class:bg-blue-100={selected}
		class:dark:text-blue-100={selected}
		class:dark:bg-blue-900={selected}
		onclick={() => {
			display = [path, method];
		}}
	>
		<div class="overflow-hidden px-2 no-underline">
			<div class="mb-1 truncate font-semibold">{op.operationId ?? path}</div>
			<div class="truncate text-xs">{op.summary}</div>
		</div>
		<div
			class="absolute right-0 top-0 flex h-full items-center font-mono text-xl uppercase {methodToColor[
				method
			].t}"
		>
			<div
				class="h-full w-4 bg-gradient-to-r from-gray-50/0 to-gray-50 dark:from-gray-800/0 dark:to-gray-800"
			></div>
			<div class="flex h-full items-center bg-gray-50 pr-4 dark:bg-gray-800">
				{methodToShort[method]}
			</div>
		</div>
	</button>
{/snippet}
{#snippet opTag(tag: string, ops: OpInfo[])}
	<button
		class="flex w-full items-center justify-between rounded-lg bg-blue-400 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:ring-blue-500 focus:ring-offset-blue-200 dark:bg-blue-600 dark:hover:bg-blue-800 dark:focus:ring-blue-700 dark:focus:ring-offset-blue-300"
		onclick={() => {
			console.log(opTagHide);
			opTagHide[tag] = !opTagHide[tag];
		}}
	>
		<span>{tag}</span>
		<span>
			<Icon
				src={ChevronDown}
				class="ml-1 h-4 w-4 transition-transform duration-300 {opTagHide[tag] ? 'rotate-90' : ''}"
			/>
		</span>
	</button>
	<div
		class="overflow-hidden transition-all duration-300"
		class:max-h-full={!opTagHide[tag]}
		class:max-h-0={opTagHide[tag]}
		class:mb-4={opTagHide[tag]}
	>
		{#each ops as [op, path, method]}
			{@render opItem(op, path, method)}
		{/each}
	</div>
{/snippet}

<div class="absolute left-0 top-0 h-full w-full overflow-y-auto">
	{#each opList as [tag, ops]}
		{@render opTag(tag, ops)}
	{/each}
</div>
