<script lang="ts">
	import { browser } from '$app/environment';
	import { listProjects } from '$lib/api/project';
	import { Visibility } from '$lib/common/project';
	import BindValue from '$lib/components/BindValue/BindValue.svelte';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import TablePro from '$lib/components/Table/TablePro.svelte';
	import { name } from '$lib/paraglide/messages';

	let value = $state('');

	type DataType = Awaited<ReturnType<typeof listProjects>>[number];

	const { data } = $props();
</script>

<BindValue bind="txt" bind:value replace />

<div class="container mx-auto p-6">
	<h1 class="mb-8 text-3xl font-bold text-gray-800 dark:text-gray-100">项目列表</h1>

	<Input bind:value placeholder="Enter your project name">
		{#snippet suffix()}
			<Button
				class="ml-2 rounded-md rounded-bl-none rounded-tl-none ring-1 ring-blue-500 hover:ring-blue-600 dark:ring-blue-600 dark:hover:ring-blue-500"
			>
				查询
			</Button>
		{/snippet}
	</Input>
	{#key 1}
		<TablePro
			bindSearch="page"
			class="mt-8 text-center"
			headers={[
				['name', '项目'],
				['owner', '所有者'],
				['version', '最新版本'],
				['visibility', '可见性'],
				['views', '访问量'],
			]}
			data={browser ? listProjects : data.preData.data}
		>
			{#snippet cell(name, data, record, row, col, tmp)}
				{#if data === undefined && tmp}
					<td class="px-4 py-2"> &nbsp;</td>
				{:else if name === 'name'}
					<!-- 项目名称 -->
					<td>
						<a href="/project/{record.id}" class="block h-full w-full px-4 py-2">{data}</a>
					</td>
				{:else if name === 'owner'}
					<!-- 所有者 -->
					<td class="">
						<a href="/user/{record.oid}" class="block h-full w-full px-4 py-2">{data}</a>
					</td>
				{:else if name === 'visibility'}
					<!-- 可见性 -->
					<td class="px-4 py-2"> {Visibility._toDesc(data)}</td>
				{:else}
					<td class="px-4 py-2"> {data}</td>
				{/if}
			{/snippet}
		</TablePro>
	{/key}
</div>
