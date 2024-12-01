<script lang="ts">
	import { page } from '$app/stores';
	import { page_p__error_400_message, page_p__error_404_message } from '$lib/paraglide/messages';
</script>

<section class="flex min-h-full flex-col items-center justify-center px-4 py-16">
	<div class="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
		<!-- 报错标题 -->
		<h1 class="mb-6 text-4xl font-semibold text-red-600 dark:text-red-400">
			出错了: {$page.status}
		</h1>

		<!-- 报错正文 -->
		<p class="mb-4 text-lg text-gray-800 dark:text-gray-200">
			{#if $page.status === 404}
				{page_p__error_404_message({ name: $page.params.pname })}
			{:else if $page.status === 400}
				{page_p__error_400_message({ name: $page.params.pname })}
			{:else}
				{$page?.error?.message}
			{/if}
		</p>

		<!-- 可选：返回首页按钮 -->
		<a href="/" class="text-sm font-semibold text-blue-400 hover:text-blue-600">返回首页</a>
	</div>
</section>

<style>
	/* 响应式布局 */
	@media (max-width: 768px) {
		section {
			padding: 4rem 2rem;
		}
	}
</style>
