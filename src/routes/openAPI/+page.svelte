<script lang="ts">
	import type { HttpMethod } from '$lib/api/common';
	import BindValue from '$lib/components/BindValue/BindValue.svelte';
	import { resolveOpenAPI } from '$lib/components/openapi/utils';
	import { setNavBar } from '$lib/stores/common.js';
	import Op from '$lib/components/openapi/Op.svelte';
	import OpList from '$lib/components/openapi/OpList.svelte';

	const { data } = $props();
	setNavBar(navbar, {
		class: 'w-80 p-0 relative',
	});

	let display: [string, HttpMethod] | undefined = $state(undefined);

	const openAPI = $derived(resolveOpenAPI(data.openAPI));
</script>

{#snippet navbar()}
	<OpList data={openAPI} bind:display />
{/snippet}
{#if display}
	<Op data={openAPI} {display} />
{/if}

<BindValue
	bind="op"
	value={display ? display.join('/') : ''}
	replace
	handler={(v) => {
		if (typeof v !== 'string') {
			display = undefined;
			return;
		}
		const idx = v.lastIndexOf('/');
		if (idx === -1) {
			display = undefined;
		} else {
			display = [v.slice(0, idx), v.slice(idx + 1) as HttpMethod];
		}
	}}
/>

<style>
	:global(.redoc-wrap) {
		margin: 0;
	}
</style>
