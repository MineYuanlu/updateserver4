<script lang="ts">
	import {
		maxProjectLinkKeyLength,
		maxProjectLinkValueLength,
		maxProjectTagLength,
		validateProjectLinks,
		validateProjectTags,
		validateProjectTag,
		whyInvalidProjectTags,
	} from '$lib/common/project';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import EditTable from '$lib/components/Table/EditTable.svelte';
	import { isEqualRecord, isEqualSet } from '$lib/utils/equal';
	import { isURL } from '$lib/utils/url';
	import Tag from '../Tag.svelte';

	let {
		default: defaultTags = [],
		value = $bindable([]),
		onclick: onsave,
	}: {
		default: string[];
		value: string[];
		onclick: () => void;
	} = $props();

	const invalid = $derived(!validateProjectTags(value));
	const hasChanges = $derived(!isEqualSet(value, defaultTags));

	let edit = $state('');
	const invalidEdit = $derived(!validateProjectTag(edit.trim()) || value.includes(edit.trim()));
</script>

<Input
	bind:value={edit}
	placeholder="添加标签..."
	invalid={(invalidEdit && edit.length > 0) || invalid}
	hint={!invalidEdit ? '按下回车添加标签' : undefined}
	inputClass="h-full"
	onkeydown={(event) => {
		if (event.key === 'Enter') {
			event.preventDefault();
			if (!invalidEdit) {
				value.push(edit.trim());
				edit = '';
			}
		}
	}}
	suffix={hasChanges && !invalid ? '保存' : undefined}
	onclick={onsave}
>
	{#snippet prefix()}
		<div class="ml-2 flex h-full max-w-[80%] flex-wrap gap-2 py-2">
			{#each value as tag, i}
				<Tag children={tag} remove={() => value.splice(i, 1)} />
			{/each}
		</div>
	{/snippet}
</Input>
