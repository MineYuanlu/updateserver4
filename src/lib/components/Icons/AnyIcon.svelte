<script module lang="ts">
	export type AnyIconType = SoC<[string | undefined], { class?: string }> | SimpleIcon | HeroIcon;
</script>

<script lang="ts">
	import type { SimpleIcon } from 'simple-icons';
	import { isComponent, isSnippet, type SoC } from '../SoC/soc';
	import { isHeroIcon, isSimpleIcon, type HeroIcon } from './helpers';
	import Si from './Si.svelte';
	import Hi from './Hi.svelte';

	const {
		icon: Icon,
		class: className,
	}: {
		icon?: AnyIconType;
		class?: string;
	} = $props();
</script>

<!-- @component
 任意图标组件的代理组件

 支持: 
 - SimpleIcon
 - Snippet
 - Component
 -->
{#if isSnippet(Icon)}
	{@render Icon(className)}
{:else if isComponent(Icon)}
	<Icon class={className} />
{:else if isHeroIcon(Icon)}
	<Hi icon={Icon} class={className} />
{:else if isSimpleIcon(Icon)}
	<Si icon={Icon} class={className} />
{/if}
