<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import * as m from '$lib/paraglide/messages.js';
	import { navbar } from '$lib/stores/common';
	import { slide } from 'svelte/transition';
	import Header from './Header.svelte';

	let { children, data } = $props();
</script>

<ParaglideJS {i18n}>
	<div class="flex h-screen flex-col">
		<!-- Header -->
		<Header user={data?.user} />

		<!-- 主体内容部分 -->
		<div class="flex flex-grow">
			{#if $navbar}
				<!-- 左侧 Navbar -->
				<aside
					class="hidden w-64 border-r bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:block"
					transition:slide={{ duration: 100, axis: 'x' }}
				>
					{@render $navbar()}
					<!-- <ul class="space-y-4">
						<li>
							<a
								href="#"
								class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
								>导航 1</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
								>导航 2</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
								>导航 3</a
							>
						</li>
					</ul> -->
				</aside>
			{/if}

			<!-- 主体内容 -->
			<main class="flex-grow bg-white p-6 dark:bg-gray-900 dark:text-gray-100">
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
</ParaglideJS>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
