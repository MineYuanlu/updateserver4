<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { HTMLAttributeAnchorTarget, MouseEventHandler } from 'svelte/elements';

	let {
		children,

		href,
		target,

		onclick,

		...props
	}: {
		children: string | Snippet<[]>;
		href?: string;
		target?: HTMLAttributeAnchorTarget | undefined | null;

		onclick?: MouseEventHandler<HTMLButtonElement> | undefined | null;

		class?: string;
		[key: string]: any;
	} = $props();
</script>

<!-- @component
自动切换: 按钮/链接/文本
 -->

{#if href}
	<a {href} {target} {...props}>
		{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}
	</a>
{:else if onclick}
	<button {onclick} {...props}>
		{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}
	</button>
{:else}
	<span {...props}>
		{#if typeof children === 'string'}{children}{:else}{@render children()}{/if}
	</span>
{/if}
