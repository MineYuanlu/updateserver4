<script lang="ts">
	import { runes, type RuneTypes } from './param_rune';

	const { type }: { type: RuneTypes } = $props();
</script>

<span
	class="my-1 inline-block rounded-sm bg-black px-1 font-medium text-white dark:bg-white dark:text-black"
	>{runes[type]}</span
>
