<script lang="ts">
	const { text } = $props();
</script>

<div class="relative my-6 flex items-center">
	<div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
	<span class="mx-4 text-sm text-gray-600 dark:text-gray-300">{text}</span>
	<div class="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
</div>
