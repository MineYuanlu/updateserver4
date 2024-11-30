<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import { CrossCircled } from 'radix-icons-svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';
	import Button from '$lib/components/Form/Button.svelte';
	import { getOauthProviderList } from '$lib/api/user';
	import Create from './Create.svelte';
	import Table from '$lib/components/Table/Table.svelte';

	// 定义 OAuth 供应商类型
	const providerTypes = writable<string[]>([]);

	// 定义 OAuth 供应商列表
	interface OAuthProvider {
		id: string;
		name: string;
		desc: string;
		type: string;
		logo: string;
	}

	const oauthProviders = writable<OAuthProvider[]>([]);

	// 表单状态
	let showAddForm = false;
	let newProvider = {
		name: '',
		desc: '',
		type: '',
		logo: '',
	};

	let editProvider: OAuthProvider | null = null;

	// 获取 OAuth 供应商类型
	const fetchProviderTypes = async () => {
		try {
			const response = await fetch('/api/user/oauth/providers/types');
			if (!response.ok) throw new Error('Failed to fetch provider types');
			const data: string[] = await response.json();
			providerTypes.set(data);
		} catch (error) {
			console.error(error);
		}
	};

	// 获取 OAuth 供应商列表
	const fetchOAuthProviders = async () => {
		try {
			const response = await fetch('/api/user/oauth/providers/list');
			if (!response.ok) throw new Error('Failed to fetch OAuth providers');
			const data: OAuthProvider[] = await response.json();
			oauthProviders.set(data);
		} catch (error) {
			console.error(error);
		}
	};

	// 新增 OAuth 供应商
	const addOAuthProvider = async () => {
		try {
			const response = await fetch('/api/user/oauth/providers/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(newProvider),
			});
			if (!response.ok) throw new Error('Failed to create OAuth provider');
			const data = await response.json();
			// 更新本地列表
			fetchOAuthProviders();
			// 重置表单
			newProvider = { name: '', desc: '', type: '', logo: '' };
			showAddForm = false;
		} catch (error) {
			console.error(error);
		}
	};

	// 删除 OAuth 供应商
	const deleteOAuthProvider = async (id: string) => {
		if (!confirm('确定要删除此 OAuth 供应商吗？')) return;
		try {
			const response = await fetch('/api/user/oauth/providers/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id }),
			});
			if (!response.ok) throw new Error('Failed to delete OAuth provider');
			// 更新本地列表
			fetchOAuthProviders();
		} catch (error) {
			console.error(error);
		}
	};

	// 编辑 OAuth 供应商
	const startEditOAuthProvider = (provider: OAuthProvider) => {
		editProvider = { ...provider };
	};

	const updateOAuthProvider = async () => {
		if (!editProvider) return;
		try {
			// 先删除旧的供应商
			await fetch('/api/user/oauth/providers/delete', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ id: editProvider.id }),
			});
			// 再新增新的供应商
			const { id } = await (
				await fetch('/api/user/oauth/providers/create', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						name: editProvider.name,
						desc: editProvider.desc,
						type: editProvider.type,
						logo: editProvider.logo,
					}),
				})
			).json();
			// 更新本地列表
			fetchOAuthProviders();
			// 重置编辑状态
			editProvider = null;
		} catch (error) {
			console.error(error);
		}
	};

	// 取消编辑
	const cancelEdit = () => {
		editProvider = null;
	};

	onMount(() => {
		fetchProviderTypes();
		fetchOAuthProviders();
	});
</script>

<Modal
	title="Deactivate account"
	content="Are you sure you want to deactivate your account? All of your data will be permanently removed. This action cannot be undone."
	icon={CrossCircled}
	iconColor="blue"
	btns={[
		{
			label: 'Deactivate',
			color: 'red',
		},
		{
			label: 'Cancel',
			color: 'secondary',
		},
	]}
></Modal>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">OAuth 管理</h1>

	<Create />
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
		{#snippet cell(data, row, col, tmp)}
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
	{#await getOauthProviderList()}
		<div class="flex items-center justify-center">loading...</div>
	{:then list}
		<!-- {#each list as { name, desc, type, logo }, idx (name)}
			1
		{/each} -->
	{/await}
</div>
