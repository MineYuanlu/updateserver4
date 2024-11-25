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
		<!-- <ul class="space-y-4">
        <li>
            <a
                href="#"
                class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                >导航 1</a
            >
        </li>
        <li>
            <a
                href="#"
                class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                >导航 2</a
            >
        </li>
        <li>
            <a
                href="#"
                class="block text-gray-700 hover:text-blue-500 dark:text-gray-300 dark:hover:text-blue-400"
                >导航 3</a
            >
        </li>
    </ul> -->
	</aside>
{/if}
