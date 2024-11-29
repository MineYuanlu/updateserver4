<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { loginOauthCallback } from '$lib/api/user';
	import { onMount } from 'svelte';

	// /api/user/oauth/login/${provider_name}/callback

	const provider = $page.params.provider;

	let failed = $state(false);

	onMount(async () => {
		console.log('oauth callback', Object.fromEntries($page.url.searchParams.entries()));
		const resp = await loginOauthCallback(
			provider,
			Object.fromEntries($page.url.searchParams.entries())
		);
		if (resp === true) {
			//成功登录
			goto('/', { invalidateAll: true });
		} else if (resp) {
			//新用户注册
			const search = new URLSearchParams();
			search.set('jwt', resp.jwt);
			search.set('name', resp.name);
			goto(`/user/login/oauth/${provider}/register?${search}`);
		} else {
			//失败
			failed = true;
		}
	});
</script>

{#if !failed}
	授权成功, 正在登录到 {provider} 中...
{:else}
	<!-- 使用tailwindcss绘制一个失败提示信息 -->
	<div class="rounded-md bg-red-500 p-4 text-white">
		<p>授权失败, 请检查您的网络连接或重新尝试。</p>
	</div>
{/if}
