<script lang="ts">
	import type { HeroIcon } from './.heroicons';
	const {
		icon,
		class: className,
	}: {
		icon: HeroIcon;
		class?: string;
	} = $props();

	const svg = $derived(`<svg class="${className}" ${icon.svg.substring('<svg '.length)}`);
</script>

{@html svg}
