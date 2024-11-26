<script lang="ts">
	import { onMount } from 'svelte';
	import { get, writable } from 'svelte/store';
	import {
		Trash as TrashIcon,
		Pencil1 as PencilIcon,
		Plus as PlusIcon,
		CrossCircled
	} from 'radix-icons-svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';
	import Button from '$lib/components/Form/Button.svelte';
	import { colorPacks } from '$lib/components/color';
	import Input from '$lib/components/Form/Input.svelte';
	import { getOauthProviderList, getOauthProviderTypes } from '$lib/api/user';
	import Create from './Create.svelte';

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
		logo: ''
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
				body: JSON.stringify(newProvider)
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
				body: JSON.stringify({ id })
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
				body: JSON.stringify({ id: editProvider.id })
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
						logo: editProvider.logo
					})
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
			color: 'red'
		},
		{
			label: 'Cancel',
			color: 'secondary'
		}
	]}
></Modal>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">OAuth 管理</h1>

	<Create />
	{#await getOauthProviderList()}
		<div class="flex items-center justify-center">loading...</div>
	{:then list}
		{#each list as { name, desc, type, logo }, idx (name)}
			1
		{/each}
	{/await}

	<!-- OAuth 供应商列表 -->
	<div class="overflow-x-auto">
		<table class="min-w-full rounded-lg bg-white shadow dark:bg-gray-800">
			<thead>
				<tr>
					<th
						class="bg-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-300"
						>名称</th
					>
					<th
						class="bg-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-300"
						>描述</th
					>
					<th
						class="bg-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-300"
						>类型</th
					>
					<th
						class="bg-gray-200 px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-300"
						>Logo</th
					>
					<th
						class="bg-gray-200 px-6 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-600 dark:bg-gray-700 dark:text-gray-300"
						>操作</th
					>
				</tr>
			</thead>
			<tbody>
				{#each $oauthProviders as provider}
					<tr class="border-b dark:border-gray-700">
						<td class="px-6 py-4 text-gray-700 dark:text-gray-200">{provider.name}</td>
						<td class="px-6 py-4 text-gray-700 dark:text-gray-200">{provider.desc}</td>
						<td class="px-6 py-4 text-gray-700 dark:text-gray-200">{provider.type}</td>
						<td class="px-6 py-4">
							<img
								src={provider.logo}
								alt={`${provider.name} Logo`}
								class="h-8 w-8 object-contain"
							/>
						</td>
						<td class="space-x-2 px-6 py-4 text-center">
							<button
								class="flex items-center justify-center rounded-lg bg-yellow-500 px-3 py-1 text-white shadow hover:bg-yellow-600"
								on:click={() => startEditOAuthProvider(provider)}
								title="编辑"
							>
								<PencilIcon class="h-4 w-4" />
							</button>
							<button
								class="flex items-center justify-center rounded-lg bg-red-500 px-3 py-1 text-white shadow hover:bg-red-600"
								on:click={() => deleteOAuthProvider(provider.id)}
								title="删除"
							>
								<TrashIcon class="h-4 w-4" />
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
</div>

<style>
	/* 自定义滚动条样式（可选） */
	::-webkit-scrollbar {
		width: 8px;
	}

	::-webkit-scrollbar-track {
		background: #f1f1f1;
	}

	::-webkit-scrollbar-thumb {
		background: #888;
		border-radius: 4px;
	}

	::-webkit-scrollbar-thumb:hover {
		background: #555;
	}
</style>
