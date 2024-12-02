<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributeAnchorTarget, MouseEventHandler } from 'svelte/elements';

	const {
		children,
		href,
		target,
		onclick,
	}: {
		children: string | Snippet;
		href?: string;
		target?: HTMLAttributeAnchorTarget | undefined | null;
		onclick?: MouseEventHandler<HTMLButtonElement> | undefined | null;
	} = $props();
</script>

{#if href}
	<a
		{href}
		{target}
		class="inline-block cursor-pointer rounded-md border border-gray-300 bg-transparent p-1 text-sm text-gray-700 transition duration-300 hover:bg-gray-100"
	>
		{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}
	</a>
{:else}
	<button
		{onclick}
		class="inline-block cursor-pointer rounded-md border border-gray-300 bg-transparent p-1 text-sm text-gray-700 transition duration-300 hover:bg-gray-100"
	>
		{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}
	</button>
{/if}
