<script lang="ts">
	import type { IAllCount } from '$lib/protos';
	import { onMount } from 'svelte';

	// 项目数据（此部分为模拟数据，实际情况需要从后端获取）

	import Tag from './Tag.svelte';
	import { getCnts } from '$lib/api/cnts';
	import { getKey } from '$lib/common/cnts';
	import TimeLine from '$lib/components/Charts/TimeLine.svelte';
	import { browser } from '$app/environment';
	import MultiTimeLine from '$lib/components/Charts/MultiTimeLine.svelte';
	import Pie from '$lib/components/Charts/Pie.svelte';
	import { getClinkByProjectId } from '$lib/common/project';
	import MenuPlain from '$lib/components/Menu/MenuPlain.svelte';
	import MenuItem from '$lib/components/Menu/MenuItem.svelte';
	import { setSettings } from '$lib/stores/common';
	import type { ToggleFunc } from '$lib/components/base/Openable.svelte';
	import Common from './Common.svelte';
	import { ExternalLink, Gear, Person } from '@steeze-ui/radix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';

	const { data } = $props();
	const project1 = data.project;
	const role = data.role;
	let project = {
		title: '更新支持平台',
		description: '这是一个专门为开发者提供小型应用更新管理与支持的平台。',
		currentVersion: 'v2.4.1',
		usageStats: {
			activeUsers: 532,
			requestsPerMinute: 1023,
			memoryUsage: '2.4 GB',
			uptime: '99.9%',
		},
		versions: [
			{ version: 'v2.4.0', date: '2024-10-15', description: '优化性能，修复已知 bug' },
			{ version: 'v2.3.5', date: '2024-09-30', description: '增加新功能，改进 UI' },
			{ version: 'v2.3.0', date: '2024-08-20', description: '推出 API 支持' },
		],
		stats: {
			totalDownloads: 13456,
			totalUsers: 2100,
			lastDeploy: '2024-10-12 14:30',
			repository: 'https://github.com/updateserver/project',
		},
	};
	let cntsVisit: IAllCount | null = $state(null);
	onMount(() => {
		getCnts(getKey(project1.proj.id, 'v')).then((cnt) => {
			cntsVisit = cnt;
		});
	});

	const baseUrl = $derived(getClinkByProjectId(project1.proj.id));

	setSettings(settings);
</script>

{#snippet settings(toggleMenu: ToggleFunc)}
	<MenuPlain title>项目</MenuPlain>
	<MenuItem icon={Person} onclick={() => {}}>人员管理</MenuItem>
	<MenuItem icon={Person} onclick={() => {}}>人员管理</MenuItem>
{/snippet}

<!-- <pre>{JSON.stringify(project1, null, 2)}</pre> -->
<!-- <pre>{JSON.stringify(cntsVisit, null, 2)}</pre> -->
<Common project={project1}>
	<!-- 统计信息模块 -->
	<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
		<!-- 版本历史模块 -->
		<div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
			<h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">当前版本</h3>
			<a
				class="inline-block w-full text-lg text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
				href="{baseUrl}/versions?version={project.currentVersion}"
			>
				{project.currentVersion}
			</a>
			<a href="{baseUrl}/versions" data-sveltekit-noscroll>
				<h3
					class="mb-4 mt-4 flex justify-between text-xl font-semibold text-gray-800 dark:text-gray-100"
				>
					<span>版本列表</span>
					<Icon src={ExternalLink} class="h-5 w-5" />
				</h3>
			</a>
			<ul class="space-y-4 text-gray-600 dark:text-gray-300">
				{#each project.versions as version}
					<li>
						<a
							href="{baseUrl}/versions?version={version.version}"
							class="hover:text-gray-800 dark:hover:text-gray-100"
						>
							<div class="flex justify-between">
								<span>{version.version}</span>
								<span class="text-sm text-gray-500 dark:text-gray-400">{version.date}</span>
							</div>
							<p class="mt-1 text-sm">{version.description}</p>
						</a>
					</li>
				{/each}
			</ul>
		</div>

		<div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
			<h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">实时使用量</h3>
			<ul class="space-y-2 text-gray-600 dark:text-gray-300">
				<li>活跃用户：{project.usageStats.activeUsers}</li>
				<li>每分钟请求：{project.usageStats.requestsPerMinute}</li>
				<li>内存使用：{project.usageStats.memoryUsage}</li>
				<li>正常运行时间：{project.usageStats.uptime}</li>
			</ul>
		</div>

		<!-- 当前版本模块 -->
		<div class="relative rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
			<a href="{baseUrl}/settings" data-sveltekit-noscroll class="absolute right-6 top-6">
				<Icon src={Gear} class="h-5 w-5" />
			</a>
			<h3 class="mb-2 text-xl font-semibold text-gray-800 dark:text-gray-100">所有者</h3>
			<p class="text-lg text-gray-600 dark:text-gray-300">
				<a href="/user/{project1.proj.oid}">
					{project1.proj.owner}
				</a>
			</p>
			<h3 class="mb-2 mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">创建时间</h3>
			<p class="text-lg text-gray-600 dark:text-gray-300">
				{project1.proj.createdAt ? new Date(project1.proj.createdAt).toLocaleString() : ''}
			</p>
			{#if project1.tags.length > 0}
				<h3 class="mb-2 mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">标签</h3>
				<p class="text-lg text-gray-600 dark:text-gray-300">
					{#each project1.tags as tag}
						<Tag children={tag} href="/tag/{tag}" />
					{/each}
				</p>
			{/if}
			{#if Object.keys(project1.proj.links).length > 0}
				<h3 class="mb-2 mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">链接</h3>
				<p class="text-lg text-gray-600 dark:text-gray-300">
					{#each Object.entries(project1.proj.links) as [name, link]}
						<Tag children={name} href={link} target="_blank" />
					{/each}
				</p>
			{/if}
		</div>
	</div>

	{#if browser}
		{#await getCnts(getKey(project1.proj.id, 'v')) then cntsVisit}
			{#await getCnts(getKey(project1.proj.id, 'd')) then cntsDownload}
				{#if cntsVisit && cntsDownload}
					<MultiTimeLine datas={[cntsVisit, cntsDownload]} title="" />
					<TimeLine data={cntsVisit} title="活跃用户" />
					<TimeLine data={cntsDownload} title="下载次数" />
				{/if}
			{/await}
		{/await}
	{/if}
	<Pie />

	<!-- {#if cntsVisit}
			<TimeLine data={cntsVisit} />
		{/if} -->

	<!-- 统计信息 -->
	<div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
		<h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">全部统计信息</h3>
		<div class="space-y-4 text-gray-600 dark:text-gray-300">
			<p><strong>总下载次数：</strong>{project.stats.totalDownloads}</p>
			<p><strong>总用户数：</strong>{project.stats.totalUsers}</p>
			<p><strong>上次部署：</strong>{project.stats.lastDeploy}</p>
			<p>
				<strong>代码仓库：</strong><a
					href={project.stats.repository}
					target="_blank"
					class="text-teal-600 hover:text-teal-800">{project.stats.repository}</a
				>
			</p>
		</div>
	</div>
</Common>

<style>
	h3 {
		line-height: 1.2;
	}
</style>
