<script lang="ts">
	import { navbar } from '$lib/stores/common';
	import { slide } from 'svelte/transition';

	const children = $derived($navbar ? $navbar[0] : undefined);
	const { class: clazz, ...attr } = $derived(($navbar ? $navbar[1] : undefined) ?? {});
</script>

{#if children}
	<aside
		class="hidden w-64 border-r bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 sm:block {clazz}"
		{...attr}
		transition:slide={{ duration: 100, axis: 'x' }}
	>
		{@render children()}
	</aside>
{/if}
