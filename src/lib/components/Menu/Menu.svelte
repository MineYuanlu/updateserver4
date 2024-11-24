<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../Form/Button.svelte';

	export let controls: Snippet<[(open?: boolean) => void]> | undefined | null = undefined;
	export let children: Snippet<[(open?: boolean) => void]>;

	export let open = false;

	// 用于控制菜单是否打开
	function toggleMenu(o?: boolean) {
		open = o ?? !open;
	}
</script>

<div class="relative inline-block text-left">
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
		>
			<div class="py-1" role="menu" aria-orientation="vertical" aria-labelledby="menu-button">
				{@render children(toggleMenu)}
			</div>
		</div>
	{/if}
</div>
