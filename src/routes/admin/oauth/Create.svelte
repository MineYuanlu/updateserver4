<!-- name, desc, type, client_id, client_secret, redirect_uri  -->

<script lang="ts">
	import { createOauthProvider, getOauthProviderTypes } from '$lib/api/user';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';
	import type { ReqData } from '../../api/user/oauth/providers/create/+server';

	const defaultData: ReqData = {
		name: '',
		desc: '',
		type: '',
		client_id: '',
		client_secret: '',
		redirect_uri: ''
	};

	let data = $state({ ...defaultData });

	function handleConfirm() {
		console.debug('create oauth provider', data);
		const resp = createOauthProvider(data);
		// data = { ...defaultData };
		return false;
	}
</script>

<Modal
	btns={[
		{ label: '添加', color: 'success' },
		{ label: '取消', color: 'secondary' }
	]}
	onConfirm={handleConfirm}
>
	{#snippet controls(toggleModal)}
		<Button color="blue" onclick={() => toggleModal()}>新增</Button>
	{/snippet}
	{#snippet content(toggleModal)}
		<div class="grid grid-cols-2 gap-4">
			<Input label="登录器名称" class="w-full" bind:value={data.name} />

			{#await getOauthProviderTypes()}
				<Input label="登录器类型" bind:value={data.type} />
			{:then providerTypes}
				<Input label="登录器类型" options={providerTypes} bind:value={data.type} />
			{/await}
		</div>
		<Input label="登录器描述" bind:value={data.desc} />
		<Input label="客户端ID (client_id)" bind:value={data.client_id} />
		<Input label="客户端密钥 (client_secret)" bind:value={data.client_secret} />
		<Input label="回调地址 (redirect_uri)" bind:value={data.redirect_uri} />
	{/snippet}
</Modal>
