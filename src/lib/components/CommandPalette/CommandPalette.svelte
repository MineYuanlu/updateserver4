<script lang="ts">
	import type { Snippet } from 'svelte';
	import Input from '../Form/Input.svelte';
	import { MagnifyingGlass } from '@steeze-ui/radix-icons';
	import { fly, fade } from 'svelte/transition';
	import KeyListener from '../Global/KeyListener.svelte';
	import Openable, { type OpenableProps } from '../base/Openable.svelte';
	type TogglePalette = (open?: boolean) => void;
	let {
		input = $bindable(''),
		item,
		closeOnOutsideClick = true,
		closeOnEscape = true,

		open = $bindable(false),
		controls,
		preOpen,
		postOpen,
		preClose,
		postClose,
	}: {
		/**搜索框输入值(可绑定) */
		input?: string;
		/**命令项组件, item(输入值, 控制面板打开状态)*/
		item: Snippet<[string, TogglePalette]>;
		/**是否允许点击外面关闭面板 (默认true) */
		closeOnOutsideClick?: boolean;
		/**是否允许按Esc关闭面板 (默认true) */
		closeOnEscape?: boolean;
	} & OpenableProps = $props();

	const togglePalette = (o?: boolean) => {
		open = o ?? !open;
	};
</script>

<!--
@component
命令面板组件, 展示一个类Modal的顶层组件，包括输入框和结果列表
  -->

<!-- Command Palette -->
<Openable bind:open {controls} {preOpen} {postOpen} {preClose} {postClose}>
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
	{#if closeOnEscape}
		<KeyListener key="Escape" handler={() => (open = false)} />
	{/if}
</Openable>
