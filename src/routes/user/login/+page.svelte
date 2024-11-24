<script lang="ts">
	import Button from '$lib/components/Form/Button.svelte';
	import Divider from '$lib/components/Form/Divider.svelte';
	import Input from '$lib/components/Form/Input.svelte';

	let username = '';
	let password = '';
	let captcha = '';
	const thirdPartyProviders = [
		{ name: 'Google', logo: '/icons/google.svg', action: () => console.log('Login with Google') },
		{ name: 'GitHub', logo: '/icons/github.svg', action: () => console.log('Login with GitHub') }
	];

	const handleLogin = () => {
		console.log('Logging in with', { username, password, captcha });
	};

	const handleRegister = () => {
		console.log('Navigating to registration page');
	};
</script>

<section class="flex items-center justify-center px-4 dark:bg-gray-900">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<!-- 页面标题 -->
		<h2 class="mb-6 text-center text-2xl font-bold text-gray-700 dark:text-gray-100">
			登录到您的账户
		</h2>

		<!-- 用户名输入框 -->

		<Input
			id="username"
			name="username"
			type="text"
			placeholder="请输入用户名"
			label="用户名"
			class="mb-4"
			inputClass="w-full py-3"
		/>
		<Input
			id="password"
			name="password"
			type="password"
			placeholder="请输入密码"
			label="密码"
			class="mb-4"
			inputClass="w-full py-3"
		/>

		<div class="mb-4 grid grid-cols-2 gap-4">
			<Button class="w-full py-3 font-semibold">登录</Button>
			<Button class="w-full py-3 font-semibold">注册</Button>
		</div>

		<!-- 登录按钮 -->
		<button
			on:click={handleLogin}
			class="mb-4 w-full rounded-lg bg-blue-500 py-3 font-semibold text-white shadow-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-400"
		>
			登录
		</button>

		<!-- 注册按钮 -->
		<button
			on:click={handleRegister}
			class="mb-6 w-full rounded-lg bg-gray-200 py-3 font-semibold text-gray-800 shadow-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
		>
			注册
		</button>

		<!-- 第三方登录 -->
		<Divider text="第三方登录" />
		<div class="flex justify-center space-x-4">
			{#each thirdPartyProviders as provider}
				<button
					on:click={provider.action}
					class="flex items-center rounded-lg bg-gray-100 px-4 py-2 text-gray-700 shadow hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
				>
					<img src={provider.logo} alt={provider.name} class="mr-2 h-5 w-5" />
					{provider.name}
				</button>
			{/each}
		</div>
	</div>
</section>
