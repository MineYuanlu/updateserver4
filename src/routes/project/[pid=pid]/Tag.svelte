<script lang="ts">
	import BtnOrAOrSpan from '$lib/components/Form/BtnOrAOrSpan.svelte';
	import { Cross2 } from '@steeze-ui/radix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { Snippet } from 'svelte';
	import type { HTMLAttributeAnchorTarget, MouseEventHandler } from 'svelte/elements';

	const {
		children,
		href,
		target,
		onclick,
		class: _class = '',
		remove,
	}: {
		children: string | Snippet;
		href?: string;
		target?: HTMLAttributeAnchorTarget | undefined | null;
		onclick?: MouseEventHandler<HTMLButtonElement> | undefined | null;
		class?: string;
		remove?: () => void;
	} = $props();

	const _class2 = $derived(
		href || onclick
			? 'transition cursor-pointer duration-300 hover:bg-gray-200 dark:hover:bg-gray-700'
			: undefined,
	);
</script>

<BtnOrAOrSpan
	{href}
	{target}
	{onclick}
	class="mx-0.5 inline-block items-center rounded-md border border-dashed border-gray-300 bg-gray-50 p-1 text-sm text-gray-700 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 {_class2} {_class}"
>
	{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}{#if remove}<Icon
			src={Cross2}
			class="inline-block h-3 w-3 cursor-pointer"
			onclick={remove}
		/>{/if}
</BtnOrAOrSpan>
