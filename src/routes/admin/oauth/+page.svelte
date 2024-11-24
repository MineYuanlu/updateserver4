<script lang="ts">
	import { onMount } from 'svelte';
	import { writable } from 'svelte/store';
	import {
		Trash as TrashIcon,
		Pencil1 as PencilIcon,
		Plus as PlusIcon,
		CrossCircled
	} from 'radix-icons-svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';

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
></Modal>

<div class="container mx-auto p-6">
	<h1 class="mb-6 text-3xl font-bold text-gray-800 dark:text-gray-100">OAuth 管理</h1>

	<!-- 新增按钮 -->
	<button
		class="mb-4 flex items-center rounded-lg bg-green-500 px-4 py-2 text-white shadow hover:bg-green-600"
		on:click={() => {
			showAddForm = true;
		}}
	>
		<PlusIcon class="mr-2 h-5 w-5" /> 新增 OAuth 供应商
	</button>

	<!-- 新增表单 -->
	{#if showAddForm}
		<div class="mb-6 rounded-lg bg-gray-50 p-4 shadow dark:bg-gray-700">
			<h2 class="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">
				新增 OAuth 供应商
			</h2>
			<div class="space-y-4">
				<div>
					<label class="block text-gray-600 dark:text-gray-300">名称</label>
					<input
						type="text"
						bind:value={newProvider.name}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
						placeholder="供应商名称"
					/>
				</div>
				<div>
					<label class="block text-gray-600 dark:text-gray-300">描述</label>
					<input
						type="text"
						bind:value={newProvider.desc}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
						placeholder="供应商描述"
					/>
				</div>
				<div>
					<label class="block text-gray-600 dark:text-gray-300">类型</label>
					<select
						bind:value={newProvider.type}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
					>
						<option value="" disabled>选择供应商类型</option>
						{#each $providerTypes as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-gray-600 dark:text-gray-300">Logo URL</label>
					<input
						type="text"
						bind:value={newProvider.logo}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
						placeholder="供应商 Logo URL"
					/>
				</div>
				<div class="flex space-x-4">
					<button
						class="rounded-lg bg-blue-500 px-4 py-2 text-white shadow hover:bg-blue-600"
						on:click={addOAuthProvider}
					>
						保存
					</button>
					<button
						class="rounded-lg bg-gray-300 px-4 py-2 text-gray-800 shadow hover:bg-gray-400"
						on:click={() => {
							showAddForm = false;
						}}
					>
						取消
					</button>
				</div>
			</div>
		</div>
	{/if}

	<!-- 编辑表单 -->
	{#if editProvider}
		<div class="mb-6 rounded-lg bg-gray-50 p-4 shadow dark:bg-gray-700">
			<h2 class="mb-4 text-2xl font-semibold text-gray-700 dark:text-gray-200">
				编辑 OAuth 供应商
			</h2>
			<div class="space-y-4">
				<div>
					<label class="block text-gray-600 dark:text-gray-300">名称</label>
					<input
						type="text"
						bind:value={editProvider.name}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
						placeholder="供应商名称"
					/>
				</div>
				<div>
					<label class="block text-gray-600 dark:text-gray-300">描述</label>
					<input
						type="text"
						bind:value={editProvider.desc}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
						placeholder="供应商描述"
					/>
				</div>
				<div>
					<label class="block text-gray-600 dark:text-gray-300">类型</label>
					<select
						bind:value={editProvider.type}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
					>
						<option value="" disabled>选择供应商类型</option>
						{#each $providerTypes as type}
							<option value={type}>{type}</option>
						{/each}
					</select>
				</div>
				<div>
					<label class="block text-gray-600 dark:text-gray-300">Logo URL</label>
					<input
						type="text"
						bind:value={editProvider.logo}
						class="mt-1 w-full rounded-lg border bg-white px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-600"
						placeholder="供应商 Logo URL"
					/>
				</div>
				<div class="flex space-x-4">
					<button
						class="rounded-lg bg-blue-500 px-4 py-2 text-white shadow hover:bg-blue-600"
						on:click={updateOAuthProvider}
					>
						更新
					</button>
					<button
						class="rounded-lg bg-gray-300 px-4 py-2 text-gray-800 shadow hover:bg-gray-400"
						on:click={cancelEdit}
					>
						取消
					</button>
				</div>
			</div>
		</div>
	{/if}

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
