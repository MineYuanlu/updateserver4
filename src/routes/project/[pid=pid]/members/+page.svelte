<script lang="ts">
	import { UserRole } from '$lib/common/project';
	import TablePro from '$lib/components/Table/TablePro.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	const { data } = $props();
	const { proj, versions, tags } = data.project;
	const members: {
		uid: `u${string}` | null;
		name: string;
		role: 1 | 2 | 3 | 4;
	}[] = data.members;
	const myRole = data.role;
</script>

<TablePro
	data={members}
	headers={[
		['name', '账户'],
		['role', '角色'],
		['', ''],
	]}
	centering
	class="overflow-visible"
>
	{#snippet cell(name, data, record, row, col, tmp)}
		{#if data === undefined && tmp}
			<td class="px-4 py-2">&nbsp;</td>
		{:else if name === 'role'}
			<td class="px-4 py-2">
				{#if data < myRole}
					<Input
						class="mx-auto w-32"
						inputClass="w-24"
						value={data}
						options={UserRole._toOptions().filter((v) => UserRole._toValue(v[0]) < myRole)}
						showAllOptions
					/>
				{:else}
					{UserRole._toDesc(data)}
				{/if}
			</td>
		{:else}
			<td class="px-4 py-2">{data}</td>
		{/if}
	{/snippet}
</TablePro>
<!-- <pre class="max-w-3xl overflow-auto">{JSON.stringify(data, null, 2)}</pre> -->
