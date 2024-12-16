<script lang="ts">
	import { updateProject } from '$lib/api/project.js';
	import {
		validateProjectDesc,
		validateProjectName,
		Visibility,
		whyInvalidProjectDesc,
		whyInvalidProjectName,
	} from '$lib/common/project';
	import EditInput from '$lib/components/Form/EditInput.svelte';
	import { addNotification } from '$lib/components/Notifications/NotificationList.svelte';
	import type { EditData } from '../../../api/project/edit/basic/+server.js';
	import deepcopy from 'deepcopy';
	import VersionCmpEdit from './VersionCmpEdit.svelte';
	import LinksEdit from './LinksEdit.svelte';
	import TagsEdit from './TagsEdit.svelte';

	const { data } = $props();
	const { proj, tags } = data.project;

	const defaultData: Required<EditData> = $state({
		name: proj.name,
		desc: proj.desc,
		visibility: Visibility._toKey(proj.visibility),
		versionCmp: proj.versionCmp,
		links: proj.links,
		tags: tags,
	});

	let editData = $state(deepcopy(defaultData));

	let submitting = $state(false);

	async function submit(field: keyof EditData) {
		console.log('submitField', field, editData[field], defaultData[field]);
		if (submitting) return;
		if (editData[field] === defaultData[field]) return;
		submitting = true;
		try {
			const data: EditData = {};
			data[field] = editData[field] as any;

			const ret = await updateProject(proj.id, data);
			if (ret) {
				addNotification({
					title: '修改成功',
					message: '修改项目信息成功',
					type: 'success',
					icon: true,
				});
			}
			if (ret !== null) {
				(defaultData as any)[field] = deepcopy(editData[field]);

				if (field === 'name') {
					// TODO: 找到一种方法, 刷新+layout.server.ts的数据, 以便于Navbar上的名字可以刷新
					// location.reload(); // 高延时、画面闪烁
					// const thisPage = window.location.pathname + window.location.hash + window.location.search;
					// goto(thisPage, { replaceState: true, invalidateAll: true });// 无效
					// goto('.', { invalidateAll: true }).then(() => goto(thisPage));// 画面闪烁
				}
			}
		} finally {
			submitting = false;
		}
	}
</script>

<section class="mx-auto flex min-h-full max-w-4xl flex-col">
	<h1 class="mb-4 text-3xl font-bold">{defaultData.name}</h1>
	<div class="mb-6 mt-6">
		<h3 class="mb-4 text-2xl font-bold">基础设置</h3>
		<div class="flex flex-col gap-6">
			<EditInput
				label="项目名称"
				placeholder="请输入项目名称"
				default={defaultData.name}
				bind:value={editData.name}
				checker={validateProjectName}
				errHint={whyInvalidProjectName(editData.name)}
				editHint="修改项目名称将导致短链接'/p/{proj.name}'失效, 但id链接不变"
				onclick={() => submit('name')}
			/>

			<EditInput
				label="项目描述"
				placeholder="请输入项目描述"
				default={defaultData.desc}
				bind:value={editData.desc}
				checker={validateProjectDesc}
				errHint={whyInvalidProjectDesc(editData.desc)}
				onclick={() => submit('desc')}
			/>

			<EditInput
				label="项目可见性"
				placeholder="请输入项目可见性"
				default={Visibility._toKey(defaultData.visibility)}
				bind:value={editData.visibility}
				options={Visibility._toOptions()}
				showAllOptions
				onclick={() => submit('visibility')}
			/>
		</div>
	</div>

	<hr />
	<div class="mb-6 mt-6">
		<h3 class="mb-4 text-2xl font-bold">版本比较设置</h3>
		<div class="flex flex-col gap-6">
			<VersionCmpEdit
				default={defaultData.versionCmp}
				bind:value={editData.versionCmp}
				onclick={() => submit('versionCmp')}
			/>
		</div>
	</div>

	<hr />
	<div class="mb-6 mt-6">
		<h3 class="mb-4 text-2xl font-bold">项目链接</h3>
		<div class="flex flex-col gap-6">
			<LinksEdit
				default={defaultData.links}
				bind:value={editData.links}
				onclick={() => submit('links')}
			/>
		</div>
	</div>

	<hr />
	<div class="mb-6 mt-6">
		<h3 class="mb-4 text-2xl font-bold">项目标签</h3>
		<div class="flex flex-col gap-6">
			<TagsEdit
				default={defaultData.tags}
				bind:value={editData.tags}
				onclick={() => submit('tags')}
			/>
		</div>
	</div>
</section>

<style>
	hr {
		margin-top: 2rem;
		margin-bottom: 2rem;
	}
</style>
