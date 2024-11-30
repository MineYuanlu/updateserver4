<script lang="ts">
	import Button from '$lib/components/Form/Button.svelte';
	import { getOauthProviderList } from '$lib/api/user';
	import Create from './Create.svelte';
	import Table from '$lib/components/Table/Table.svelte';

	let createModCount = $state(0);
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">OAuth 管理</h1>

	<Create bind:createModCount />
	{#key createModCount}
		<Table
			headers={['名称', '描述', '类型', '操作']}
			data={async () => {
				const data = await getOauthProviderList();
				return {
					data: data.map((it) => [it.name, it.desc, [it.logo, it.type], undefined]),
					total: data.length,
				};
			}}
		>
			{#snippet cell(data, _row, col, tmp)}
				<td class="px-4 py-2 text-center">
					{#if data === null && tmp}
						&nbsp;
					{:else if col === 2}
						<span class="flex items-center justify-center">
							<img src={data[0]} alt={data[1]} class="mr-1 h-8 w-8" />
							<span> {data[1]}</span>
						</span>
					{:else if col === 3}
						<Button>编辑</Button>
					{:else}
						{data}
					{/if}
					<!--
				{:else if typeof data === 'string'}
					{data}
				{:else if typeof data === 'undefined'}
					{data}
				{:else if Array.isArray(data)}
					{@const [name, logo] = data}
					<span class="flex items-center justify-center">
						<img src={logo} alt={name} class="mr-5 h-8 w-8" />
						<span> {name}</span>
					</span>
				{/if} -->
				</td>
			{/snippet}
		</Table>
	{/key}
</div>
