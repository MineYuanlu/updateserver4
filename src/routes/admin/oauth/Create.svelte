<script lang="ts">
	import { dev } from '$app/environment';
	import { createOauthProvider } from '$lib/api/user';
	import { getIcon, OAuthProviderTypeNames } from '$lib/common/oauth';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import Modal from '$lib/components/Modal/Modal.svelte';
	import { addNotification } from '$lib/components/Notifications/NotificationList.svelte';
	import {
		page_admin_oauth__create_btn as btn_open,
		page_admin_oauth__create_title as title,
		page_admin_oauth__create_name_label as name_label,
		page_admin_oauth__create_name_placeholder as name_placeholder,
		page_admin_oauth__create_type_label as type_label,
		page_admin_oauth__create_type_placeholder as type_placeholder,
		page_admin_oauth__create_description_label as description_label,
		page_admin_oauth__create_description_placeholder as description_placeholder,
		page_admin_oauth__create_client_id_label as client_id_label,
		page_admin_oauth__create_client_id_placeholder as client_id_placeholder,
		page_admin_oauth__create_client_secret_label as client_secret_label,
		page_admin_oauth__create_client_secret_placeholder as client_secret_placeholder,
		page_admin_oauth__create_redirect_uri_label as redirect_uri_label,
		page_admin_oauth__create_redirect_uri_placeholder as redirect_uri_placeholder,
		page_admin_oauth__create_btn_create as btn_create,
		page_admin_oauth__create_btn_cancel as btn_cancel,
		page_admin_oauth__create_success_title as success_title,
		page_admin_oauth__create_success_message as success_message,
	} from '$lib/paraglide/messages';
	import { Icon } from '@steeze-ui/svelte-icon';
	import type { ReqData } from '../../api/user/oauth/providers/create/+server';
	import {
		validateClientId,
		validateClientSecret_Create,
		validateDesc,
		validateName,
		validateRedirectUri,
		validateType,
	} from '../../api/user/oauth/providers/checkers';

	let { createModCount = $bindable() }: { createModCount: number } = $props();

	const defaultData: ReqData = {
		name: '',
		desc: '',
		type: '',
		client_id: '',
		client_secret: '',
		redirect_uri: '',
	};

	let data = $state({ ...defaultData });
	let modalOpen = $state(false);

	function handleConfirm() {
		if (dev) console.info('create oauth provider', data);
		const name = data.name;
		createOauthProvider(data).then((ok) => {
			if (ok) {
				data = { ...defaultData };
				modalOpen = false;
				addNotification({
					title: success_title(),
					message: success_message({ name }),
					type: 'success',
				});
				createModCount++;
			}
		});
		return false;
	}
</script>

<Modal
	title={title()}
	bind:open={modalOpen}
	btns={[
		{ label: btn_create(), color: 'success' },
		{ label: btn_cancel(), color: 'secondary' },
	]}
	onConfirm={handleConfirm}
	onCancel={() => {
		createModCount++;
	}}
>
	{#snippet controls(toggleModal: () => void)}
		<Button color="blue" onclick={() => toggleModal()}>
			{btn_open()}
		</Button>
	{/snippet}
	{#snippet content()}
		<div class="mt-2 grid grid-cols-2 gap-4">
			<Input
				label={name_label()}
				placeholder={name_placeholder()}
				class="w-full"
				checker={validateName}
				bind:value={data.name}
			/>

			<Input
				label={type_label()}
				placeholder={type_placeholder()}
				class="w-full"
				checker={validateType}
				options={OAuthProviderTypeNames}
				bind:value={data.type}
			>
				{#snippet optionSnippet(option)}
					{@const icon = getIcon(option)}
					{#if icon}
						<Icon src={icon} class="mr-2 h-5 w-5" />
					{/if}
					<span>{option}</span>
				{/snippet}
			</Input>
		</div>
		<Input
			label={description_label()}
			placeholder={description_placeholder()}
			class="mt-2 w-full"
			checker={validateDesc}
			bind:value={data.desc}
		/>
		<Input
			label={client_id_label()}
			placeholder={client_id_placeholder()}
			class="mt-2 w-full"
			checker={validateClientId}
			bind:value={data.client_id}
		/>
		<Input
			label={client_secret_label()}
			placeholder={client_secret_placeholder()}
			class="mt-2 w-full"
			checker={validateClientSecret_Create}
			bind:value={data.client_secret}
		/>
		<Input
			label={redirect_uri_label()}
			placeholder={redirect_uri_placeholder()}
			class="mt-2 w-full"
			checker={validateRedirectUri}
			bind:value={data.redirect_uri}
		/>
	{/snippet}
</Modal>
