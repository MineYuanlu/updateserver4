<script lang="ts">
	import '../app.css';
	import {
		Moon as MoonIcon,
		Sun as SunIcon,
		Person as PersonIcon,
		Exit as ExitIcon,
		Gear as GearIcon,
		Globe as GlobeIcon
	} from 'radix-icons-svelte';
	import * as m from '$lib/paraglide/messages.js';
	import IconBtn from '$lib/components/Icons/IconBtn.svelte';
	import CombineIcon from '$lib/components/Icons/CombineIcon.svelte';
	import Menu from '$lib/components/Menu/Menu.svelte';
	import MenuPlain from '$lib/components/Menu/MenuPlain.svelte';
	import MenuItem from '$lib/components/Menu/MenuItem.svelte';
	import { menus } from './menu';
	import LanguageSelect from './LanguageSelect.svelte';
	import type { UserSession } from '$lib/common/user';
	import { COOKIES } from '$lib/common/cookies';

	let {
		user,
		theme = $bindable()
	}: {
		user?: UserSession | null;
		theme?: string | null;
	} = $props();

	let isDarkMode = $state(theme === 'dark');

	const toggleTheme = () => {
		isDarkMode = !isDarkMode;
	};
	$effect(() => {
		theme = isDarkMode ? 'dark' : 'light';
		document.cookie = `${COOKIES.Theme}=${theme}; path=/; max-age=31536000`;
	});

	let settingMenuOpen = $state(false);
	let languageSelectOpen = $state(false);
</script>

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
				<IconBtn icon={PersonIcon} content={user?.name} onclick={() => toggleMenu()} />
			{/snippet}
			<MenuPlain title>{m.header_user_title()}</MenuPlain>
			{#if user?.id}
				<MenuItem href="/user/{user.id}">
					{#snippet icon()}<PersonIcon />{/snippet}
					{m.header_user_center()}
				</MenuItem>
				<MenuItem href="/user/logout">
					{#snippet icon()}<ExitIcon />{/snippet}
					{m.header_user_logout()}
				</MenuItem>
			{:else}
				<MenuItem href="/user/login">
					{#snippet icon()}<PersonIcon />{/snippet}
					{m.header_user_login()}
				</MenuItem>
				<MenuItem href="/user/register">
					{#snippet icon()}<PersonIcon />{/snippet}
					{m.header_user_register()}
				</MenuItem>
			{/if}
		</Menu>
		<Menu bind:open={settingMenuOpen}>
			{#snippet controls(toggleMenu)}
				<IconBtn icon={GearIcon} onclick={() => toggleMenu()} />
			{/snippet}
			<MenuPlain title>{m.header_settings_title()}</MenuPlain>
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
				{m.header_settings_theme()}
			</MenuItem>
			<MenuItem
				onclick={() => {
					settingMenuOpen = false;
					languageSelectOpen = true;
				}}
			>
				{#snippet icon()}<GlobeIcon />{/snippet}
				{m.header_settings_language({ language: m.messages() })}
			</MenuItem>
		</Menu>
	</div>
</header>

<LanguageSelect bind:open={languageSelectOpen} />
