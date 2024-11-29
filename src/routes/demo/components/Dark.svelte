<script lang="ts">
	import type { Snippet } from 'svelte';

	const { children, dark = true }: { children: Snippet; dark?: boolean } = $props();
</script>

{#if dark}
	<div class="dark w-full">
		<div class="w-full pb-10 pt-10 dark:bg-gray-900 dark:text-gray-100">
			{@render children()}
		</div>
	</div>
{:else}
	{@render children()}
{/if}
