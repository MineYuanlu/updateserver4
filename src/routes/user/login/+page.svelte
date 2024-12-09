<script lang="ts">
	import { browser, dev } from '$app/environment';
	import { goto } from '$app/navigation';
	import { getOauthProviderList, loginOauth, loginUser, registerUser } from '$lib/api/user';
	import { getIcon } from '$lib/common/oauth';
	import Button from '$lib/components/Form/Button.svelte';
	import Divider from '$lib/components/Form/Divider.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import { addNotification } from '$lib/components/Notifications/NotificationList.svelte';
	import {
		page_user_login__title as title,
		page_user_login__username_label as username_label,
		page_user_login__username_placeholder as username_placeholder,
		page_user_login__password_label as password_label,
		page_user_login__password_placeholder as password_placeholder,
		page_user_login__btn_login as btn_login,
		page_user_login__btn_register as btn_register,
		page_user_login__btn_oauth as btn_oauth,
		page_user_login__login_success_title as login_success_title,
		page_user_login__login_success_message as login_success_message,
		page_user_login__register_success_title as register_success_title,
		page_user_login__register_success_message as register_success_message,
	} from '$lib/paraglide/messages';
	import { Icon } from '@steeze-ui/svelte-icon';

	let username = $state('');
	let password = $state('');

	const handleLogin = async () => {
		const _username = username;
		const _password = password;
		if (await loginUser(_username, _password)) {
			addNotification({
				title: login_success_title(),
				message: login_success_message({ username: _username }),
				type: 'success',
			});
			goto('/', { invalidateAll: true });
		}
	};

	const handleRegister = async () => {
		const _username = username;
		const _password = password;
		if (await registerUser(_username, _password)) {
			addNotification({
				title: register_success_title(),
				message: register_success_message({ username: _username }),
				type: 'success',
			});
			goto('/', { invalidateAll: true });
			//TODO: 注册成功后跳转到引导页
		}
	};
</script>

<section class="flex min-h-full flex-col items-center justify-center px-4 py-16">
	<div class="w-full max-w-lg rounded-lg bg-white p-8 text-center shadow-lg dark:bg-gray-800">
		<!-- 页面标题 -->
		<h2 class="mb-6 text-center text-2xl font-bold text-gray-700 dark:text-gray-100">
			{title()}
		</h2>

		<!-- 用户名输入框 -->

		<Input
			id="username"
			name="username"
			type="text"
			placeholder={username_placeholder()}
			label={username_label()}
			class="mb-4"
			inputClass="w-full py-3"
			bind:value={username}
		/>
		<Input
			id="password"
			name="password"
			type="password"
			placeholder={password_placeholder()}
			label={password_label()}
			class="mb-4"
			inputClass="w-full py-3"
			bind:value={password}
		/>

		<div class="mb-4 grid grid-cols-2 gap-4">
			<Button
				class="w-full py-3 font-semibold"
				onclick={handleLogin}
				disabled={!username || !password}
			>
				{btn_login()}
			</Button>
			<Button
				class="w-full py-3 font-semibold"
				onclick={handleRegister}
				disabled={!username || !password}
			>
				{btn_register()}
			</Button>
		</div>

		<!-- 第三方登录 -->
		{#if browser}
			{#await getOauthProviderList() then providers}
				{#if providers.length > 0}
					<Divider text={btn_oauth()} />
					<div class="flex justify-center space-x-4">
						{#each providers as { name, type }}
							{@const icon = getIcon(type)}
							<Button
								class="flex w-full items-center justify-center rounded-lg px-4  py-3 text-center font-semibold "
								color="white"
								onclick={async () => {
									const url = await loginOauth(name);
									if (dev) console.log('Redirecting to', url);
									if (url) window.open(url, '_blank');
								}}
							>
								{#if icon}
									<Icon src={icon} class="mr-2 h-5 w-5" />
								{/if}
								<span>{name}</span>
							</Button>
						{/each}

						<!-- {#each thirdPartyProviders as provider}
				<button
					on:click={provider.action}
					class="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					<img src={provider.logo} alt={provider.name} class="mr-2 h-5 w-5" />
					{provider.name}
				</button>
			{/each} -->
					</div>
				{/if}
			{/await}
		{/if}
	</div>
</section>
