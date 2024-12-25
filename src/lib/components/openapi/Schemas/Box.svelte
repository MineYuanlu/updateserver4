<script module lang="ts">
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
	import { type RuneTypes } from '../param_rune';
	import Rune from '../Rune.svelte';

	let {
		children,
		type,
		name,
		extra1,
		extra2,
		description,
		required = false,
		deprecated = false,
	}: {
		children: Snippet;
		type: RuneTypes;
		name: string;
		extra1: Snippet;
		extra2?: Snippet;
		description?: string;
		required?: boolean;
		deprecated?: boolean;
	} = $props();
</script>

<div class="mb-4 w-full">
	<div class="flex w-full items-center justify-between">
		<div>
			<Rune {type} />
			<span class="text-sm {deprecated ? 'text-gray-500 line-through dark:text-gray-400' : ''}"
				>{name}</span
			>
			{#if required}
				<span class="text-sm text-red-500 dark:text-red-400">*</span>
			{/if}
			{#if deprecated}
				<span class="ml-1 text-xs text-yellow-600 dark:text-yellow-500">(已弃用)</span>
			{/if}
		</div>

		{#if extra1}{@render extra1()}{/if}
	</div>

	<div class="mb-2 flex w-full max-w-full items-center justify-between">
		<div class="min-w-0 flex-1 break-words text-xs text-gray-500 dark:text-gray-400">
			{description}
		</div>
		{#if extra2}<div class="ml-2 flex-shrink-0 text-xs">{@render extra2()}</div>{/if}
	</div>
	{@render children()}
</div>
