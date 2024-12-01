<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	const {
		icon,
		class: className,
		colord,
	}: {
		icon: SimpleIcon;
		class?: string;
		colord?: boolean;
	} = $props();
</script>

<svg
	role="img"
	viewBox="0 0 24 24"
	xmlns="http://www.w3.org/2000/svg"
	class:colord-icon={colord}
	style:--color-icon="#{icon.hex}"
	class={className}
>
	<title>{icon.title}</title>
	<path d={icon.path} class="fill-current" />
</svg>

<style>
	.colord-icon {
		color: var(--color-icon);
	}
</style>
