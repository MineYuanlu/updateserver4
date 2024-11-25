<!-- name, desc, type, client_id, client_secret, redirect_uri  -->

<script lang="ts">
	import { getOauthProviderTypes } from '$lib/api/user';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';
</script>

<Modal
	btns={[
		{ label: '添加', color: 'success' },
		{ label: '取消', color: 'secondary' }
	]}
>
	{#snippet controls(toggleModal)}
		<Button color="blue" onclick={() => toggleModal()}>新增</Button>
	{/snippet}
	{#snippet content(toggleModal)}
		<div class="grid grid-cols-2 gap-4">
			<Input label="登录器名称" class="w-full" />

			{#await getOauthProviderTypes()}
				<Input label="登录器类型" />
			{:then providerTypes}
				<Input label="登录器类型" options={providerTypes} />
			{/await}
		</div>
		<Input label="登录器描述" />
		<Input label="客户端ID (client_id)" />
		<Input label="客户端密钥 (client_secret)" />
		<Input label="回调地址 (redirect_uri)" />
	{/snippet}
</Modal>
