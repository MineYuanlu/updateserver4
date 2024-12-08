<script lang="ts">
	import type { IAllCount } from '$lib/protos';
	import { onMount, type Snippet } from 'svelte';

	import Tag from './Tag.svelte';
	import { getCnts } from '$lib/api/cnts';
	import { getKey } from '$lib/common/cnts';
	import TimeLine from '$lib/components/Charts/TimeLine.svelte';
	import { browser } from '$app/environment';
	import MultiTimeLine from '$lib/components/Charts/MultiTimeLine.svelte';
	import Pie from '$lib/components/Charts/Pie.svelte';
	import { Gear, Link2, Person } from 'radix-icons-svelte';
	import { addNotification } from '$lib/components/Notifications/NotificationList.svelte';
	import * as m from '$lib/paraglide/messages';
	import { getSlinkByProjectName } from '$lib/common/project';
	import { copyToClipboard } from '$lib/components/Global/clipboard';
	import MenuPlain from '$lib/components/Menu/MenuPlain.svelte';
	import MenuItem from '$lib/components/Menu/MenuItem.svelte';
	import { setSettings } from '$lib/stores/common';
	import type { ToggleFunc } from '$lib/components/base/Openable.svelte';
	import type { ProjectDetailResp } from './+layout.server';

	const { project, children }: { project: ProjectDetailResp; children: Snippet } = $props();
	setSettings(settings);
</script>

{#snippet settings(toggleMenu: ToggleFunc)}
	<MenuPlain title>项目</MenuPlain>
	<MenuItem onclick={() => {}}>
		{#snippet icon()}
			<Person />
		{/snippet}
		人员管理
	</MenuItem>
	<MenuItem onclick={() => {}}>
		{#snippet icon()}
			<Person />
		{/snippet}
		人员管理
	</MenuItem>
{/snippet}
<section class="min-h-screen bg-gray-50 px-4 py-16 dark:bg-gray-900">
	<div class="mx-auto max-w-7xl space-y-12">
		<!-- 页面标题和描述 -->
		<div class="text-center">
			<h1 class="mb-2 text-4xl font-bold text-gray-800 dark:text-gray-100">
				{project.proj.name}
				<Link2
					class="inline-block h-7 w-7 cursor-pointer hover:text-blue-600 dark:hover:text-blue-400"
					onclick={async () => {
						const slink = location.origin + getSlinkByProjectName(project.proj.name);
						const ok = await copyToClipboard(slink);
						if (ok)
							addNotification({
								title: m.page_project_detail__copy_slink_title(),
								message: m.page_project_detail__copy_slink_message(),
								type: 'success',
								icon: true,
							});
					}}
				/>
			</h1>
			<p class="text-lg text-gray-600 dark:text-gray-300">{project.proj.desc}</p>
		</div>
		{@render children()}
	</div>
</section>

<style>
	/* 样式调整 */
	section {
		background-color: #f7fafc; /* 轻微浅色背景 */
	}

	h1 {
		line-height: 1.2;
	}

	/* 响应式调整 */
	@media (max-width: 1024px) {
		.max-w-7xl {
			max-width: 100%;
		}
	}
</style>
