<script module lang="ts">
	import type { RequestEvent as RE } from './$types';
	import type { RequestEvent as KRE } from '@sveltejs/kit';
	export const base: RE extends KRE<any, infer ID> ? ID : never = '/project/[pid=pid]';
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import Navbar from './Navbar.svelte';

	const { data, children } = $props();
	const { project: pinfo, role } = data;
	const { proj } = pinfo;

	onMount(() => {
		const old = document.body.style.overflowY;
		document.body.style.overflowY = 'scroll';

		return () => {
			document.body.style.overflowY = old;
		};
	});
</script>

{#if $page.route.id !== base && $page.route.id?.startsWith(base)}
	<Navbar name={proj.name} id={proj.id} role={data.role} />
{/if}
{@render children()}
