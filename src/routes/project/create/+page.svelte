<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { createProject } from '$lib/api/project';
	import {
		getClinkByProjectId,
		getSlinkByProjectName,
		maxProjectDescriptionLength,
		validateProjectName,
		Visibility,
		whyInvalidProjectName,
	} from '$lib/common/project';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import Radio from '$lib/components/Form/Radio.svelte';
	import Textarea from '$lib/components/Form/Textarea.svelte';
	import { addNotification } from '$lib/components/Notifications/NotificationList.svelte';
	import * as m from '$lib/paraglide/messages';

	let projectName = $state('');
	let projectNameInvalid = $state(false);
	let projectDescription = $state('');
	let projectDescriptionInvalid = $state(false);
	let visibility: (typeof Visibility._keys)[number] = $state(Visibility.public.name); // 公开/私有
	let projectLink = $derived(
		!projectNameInvalid && projectName.trim()
			? `${$page.url.origin}${getSlinkByProjectName(projectName)}`
			: '',
	);

	let loading = $state(false);

	async function create() {
		if (loading) return;
		loading = true;
		try {
			const project_id = await createProject(projectName, projectDescription, visibility);
			if (project_id) {
				addNotification({
					title: m.page_project_create__success_title(),
					message: m.page_project_create__success_message({ name: projectName }),
					type: 'success',
					icon: true,
					showClose: true,
				});
				goto(getClinkByProjectId(project_id));
			}
		} finally {
			loading = false;
		}
	}
</script>

<section class="flex items-center justify-center px-4 dark:bg-gray-900">
	<div class="w-full max-w-2xl rounded-lg bg-white p-8 shadow-lg dark:bg-gray-800">
		<!-- 页面标题 -->
		<h1 class="mb-8 text-center text-3xl font-semibold text-gray-800 dark:text-gray-100">
			{m.page_project_create__title()}
		</h1>

		<!-- 项目名称 -->
		<div class="mb-6">
			<Input
				label={m.page_project_create__name_label()}
				placeholder={m.page_project_create__name_placeholder()}
				required
				inputClass="px-4 py-2 w-full text-base"
				bind:value={projectName}
				bind:invalid={projectNameInvalid}
				checker={validateProjectName}
				hint={projectNameInvalid ? whyInvalidProjectName(projectName) : undefined}
			/>
			{#if !projectNameInvalid && projectLink}
				<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
					{m.page_project_create__slink()}
					<a class="text-blue-600 dark:text-blue-400" href={projectLink} target="_blank">
						{projectLink}
					</a>
				</p>
			{/if}
		</div>

		<!-- 项目描述 -->
		<div class="mb-6">
			<Textarea
				bind:value={projectDescription}
				bind:invalid={projectDescriptionInvalid}
				label={m.page_project_create__desc_label()}
				placeholder={m.page_project_create__desc_placeholder()}
				required
				inputClass="w-full px-4 py-2 h-32"
				maxlength={maxProjectDescriptionLength}
			/>
		</div>

		<!-- 可见性选择 -->

		<div class="mb-6">
			<Radio
				label={m.page_project_create__visibility_label()}
				bind:value={visibility}
				options={Visibility._toOptions()}
			/>
			<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">
				{#if visibility === 'private'}
					{m.page_project_create__visibility_private()}
				{:else if visibility === 'public'}
					{m.page_project_create__visibility_public()}
				{/if}
			</p>
		</div>

		<!-- 提交按钮 -->
		<div class="text-center">
			<Button
				disabled={projectNameInvalid || projectDescriptionInvalid || loading}
				class="w-full rounded-lg py-3 font-semibold shadow-md focus:outline-none focus:ring-2 {loading
					? 'loading'
					: undefined}"
				onclick={create}
			>
				{m.page_project_create__btn_create()}
			</Button>
		</div>
	</div>
</section>

<style>
	/* 响应式调整 */
	@media (max-width: 768px) {
		section {
			padding: 4rem 2rem;
		}

		.max-w-2xl {
			max-width: 100%;
		}
	}
</style>
