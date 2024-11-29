<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { registerOauth } from '$lib/api/user';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';

	const { data } = $props();
	const {
		/** OAUTH注册信息*/
		jwt,
		/** OAUTH注册姓名*/
		name,
		/** OAUTH提供商*/
		provider
	} = data;

	let username = $state(name);
</script>

<section class="flex items-center justify-center px-4 dark:bg-gray-900">
	<div class="w-full max-w-md rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<!-- 页面标题 -->
		<h2 class="mb-6 text-center text-2xl font-bold text-gray-700 dark:text-gray-100">
			从 {provider} 注册
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
			bind:value={username}
		/>

		<Button
			class="w-full py-3 font-semibold"
			onclick={async () => {
				const ok = await registerOauth(username, jwt);
				if (ok) goto('/', { invalidateAll: true });
			}}
		>
			注册
		</Button>
	</div>
</section>
