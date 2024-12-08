<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import * as m from '$lib/paraglide/messages.js';
	import { navbar, settings } from '$lib/stores/common';
	import Header from './Header.svelte';
	import Navbar from './Navbar.svelte';
	import NotificationList from '$lib/components/Notifications/NotificationList.svelte';

	let { children, data } = $props();

	let theme = $state(data?.theme || 'light');
</script>

<div class:dark={theme === 'dark'}>
	<ParaglideJS {i18n}>
		<div class="flex h-screen flex-col">
			<!-- Header -->
			<Header user={data?.user} bind:theme settings={$settings} />

			<!-- 主体内容部分 -->
			<div class="flex flex-grow">
				<!-- 左侧 Navbar -->
				<Navbar navbar={$navbar} />

				<!-- 主体内容 -->
				<main class="flex-grow bg-gray-50 p-6 dark:bg-gray-900 dark:text-gray-100">
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
	<NotificationList />
</div>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
