<script lang="ts">
	import type { Snippet } from 'svelte';
	import { slide } from 'svelte/transition';

	const { navbar }: { navbar: Snippet | undefined | null } = $props();
</script>

{#if navbar}
	<aside
		class="hidden w-64 border-r bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:block"
		transition:slide={{ duration: 100, axis: 'x' }}
	>
		{@render navbar()}
	</aside>
{/if}
