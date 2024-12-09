<script module lang="ts">
	export type AnyIconType = SoC<[string | undefined], { class?: string }> | IconSource;
</script>

<script lang="ts">
	import { isComponent, isSnippet, type SoC } from '../SoC/soc';
	import { Icon, type IconSource } from '@steeze-ui/svelte-icon';

	const {
		icon: IconSrc,
		class: className,
	}: {
		icon?: AnyIconType;
		class?: string;
	} = $props();
</script>

<!-- @component
 任意图标组件的代理组件

 支持: 
 - Steeze Icon
 - Snippet
 - Component
 -->
{#if isSnippet(IconSrc)}
	{@render IconSrc(className)}
{:else if isComponent(IconSrc)}
	<IconSrc class={className} />
{:else if IconSrc}
	<Icon src={IconSrc} class={className} />
{/if}
