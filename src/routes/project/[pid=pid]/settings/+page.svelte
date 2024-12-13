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
	import lodash from 'lodash';
	import type { EditData } from '../../../api/project/edit/basic/+server.js';
	import { goto } from '$app/navigation';
	import VersionCmpEdit from './VersionCmpEdit.svelte';
	import LinksEdit from './LinksEdit.svelte';

	const { data } = $props();
	const { proj, versions, tags } = data.project;

	const defaultData: Required<EditData> = $state({
		name: proj.name,
		desc: proj.desc,
		visibility: Visibility._toKey(proj.visibility),
		versionCmp: proj.versionCmp,
		links: proj.links,
		tags: tags,
	});

	let editData = $state({ ...defaultData });

	let submitting = $state(false);

	async function submitField(field: keyof EditData) {
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
				(defaultData as any)[field] = editData[field];

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

	async function submit() {
		if (submitting) return;
		const data = {} as EditData;
		let edited = false;
		for (const key in editData) {
			if (!lodash.isEqual((editData as any)[key], (defaultData as any)[key])) {
				data[key as keyof typeof editData] = (editData as any)[key];
				edited = true;
			}
		}
		submitting = true;
		try {
			if (edited && (await updateProject(proj.id, data))) {
				addNotification({
					title: '修改成功',
					message: '修改项目信息成功',
					type: 'success',
					icon: true,
				});
			}
		} finally {
			submitting = false;
		}
	}
</script>

<section class="mx-auto flex h-[200vh] min-h-full max-w-3xl flex-col">
	<h1 class="mb-4 text-3xl font-bold">{defaultData.name}</h1>
	<hr />
	<div class="mb-6 mt-4">
		<h3 class="mb-4 text-xl font-bold">基础设置</h3>
		<div class="flex flex-col gap-6">
			<EditInput
				label="项目名称"
				placeholder="请输入项目名称"
				default={defaultData.name}
				bind:value={editData.name}
				checker={validateProjectName}
				errHint={whyInvalidProjectName(editData.name)}
				editHint="修改项目名称将导致短链接'/p/{proj.name}'失效, 但id链接不变"
				onclick={() => submitField('name')}
			/>

			<EditInput
				label="项目描述"
				placeholder="请输入项目描述"
				default={defaultData.desc}
				bind:value={editData.desc}
				checker={validateProjectDesc}
				errHint={whyInvalidProjectDesc(editData.desc)}
				onclick={() => submitField('desc')}
			/>

			<EditInput
				label="项目可见性"
				placeholder="请输入项目可见性"
				default={Visibility._toKey(defaultData.visibility)}
				bind:value={editData.visibility}
				options={Visibility._toOptions()}
				showAllOptions
				onclick={() => submitField('visibility')}
			/>
		</div>
	</div>

	<hr />
	<div class="mb-6 mt-4">
		<h3 class="mb-4 text-xl font-bold">版本比较设置</h3>
		<div class="flex flex-col gap-6">
			<VersionCmpEdit
				default={defaultData.versionCmp}
				bind:value={editData.versionCmp}
				onclick={() => submitField('versionCmp')}
			/>
		</div>
	</div>

	<hr />
	<div class="mb-6 mt-4">
		<h3 class="mb-4 text-xl font-bold">项目链接</h3>
		<div class="flex flex-col gap-6">
			<LinksEdit
				default={defaultData.links}
				bind:value={editData.links}
				onclick={() => submitField('links')}
			/>
		</div>
	</div>
</section>
