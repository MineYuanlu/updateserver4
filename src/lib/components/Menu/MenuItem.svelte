<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	let {
		icon,
		children,
		onclick,
		onmouseenter,
		onmouseleave,
		hover = $bindable(false),
		href,
		hreflang,
	}: {
		/**左侧图标 icon(hover: boolean)*/
		icon?: Snippet<[boolean]>;
		/**菜单项内容 children()*/
		children: Snippet;
		onclick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | undefined | null;
		onmouseenter?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | undefined | null;
		onmouseleave?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | undefined | null;
		hover?: boolean;
		/** 菜单项链接, 指定此值后菜单项将从button变为a标签 */
		href?: string;
		hreflang?: string;
	} = $props();
</script>

{#if href}
	<a
		{href}
		{hreflang}
		class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
		{onclick}
		onmouseenter={(e) => {
			hover = true;
			if (onmouseenter) onmouseenter(e);
		}}
		onmouseleave={(e) => {
			hover = false;
			if (onmouseleave) onmouseleave(e);
		}}
	>
		{#if icon}
			<!-- 图标槽 -->
			<span class="mr-2">
				{@render icon(hover)}
			</span>
		{/if}
		<!-- 菜单项内容 -->
		{@render children()}
	</a>
{:else}
	<button
		{onclick}
		onmouseenter={(e) => {
			hover = true;
			if (onmouseenter) onmouseenter(e);
		}}
		onmouseleave={(e) => {
			hover = false;
			if (onmouseleave) onmouseleave(e);
		}}
		class="flex w-full items-center px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 focus:outline-none dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
	>
		{#if icon}
			<!-- 图标槽 -->
			<span class="mr-2">
				{@render icon(hover)}
			</span>
		{/if}
		<!-- 菜单项内容 -->
		{@render children()}
	</button>
{/if}
