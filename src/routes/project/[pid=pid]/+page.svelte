<script lang="ts">
	import type { IAllCount } from '$lib/protos';
	import { onMount } from 'svelte';

	// 项目数据（此部分为模拟数据，实际情况需要从后端获取）

	import Tag from './Tag.svelte';
	import { getCnts } from '$lib/api/cnts';
	import { getKey } from '$lib/common/cnts';
	import TimeLine from '$lib/components/Charts/TimeLine.svelte';

	const { data } = $props();
	const project1 = data.project;
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
</script>

<pre>{JSON.stringify(project1, null, 2)}</pre>
<!-- <pre>{JSON.stringify(cntsVisit, null, 2)}</pre> -->
{#if cntsVisit}
	<TimeLine data={cntsVisit} />
{/if}
<section class="min-h-screen bg-gray-50 px-4 py-16 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl space-y-12">
		<!-- 页面标题和描述 -->
		<div class="text-center">
			<h1 class="mb-2 text-4xl font-bold text-gray-800 dark:text-gray-100">{project.title}</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300">{project.description}</p>
		</div>

		<!-- 统计信息模块 -->
		<div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
			<!-- 版本历史模块 -->
			<div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
				<h3 class="mb-4 text-xl font-semibold text-gray-800 dark:text-gray-100">当前版本</h3>
				<p class="text-lg text-gray-600 dark:text-gray-300">{project.currentVersion}</p>
				<h3 class="mb-4 mt-4 text-xl font-semibold text-gray-800 dark:text-gray-100">版本列表</h3>
				<ul class="space-y-4 text-gray-600 dark:text-gray-300">
					{#each project.versions as version}
						<li>
							<div class="flex justify-between">
								<span>{version.version}</span>
								<span class="text-sm text-gray-500 dark:text-gray-400">{version.date}</span>
							</div>
							<p class="mt-1 text-sm">{version.description}</p>
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
			<div class="rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800">
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
	</div>
</section>

<style>
	/* 样式调整 */
	section {
		background-color: #f7fafc; /* 轻微浅色背景 */
	}

	h1,
	h3 {
		line-height: 1.2;
	}

	/* 响应式调整 */
	@media (max-width: 1024px) {
		.max-w-7xl {
			max-width: 100%;
		}
	}
</style>
