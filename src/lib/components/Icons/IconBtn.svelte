<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import { isSimpleIcon, type SimpleIcon } from './helpers';
	import Si from './Si.svelte';

	export let icon: Component<{ class: string }> | SimpleIcon | any;
	export let iconClass: string = 'w-5 h-5';
	export let disabled: boolean = false;
	export let content: string | undefined = undefined;
	export let onclick: MouseEventHandler<HTMLButtonElement> | null | undefined = undefined;
	export let onmouseenter: MouseEventHandler<HTMLButtonElement> | null | undefined = undefined;
	export let onmouseleave: MouseEventHandler<HTMLButtonElement> | null | undefined = undefined;
	export let hoverIcon: Component<{ class: string }> | any | undefined = undefined;
	export let hoverIconSnippet: Snippet<[string]> | undefined = undefined;
	export let hoverIconClass: string = 'hover';

	export let hover: boolean = false;
</script>

<!-- @component

图标按钮组件

## 示例
```
<IconBtn icon={isDarkMode ? MoonIcon : SunIcon} onclick={toggleTheme}>
	{#snippet hoverIconSnippet(c)}
		<CombineIcon
			class={c}
			icons={[
				[MoonIcon, 'rt'],
				[SunIcon, 'lb']
			]}
			padding={15}
		/>
	{/snippet}
</IconBtn>
```
 -->

<button
	class="flex items-center rounded-lg p-2 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
	{onclick}
	onmouseenter={(e) => {
		hover = true;
		if (onmouseenter) onmouseenter(e);
	}}
	onmouseleave={(e) => {
		hover = false;
		if (onmouseleave) onmouseleave(e);
	}}
	{disabled}
>
	{#if hover && hoverIcon}
		<svelte:component this={hoverIcon} class="{iconClass} {hoverIconClass}" />
	{:else if hover && hoverIconSnippet}
		{@render hoverIconSnippet(`${iconClass} ${hoverIconClass}`)}
	{:else if isSimpleIcon(icon)}
		<Si {icon} class={iconClass} />
	{:else}
		<svelte:component this={icon} class={iconClass} />
	{/if}
	{#if content}
		<span
			class="rounded-full pl-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
		>
			{content}
		</span>
	{/if}
</button>
