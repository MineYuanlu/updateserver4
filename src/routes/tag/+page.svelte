<script lang="ts">
	import { browser } from '$app/environment';
	import { listTags } from '$lib/api/tags';
	// import { listTags } from '$lib/api/tag';
	import BindValue from '$lib/components/BindValue/BindValue.svelte';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import TablePro from '$lib/components/Table/TablePro.svelte';
	import Tag from '../project/[pid=pid]/Tag.svelte';

	const { data } = $props();
	const { hotTags } = data;

	let searchTxt = $state('');
	let searchInput = $state('');
	$effect(() => {
		searchInput = searchTxt;
	});
	let loading = $state(false);
</script>

<BindValue bind="search" bind:value={searchTxt} replace />

<div class="container mx-auto max-w-screen-lg p-6">
	<h1 class="mb-8 text-3xl font-bold text-gray-800 dark:text-gray-100">标签列表</h1>

	<Input
		bind:value={searchInput}
		placeholder="搜索标签"
		suffix="查询"
		onclick={() => (searchTxt = searchInput)}
		onkeydown={(e) => {
			if (e.key === 'Enter') {
				searchTxt = searchInput;
			}
		}}
	/>

	<!-- 热门标签区域 -->
	<div class="mt-8 rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
		<h2 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">热门标签</h2>
		<div class="flex flex-wrap gap-2">
			{#each hotTags as { name, count }}
				<Tag href="/tag/{name}">
					<span>{name}</span>
					<span class="ml-1 text-xs text-gray-500">({count})</span>
				</Tag>
			{/each}
		</div>
	</div>

	{#if searchTxt}
		{#key searchTxt}
			<TablePro
				bindSearch="page"
				class="mt-8 text-center"
				headers={[
					['name', '标签名'],
					['count', '使用次数'],
					['projects', '相关项目'],
				]}
				bind:loading
				data={(off, len) => listTags(off, len, searchTxt)}
			>
				{#snippet cell(name, data, _record, _row, _col, tmp)}
					{#if data === undefined && tmp}
						<td class="px-4 py-2">&nbsp;</td>
					{:else if name === 'name'}
						<td>
							<a href="/tag/{data}" class="block h-full w-full px-4 py-2">{data}</a>
						</td>
					{:else}
						<td class="px-4 py-2">{data}</td>
					{/if}
				{/snippet}
			</TablePro>
		{/key}
	{/if}
</div>
