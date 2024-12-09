<script lang="ts">
	import '../app.css';
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
	import { logoutUser } from '$lib/api/user';
	import { goto } from '$app/navigation';
	import type { Settings } from '$lib/stores/common';
	import type { ToggleFunc } from '$lib/components/base/Openable.svelte';
	import { Exit, Gear, Globe, Moon, Person, Sun } from '@steeze-ui/radix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';

	let {
		user,
		theme = $bindable(),
		settings,
	}: {
		user?: UserSession | null;
		theme?: string | null;
		settings: Settings;
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

	const toggleSettingMenu = (v?: boolean) => {
		settingMenuOpen = v ?? !settingMenuOpen;
	};
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
		<!-- 用户菜单 -->
		<Menu>
			{#snippet controls(toggleMenu: ToggleFunc)}
				<IconBtn icon={Person} content={user?.name} onclick={() => toggleMenu()} />
			{/snippet}
			<MenuPlain title>{m.header_user_title()}</MenuPlain>
			{#if user?.id}
				<MenuItem icon={Person} href="/user/{user.id}">
					{m.header_user_center()}
				</MenuItem>
				<MenuItem
					icon={Exit}
					onclick={async () => {
						await logoutUser();
						goto('', { invalidateAll: true });
					}}
				>
					{m.header_user_logout()}
				</MenuItem>
			{:else}
				<MenuItem icon={Person} href="/user/login">
					{m.header_user_login()}
				</MenuItem>
				<MenuItem icon={Person} href="/user/register">
					{m.header_user_register()}
				</MenuItem>
			{/if}
		</Menu>
		<!-- 设置菜单 -->
		<Menu bind:open={settingMenuOpen}>
			{#snippet controls(toggleMenu: ToggleFunc)}
				<IconBtn icon={Gear} onclick={() => toggleMenu()} />
			{/snippet}
			{#if settings}
				{#each Object.values(settings) as setting}
					{@render setting(toggleSettingMenu)}
				{/each}
			{/if}
			<MenuPlain title>{m.header_settings_title()}</MenuPlain>
			<MenuItem onclick={toggleTheme}>
				{#snippet icon(hover)}
					{#if hover}
						<CombineIcon
							icons={[
								[Moon, 'rt'],
								[Sun, 'lb'],
							]}
							padding={15}
						/>
					{:else if isDarkMode}
						<Icon src={Moon} class="h-4 w-4" />
					{:else}
						<Icon src={Sun} class="h-4 w-4" />
					{/if}
				{/snippet}
				{m.header_settings_theme()}
			</MenuItem>
			<MenuItem
				icon={Globe}
				onclick={() => {
					settingMenuOpen = false;
					languageSelectOpen = true;
				}}
			>
				{m.header_settings_language({ language: m.messages() })}
			</MenuItem>
		</Menu>
	</div>
</header>

<LanguageSelect bind:open={languageSelectOpen} />
