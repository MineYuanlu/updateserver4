<script lang="ts">
	import Button from '$lib/components/Form/Button.svelte';
	import { getOauthProviderList } from '$lib/api/user';
	import Create from './Create.svelte';
	import TablePro from '$lib/components/Table/TablePro.svelte';
	import { getIcon } from '$lib/common/oauth';
	import { Icon } from '@steeze-ui/svelte-icon';
	import Edit from './Edit.svelte';

	let modCount = $state(0);
</script>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">OAuth 管理</h1>

	<Create bind:createModCount={modCount} />
	{#key modCount}
		<TablePro
			headers={[
				['name', '名称'],
				['desc', '描述'],
				['type', '类型'],
				['action', '操作'],
			]}
			data={async () => {
				const data = await getOauthProviderList(true);
				return {
					data: data,
					total: data.length,
				};
			}}
		>
			{#snippet cell(name, data, _record, _row, _col, tmp)}
				<td class="px-4 py-2 text-center">
					{#if data === undefined && tmp}
						&nbsp;
					{:else if name === 'type'}
						{@const icon = getIcon(data)}
						<span class="flex items-center justify-center">
							{#if icon}
								<Icon src={icon} class="mr-2 h-5 w-5" />
							{/if}
							<span> {data}</span>
						</span>
					{:else if name === 'action'}
						<Edit bind:editModCount={modCount} data={_record as any} />
					{:else}
						{data}
					{/if}
				</td>
			{/snippet}
		</TablePro>
	{/key}
</div>
