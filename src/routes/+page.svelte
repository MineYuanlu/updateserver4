<script lang="ts">
	import * as m from '$lib/paraglide/messages.js';

	// onMount(() => {
	// 	let hasNavBar = false;
	// 	setInterval(() => {
	// 		navbar.set(hasNavBar ? undefined : _navbar);
	// 		hasNavBar = !hasNavBar;
	// 	}, 500);
	// 	return () => {
	// 		navbar.set(undefined);
	// 	};
	// });
</script>

<!-- <h1>Welcome to SvelteKit</h1>
<p>Visit <a href="https://svelte.dev/docs/kit">svelte.dev/docs/kit</a> to read the documentation</p>
 -->
{#snippet _navbar()}
	123
{/snippet}
<section
	class="relative bg-gradient-to-r from-blue-500 via-indigo-600 to-purple-700 px-6 py-24 text-white md:px-12 md:py-32"
>
	<div class="absolute inset-0 bg-black opacity-50"></div>
	<!-- 背景遮罩层，增加对比度 -->
	<div class="container relative mx-auto text-center">
		<!-- Hero 内容 -->
		<h1 class="mb-6 text-4xl font-extrabold leading-tight sm:text-5xl lg:text-6xl">
			{m.page_index__title()}
		</h1>
		<p class="mb-8 text-lg leading-relaxed sm:text-xl">
			{m.page_index__description()}
		</p>

		<!-- CTA 按钮 -->
		<a
			href="/project/create"
			class="inline-block transform rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
		>
			{m.page_index__btn_start()}
		</a>
	</div>
</section>

<!-- <CommandPalette>
	{#snippet item(query, togglePalette)}
		<CpItem
			title="Text {query}"
			subtitle="some text for description here and there and more."
			icon={Globe}
		>
			{#snippet suffix(hover)}
				{#if hover}
					Jump
				{/if}
			{/snippet}
		</CpItem>
		<CpItem
			title="Text {query}"
			subtitle="some text for description here and there and more."
			icon={Globe}
			color="purple"
		></CpItem>
		<CpItem
			title="Text {query}"
			subtitle="some text for description here and there and more."
			icon={Globe}
			color="green"
		></CpItem>
	{/snippet}
</CommandPalette> -->

<style>
	/* 背景渐变 */
	section {
		background: linear-gradient(to right, #3b82f6, #4c6ef5, #7c3aed);
	}
</style>
