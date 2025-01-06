<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import * as m from '$lib/paraglide/messages.js';
	import { navbar, overBoxs, settings } from '$lib/stores/common';
	import Header from './Header.svelte';
	import NotificationList from '$lib/components/Notifications/NotificationList.svelte';
	import { slide } from 'svelte/transition';
	import { theme } from '$lib/stores/theme';

	let { children, data } = $props();

	const nav = $derived($navbar ? $navbar[0] : undefined);
	const { class: nav_class, ...nav_attr } = $derived(($navbar ? $navbar[1] : undefined) ?? {});
</script>

<div class:dark={$theme === 'dark' || data?.theme === 'dark'}>
	<ParaglideJS {i18n}>
		<div class="flex h-screen flex-col">
			<!-- Header -->
			<Header user={data?.user} theme={data?.theme} settings={$settings} />

			<!-- 主体内容部分 -->
			<div class="flex flex-grow">
				<!-- 左侧 Navbar -->
				{#if nav}
					<aside
						class="w-64 shrink-0 overflow-y-auto border-r bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:block {nav_class}"
						{...nav_attr}
						transition:slide={{ duration: 100, axis: 'x' }}
					>
						{@render nav()}
					</aside>
				{/if}

				<!-- 主体内容 -->
				<main
					class="min-h-0 w-0 flex-grow overflow-hidden bg-gray-50 p-6 dark:bg-gray-900 dark:text-gray-100"
				>
					{@render children()}
				</main>
			</div>

			<!-- Footer -->
			<footer
				class="border-t bg-gray-100 p-4 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
			>
				{m.copyright()}
			</footer>
		</div>
		<div id="overBox" class="fixed left-0 top-0 z-50 contents size-0">
			{#each Object.values($overBoxs) as overBox}
				{@render overBox()}
			{/each}
		</div>
	</ParaglideJS>
	<NotificationList />
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
	#overBox > :global(*) {
		position: fixed;
	}
</style>
