<script lang="ts">
	import { validateProjectName } from '$lib/common/project';
	import EditInput from '$lib/components/Form/EditInput.svelte';
	const { data } = $props();
	const { proj, versions, tags } = data.project;

	let name = $state(proj.name);
	let nameInvalid = $state(false);
</script>

<section class="mx-auto flex h-[200vh] min-h-full max-w-3xl flex-col">
	<h1 class="mb-4 text-3xl font-bold">{proj.name}</h1>
	<hr />
	<div class="mb-4 mt-4">
		<h3 class="mb-4 text-xl font-bold">基础设置</h3>
		<EditInput
			label="项目名称"
			placeholder="请输入项目名称"
			default={proj.name}
			bind:value={name}
			checker={validateProjectName}
			errHint="无效的项目名称"
			editHint="修改项目名称将导致短链接'/p/{proj.name}'失效, 但id链接不变"
			onclick={() => {}}
		/>
	</div>
	<hr />
</section>
