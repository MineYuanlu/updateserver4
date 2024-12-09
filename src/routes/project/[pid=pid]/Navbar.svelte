<script lang="ts">
	import { setNavBar } from '$lib/stores/common';
	import { page } from '$app/stores';
	import { type ProjId, UserRole } from '$lib/common/project';
	import {
		page_project_detail__navbar_back as mnv_back,
		page_project_detail__navbar_settings as mnv_settings,
		page_project_detail__navbar_members_manage as mnv_members_m,
		page_project_detail__navbar_members_list as mnv_members_l,
		page_project_detail__navbar_robots as mnv_robots,
		page_project_detail__navbar_cnts as mnv_cnts,
		page_project_detail__navbar_versions_manage as mnv_versions_m,
		page_project_detail__navbar_versions_list as mnv_versions_l,
		page_project_detail__navbar_user_role,
	} from '$lib/paraglide/messages';
	import { getRealPath, type i18nMsgFunc } from '$lib/i18n';
	import { Icon, type IconSource } from '@steeze-ui/svelte-icon';
	import { Gear, Person, Reset, Rocket } from '@steeze-ui/radix-icons';
	import { ChartPie, Lifebuoy } from '@steeze-ui/heroicons';
	import type { EnumItem, EnumVal } from '$lib/common/enum';
	import { getMenuItems } from './menus';

	const {
		name,
		id,
		role,
	}: {
		name: string;
		id: ProjId;
		role?: EnumVal<typeof UserRole>;
	} = $props();
	const roleDesc = $derived(UserRole._toDesc(role));

	const link = $derived(`/project/${id}`);

	setNavBar(navbar);

	const nowPath = $derived(getRealPath($page.url.pathname));
</script>

{#snippet navbar()}
	<div class="mb-6 flex w-full flex-col items-center space-y-2 overflow-hidden">
		<span class="w-full overflow-hidden text-lg font-semibold text-gray-900 dark:text-gray-100">
			{name}
		</span>
		{#if roleDesc}
			<span class="w-full text-sm text-gray-500 dark:text-gray-400">
				{page_project_detail__navbar_user_role({ role: roleDesc })}
			</span>
		{/if}
	</div>

	<!-- 导航列表 -->
	<ul class="space-y-2">
		{#each getMenuItems(id, role) as item}
			{#if item}
				{@const { name, href, icon } = item}
				{#if href === undefined}
					<!-- title -->
					<li class="text-sm font-medium text-gray-500 dark:text-gray-400">{name()}</li>
				{:else}
					{@const isNow = nowPath === href}
					<li>
						<a
							{href}
							class="group flex items-center gap-3 rounded-md px-3 py-2 transition-colors duration-200 hover:text-blue-600 dark:hover:text-blue-400"
							class:hover:bg-blue-100={!isNow}
							class:hover:dark:bg-gray-800={!isNow}
							class:bg-blue-200={isNow}
							class:font-medium={isNow}
							class:text-gray-700={!isNow}
							class:text-blue-600={isNow}
							class:dark:text-gray-300={!isNow}
							class:dark:text-blue-400={isNow}
							class:dark:bg-blue-900={isNow}
						>
							{#if icon}
								<Icon src={icon} class="h-5 w-5" />
							{/if}
							<span class="truncate">{name()}</span>
						</a>
					</li>
				{/if}
			{:else if item === null}
				<hr class="my-2 border-gray-200 dark:border-gray-700" />
			{/if}
		{/each}
	</ul>
{/snippet}
