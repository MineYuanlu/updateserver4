<script lang="ts">
	import Button from '$lib/components/Form/Button.svelte';
	import { getOauthProviderList } from '$lib/api/user';
	import Create from './Create.svelte';
	import Table from '$lib/components/Table/Table.svelte';
	import { getIcon } from '$lib/common/oauth';
	import { Icon } from '@steeze-ui/svelte-icon';

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
					data: data.map((it) => [it.name, it.desc, it.type, undefined]),
					total: data.length,
				};
			}}
		>
			{#snippet cell(data, _row, col, tmp)}
				<td class="px-4 py-2 text-center">
					{#if data === null && tmp}
						&nbsp;
					{:else if col === 2}
						{@const icon = getIcon(data)}
						<span class="flex items-center justify-center">
							{#if icon}
								<Icon src={icon} class="mr-2 h-5 w-5" />
							{/if}
							<span> {data}</span>
						</span>
					{:else if col === 3}
						<Button>编辑</Button>
					{:else}
						{data}
					{/if}
				</td>
			{/snippet}
		</Table>
	{/key}
</div>
