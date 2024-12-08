<script lang="ts">
	import { setNavBar } from '$lib/stores/common';
	import { page } from '$app/stores'; // SvelteKit下可用，用于获取当前路径，若非SvelteKit可自行调整
	import { Gear, Person, Reset, Rocket } from 'radix-icons-svelte';
	import AnyIcon from '$lib/components/Icons/AnyIcon.svelte';
	import type { ProjId } from '$lib/common/project';
	import {
		page_project_detail__navbar_back as m_navbar_back,
		page_project_detail__navbar_settings as m_navbar_settings,
		page_project_detail__navbar_members as m_navbar_members,
		page_project_detail__navbar_robots as m_navbar_robots,
		page_project_detail__navbar_cnts as m_navbar_cnts,
		page_project_detail__navbar_versions as m_navbar_versions,
	} from '$lib/paraglide/messages';
	import { getRealPath, type i18nMsgFunc } from '$lib/i18n';
	import ChartPie from '$heroicons/hiChartPieOutline24';
	import Lifebuoy from '$heroicons/hiLifebuoyOutline24';

	const { name, id }: { name: string; id: ProjId } = $props();

	const link = $derived(`/project/${id}`);

	setNavBar(navbar);

	const items: ({ name: i18nMsgFunc; href: string; icon: any } | null)[] = $derived([
		{ name: m_navbar_back, href: link, icon: Reset },
		null,
		{ name: m_navbar_settings, href: `${link}/settings`, icon: Gear },
		{ name: m_navbar_members, href: `${link}/members`, icon: Person },
		{ name: m_navbar_robots, href: `${link}/robots`, icon: Rocket },
		{ name: m_navbar_cnts, href: `${link}/analysis`, icon: ChartPie },
		{ name: m_navbar_versions, href: `${link}/versions`, icon: Lifebuoy },
		null,
	]);

	const nowPath = $derived(getRealPath($page.url.pathname));
</script>

{#snippet navbar()}
	<!-- 顶部Logo区域 -->
	<div class="mb-6 flex items-center space-x-3">
		<!-- 如果有自己的LOGO可以替换这里的Icon或IMG -->
		<span class="text-lg font-semibold text-gray-900 dark:text-gray-100">{name}</span>
	</div>

	<!-- 导航列表 -->
	<ul class="space-y-2">
		{#each items as item}
			{#if item}
				{@const { name, href, icon } = item}
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
						<AnyIcon {icon} class="h-5 w-5" />
						<span class="truncate">{name()}</span>
					</a>
				</li>
			{:else if item === null}
				<hr class="my-2 border-gray-200 dark:border-gray-700" />
			{/if}
		{/each}
	</ul>
{/snippet}
