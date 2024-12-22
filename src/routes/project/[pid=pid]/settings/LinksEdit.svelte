<script lang="ts">
	import { maxProjectLinkKeyLength, maxProjectLinkValueLength } from '$lib/common/project';
	import Button from '$lib/components/Form/Button.svelte';
	import EditTable from '$lib/components/Table/EditTable.svelte';
	import { isEqualRecord } from '$lib/utils/equal';
	import { isURL } from '$lib/utils/url';

	let {
		default: defaultLinks = {},
		value = $bindable({}),
		onclick: onsave,
	}: {
		default: Record<string, string>;
		value: Record<string, string>;
		onclick: () => void;
	} = $props();

	let links = $state(Object.entries(value));
	$effect(() => {
		value = Object.fromEntries(links);
	});
	let invalid = $state(false);

	const hasChanges = $derived(!isEqualRecord(defaultLinks, value));
</script>

<EditTable
	headers={['Name', 'Link']}
	bind:data={links}
	bind:invalid
	checkers={[
		(v) => 0 <= v.length && v.length <= maxProjectLinkKeyLength,
		(v) => 0 <= v.length && v.length <= maxProjectLinkValueLength && isURL(v),
	]}
/>

{#if hasChanges}
	<Button color="blue" disabled={invalid} onclick={onsave}>保存</Button>
{/if}
