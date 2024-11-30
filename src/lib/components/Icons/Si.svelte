<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';

	const {
		icon,
		class: className,
	}: {
		icon: SimpleIcon;
		class?: string;
	} = $props();
</script>

<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" class={className}>
	<title>{icon.title}</title>
	<path d={icon.path} class="fill-current" />
</svg>
