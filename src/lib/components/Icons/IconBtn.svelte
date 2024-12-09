<script lang="ts">
	import type { IconSource } from '@steeze-ui/simple-icons';
	import type { Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import { isSnippet } from '../SoC/soc';
	import { Icon } from '@steeze-ui/svelte-icon';

	let {
		icon,
		iconClass = 'w-5 h-5',
		disabled,
		content,
		onclick,
		onmouseenter,
		onmouseleave,
		hoverIcon,
		hoverIconClass = 'hover',
		hover = $bindable(false),
	}: {
		icon: Snippet<[string]> | IconSource;
		iconClass?: string;
		disabled?: boolean;
		content?: string;
		onclick?: MouseEventHandler<HTMLButtonElement>;
		onmouseenter?: MouseEventHandler<HTMLButtonElement>;
		onmouseleave?: MouseEventHandler<HTMLButtonElement>;
		hoverIcon?: Snippet<[string]> | IconSource;
		hoverIconClass?: string;
		hover?: boolean;
	} = $props();
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
		{#if isSnippet(hoverIcon)}
			{@render hoverIcon(hoverIconClass)}
		{:else}
			<Icon src={hoverIcon} class={hoverIconClass} />
		{/if}
	{:else if isSnippet(icon)}
		{@render icon(iconClass)}
	{:else}
		<Icon src={icon} class={iconClass} />
	{/if}
	{#if content}
		<span
			class="rounded-full pl-2 text-gray-600 hover:bg-gray-200 dark:text-gray-300 dark:hover:bg-gray-700"
		>
			{content}
		</span>
	{/if}
</button>
