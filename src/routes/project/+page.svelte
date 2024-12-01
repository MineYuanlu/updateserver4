<script lang="ts">
	import { listProjects } from '$lib/api/project';
	import { Visibility } from '$lib/common/project';
	import BindValue from '$lib/components/BindValue/BindValue.svelte';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import Table from '$lib/components/Table/Table.svelte';
	import { PlusCircled } from 'radix-icons-svelte';

	let value = '';
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
		<Table
			class="mt-8 text-center"
			headers={['项目', '所有者', '最新版本', '可见性', '访问量']}
			data={async (offset, length) => {
				const resp = await listProjects(offset, length);
				return resp.map((p) => [[p.id, p.name], [p.oid, p.owner], '', p.visibility, 0]);
			}}
		>
			{#snippet cell(data, _row, col, tmp)}
				{#if data === null && tmp}
					<td class="px-4 py-2"> &nbsp;</td>
				{:else if col === 0}
					<!-- 项目名称 -->
					<td>
						<a href="/project/{data[0]}" class="block h-full w-full px-4 py-2">{data[1]}</a>
					</td>
				{:else if col === 1}
					<!-- 所有者 -->
					<td class="">
						<a href="/user/{data[0]}" class="block h-full w-full px-4 py-2">{data[1]}</a>
					</td>
				{:else if col === 3}
					<!-- 可见性 -->
					<td class="px-4 py-2"> {Visibility._toDesc(data)}</td>
				{:else}
					<td class="px-4 py-2"> {data}</td>
				{/if}
			{/snippet}
		</Table>
	{/key}
</div>
