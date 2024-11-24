<script lang="ts">
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';

	export let icon: Snippet<[boolean]> | undefined = undefined;
	export let children: Snippet;
	export let onclick: MouseEventHandler<HTMLButtonElement> | undefined | null = undefined;
	export let onmouseenter: MouseEventHandler<HTMLButtonElement> | undefined | null = undefined;
	export let onmouseleave: MouseEventHandler<HTMLButtonElement> | undefined | null = undefined;

	export let hover: boolean = false;
</script>

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
	<!-- 菜单项文本 -->
	{@render children()}
</button>
