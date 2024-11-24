<script lang="ts">
	import type { Snippet } from 'svelte';
	import Button from '../Form/Button.svelte';
	import Input from '../Form/Input.svelte';
	import { MagnifyingGlass } from 'radix-icons-svelte';
	import { fly, fade } from 'svelte/transition';
	type TogglePalette = (open?: boolean) => void;
	let {
		open = $bindable(false),
		input = $bindable(''),
		controls,
		item,
		closeOnOutsideClick = true
	}: {
		/**面板打开状态(可绑定) */
		open?: boolean;
		/**搜索框输入值(可绑定) */
		input?: string;
		/**控制组件, 传入null不显示, 不指定或传入undefined显示默认按钮 */
		controls?: Snippet<[(open?: boolean) => void]> | null;
		/**命令项组件, item(输入值, 控制面板打开状态)*/
		item: Snippet<[string, TogglePalette]>;
		/**是否允许点击外面关闭面板 (默认true) */
		closeOnOutsideClick?: boolean;
	} = $props();

	const togglePalette = (o?: boolean) => {
		open = o ?? !open;
	};
</script>

<!--
@component
命令面板组件, 展示一个顶层组件，包括输入框和结果列表
  -->

{#if controls}
	{@render controls(togglePalette)}
{:else if controls !== null}
	<Button onclick={() => togglePalette()}>Menu</Button>
{/if}

<!-- Command Palette -->
{#if open}
	<div
		class="fixed inset-0 z-50 flex items-center justify-center bg-gray-900 bg-opacity-50 backdrop-blur-sm"
		onclick={(e) => {
			if (closeOnOutsideClick && e.target === e.currentTarget) open = false;
		}}
		role="presentation"
		transition:fade={{ duration: 100 }}
	>
		<!-- Command Palette Container -->
		<div
			class="h-2/3 w-full rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 sm:w-3/4 lg:w-1/2"
			in:fly={{ y: 50, opacity: 0.5, duration: 100 }}
			out:fly={{ y: -50, opacity: 0, duration: 100 }}
		>
			<!-- Search Bar -->
			<div class="relative mb-4">
				<Input placeholder="Search..." prefixIcon={MagnifyingGlass} bind:value={input}></Input>
			</div>

			<!-- Command List -->
			<div class="space-y-3">
				{@render item(input, togglePalette)}
			</div>
		</div>
	</div>
{/if}
