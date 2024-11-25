<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../Form/Button.svelte';
	import ClickListener from '../Global/ClickListener.svelte';
	import KeyListener from '../Global/KeyListener.svelte';
	import { fade, fly } from 'svelte/transition';

	// export let controls: Snippet<[(open?: boolean) => void]> | undefined | null = undefined;
	// export let children: Snippet<[(open?: boolean) => void]>;

	// export let open = false;

	let {
		open = $bindable(false),
		controls,
		children,
		closeOnOutsideClick = true,
		closeOnEscape = true,
		this: box = $bindable()
	}: {
		/**菜单打开状态(可绑定) */
		open?: boolean;
		/**控制组件, 传入null不显示, 不指定或传入undefined显示默认按钮 */
		controls?: Snippet<[(open?: boolean) => void]> | undefined | null;
		children: Snippet<[(open?: boolean) => void]>;
		/**是否允许点击外面关闭面板 (默认true) */
		closeOnOutsideClick?: boolean;
		/**是否允许按Esc关闭面板 (默认true) */
		closeOnEscape?: boolean;
		this?: HTMLDivElement;
	} = $props();

	// 用于控制菜单是否打开
	function toggleMenu(o?: boolean) {
		open = o ?? !open;
	}
</script>

<!-- @component
菜单组件, 展示一个菜单按钮和菜单列表, 内容由`<MenuItem/>`, `<MenuPlain/>`, `<MenuDivider/>`等组成

example:

```svelte
<Menu>
	{#snippet controls(toggleMenu)}
		<IconBtn icon={PersonIcon} content={user?.name} onclick={() => toggleMenu()} />
	{/snippet}
	<MenuPlain title>标题</MenuPlain>
	<MenuItem href="/">主页</MenuItem>
</Menu>
```
 -->

<div class="relative inline-block text-left" bind:this={box}>
	<!-- Menu Button -->
	{#if controls}
		{@render controls(toggleMenu)}
	{:else if controls !== null}
		<Button onclick={() => toggleMenu()}>Menu</Button>
	{/if}

	<!-- Dropdown Menu -->
	{#if open}
		<div
			class="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700"
			style:z-index="999"
			in:fly={{ y: 5, opacity: 0.5, duration: 40 }}
			out:fly={{ y: -5, opacity: 0.3, duration: 40 }}
		>
			<div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
				{@render children(toggleMenu)}
			</div>
		</div>

		{#if closeOnOutsideClick}
			<ClickListener handler={() => (open = false)} exclude={box} />
		{/if}
		{#if closeOnEscape}
			<KeyListener handler={() => (open = false)} key="Escape" />
		{/if}
	{/if}
</div>
