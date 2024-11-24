<script lang="ts">
	import { i18n } from '$lib/i18n';
	import { ParaglideJS } from '@inlang/paraglide-sveltekit';
	import '../app.css';
	import {
		Moon as MoonIcon,
		Sun as SunIcon,
		Person as PersonIcon,
		Exit as ExitIcon,
		Gear as GearIcon,
		Globe as GlobeIcon
	} from 'radix-icons-svelte';
	import { menus } from './menu';
	import * as m from '$lib/paraglide/messages.js';
	import { navbar } from '$lib/stores/common';
	import IconBtn from '$lib/components/Icons/IconBtn.svelte';
	import CombineIcon from '$lib/components/Icons/CombineIcon.svelte';
	import Menu from '$lib/components/Menu/Menu.svelte';
	import MenuDivider from '$lib/components/Menu/MenuDivider.svelte';
	import MenuPlain from '$lib/components/Menu/MenuPlain.svelte';
	import MenuItem from '$lib/components/Menu/MenuItem.svelte';
	import { goto } from '$app/navigation';
	import LanguageSelect from './LanguageSelect.svelte';
	import { slide } from 'svelte/transition';

	let { children, data } = $props();

	let isDarkMode = $state(false);

	const toggleTheme = () => {
		isDarkMode = !isDarkMode;
	};
	let html_element: HTMLBodyElement;
	$effect(() => {
		html_element.classList.toggle('dark', isDarkMode);
	});

	let settingMenuOpen = $state(false);
	let languageSelectOpen = $state(false);
</script>

<svelte:body bind:this={html_element} />

<ParaglideJS {i18n}>
	<div class="flex h-screen flex-col">
		<!-- Header -->
		<header
			class="flex items-center justify-between border-b bg-gray-100 p-4 dark:border-gray-700 dark:bg-gray-900"
		>
			<!-- 左侧网站标题 -->
			<a class="text-xl font-bold text-gray-800 dark:text-gray-100" href="/">{m.name()}</a>

			<!-- 中间导航 -->
			<nav class="hidden space-x-6 md:flex">
				{#each menus as menu}
					<a
						href={menu.path}
						class="text-gray-600 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
					>
						{menu.name()}
					</a>
				{/each}
			</nav>

			<!-- 右侧按钮 -->
			<div class="flex items-center space-x-4">
				<Menu>
					{#snippet controls(toggleMenu)}
						<IconBtn icon={PersonIcon} content={data.user?.name} onclick={() => toggleMenu()} />
					{/snippet}
					<MenuPlain title>用户</MenuPlain>
					<MenuItem onclick={() => goto(`/user/${data.user?.id}`)}>
						{#snippet icon()}<PersonIcon />{/snippet}
						个人中心
					</MenuItem>
					<MenuItem onclick={() => goto('/logout')}>
						{#snippet icon()}<ExitIcon />{/snippet}
						登出
					</MenuItem>
				</Menu>
				<Menu bind:open={settingMenuOpen}>
					{#snippet controls(toggleMenu)}
						<IconBtn icon={GearIcon} onclick={() => toggleMenu()} />
					{/snippet}
					<MenuPlain title>设置</MenuPlain>
					<MenuItem onclick={toggleTheme}>
						{#snippet icon(hover)}
							{#if hover}
								<CombineIcon
									icons={[
										[MoonIcon, 'rt'],
										[SunIcon, 'lb']
									]}
									padding={15}
								/>
							{:else if isDarkMode}
								<MoonIcon />
							{:else}
								<SunIcon />
							{/if}
						{/snippet}
						切换主题
					</MenuItem>
					<MenuItem
						onclick={() => {
							settingMenuOpen = false;
							languageSelectOpen = true;
						}}
					>
						{#snippet icon()}<GlobeIcon />{/snippet}
						语言: {m.messages()}
					</MenuItem>
				</Menu>
			</div>
		</header>

		<!-- 主体内容部分 -->
		<div class="flex flex-grow">
			{#if $navbar}
				<!-- 左侧 Navbar -->
				<aside
					class="hidden w-64 border-r bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:block"
					transition:slide={{ duration: 100, axis: 'x' }}
				>
					{@render $navbar()}
					<!-- <ul class="space-y-4">
						<li>
							<a
								href="#"
								class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
								>导航 1</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
								>导航 2</a
							>
						</li>
						<li>
							<a
								href="#"
								class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
								>导航 3</a
							>
						</li>
					</ul> -->
				</aside>
			{/if}

			<!-- 主体内容 -->
			<main class="flex-grow bg-white p-6 dark:bg-gray-900 dark:text-gray-100">
				{@render children()}
			</main>
		</div>

		<!-- Footer -->
		<footer
			class="border-t bg-gray-100 p-4 text-center text-gray-600 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400"
		>
			{m.copyright()}
		</footer>
	</div>

	<LanguageSelect bind:open={languageSelectOpen} />
</ParaglideJS>

<style>
	:global(html) {
		scroll-behavior: smooth;
	}
</style>
