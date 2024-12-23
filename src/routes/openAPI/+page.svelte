<script lang="ts">
	import type { HttpMethod } from '$lib/api/common';
	import BindValue from '$lib/components/BindValue/BindValue.svelte';
	import { setNavBar } from '$lib/stores/common.js';
	import Op from './Op.svelte';
	import OpList from './OpList.svelte';

	const { data } = $props();
	setNavBar(navbar, {
		class: 'w-80 p-0 relative',
	});

	let display: [string, HttpMethod] | undefined = $state(undefined);
</script>

{#snippet navbar()}
	<OpList data={data.openAPI} bind:display />
{/snippet}
{#if display}
	<Op data={data.openAPI} {display} />
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
