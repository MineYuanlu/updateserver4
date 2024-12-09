<script lang="ts">
	import { Icon, type IconSource } from '@steeze-ui/svelte-icon';
	type Pos = 'lt' | 'rt' | 'lb' | 'rb';
	type IconPos<P extends Pos> = [IconSource, P];
	const {
		class: className = 'w-[15px] h-[15px]',
		icons,
		padding = 8,
		splitWidth = 5,
	}: {
		/**整体样式类 */
		class?: string;
		/**图标及其组合方式*/
		icons:
			| [IconPos<'lt'>, IconPos<'rb'>]
			| [IconPos<'rt'>, IconPos<'lb'>]
			| [IconPos<'lb'>, IconPos<'rt'>]
			| [IconPos<'rb'>, IconPos<'lt'>];
		/** 图标间距 */
		padding?: number;
		/** 分割线宽度, 默认为 5; 0 表示不显示分割线 */
		splitWidth?: number;
	} = $props();

	const splitLine: [number, number, number, number] = $derived.by(() => {
		switch (icons[0][1]) {
			case 'lt':
			case 'rb':
				return [100, 0, 0, 100];
			case 'rt':
			case 'lb':
				return [0, 0, 100, 100];
		}
	});

	function getPloy(pos: Pos, padding: number) {
		const a = `${padding}%`;
		const b = `${100 - padding}%`;
		switch (pos) {
			case 'lt':
				return `polygon(0% 0%, ${b} 0%, 0% ${b});`;
			case 'rt':
				return `polygon(${a} 0%, 100% 0%, 100% ${b});`;
			case 'lb':
				return `polygon(0% ${a}, ${b} 100%, 0% 100%);`;
			case 'rb':
				return `polygon(100% ${a}, 100% 100%, ${a} 100%);`;
		}
	}
</script>

<!-- @component
组合两个图标, 并添加分割线

可选的组合方式: 
- 左上 `lt` + 右下 `rb`
- 右上 `rt` + 左下 `lb`
- 左下 `lb` + 右上 `rt`
- 右下 `rb` + 左上 `lt`
 -->

<div class={className}>
	{#each icons as [IconSrc, pos]}
		<Icon src={IconSrc} class="clip-icon {pos}" style="clip-path: {getPloy(pos, padding)};" />
	{/each}
	{#if splitWidth > 0}
		<svg class="split-line stroke-black dark:stroke-white" viewBox="0 0 100 100">
			<line
				x1={splitLine[0]}
				y1={splitLine[1]}
				x2={splitLine[2]}
				y2={splitLine[3]}
				stroke-width={splitWidth}
			/>
		</svg>
	{/if}
</div>

<style>
	div {
		position: relative;
	}
	div :global(.clip-icon),
	div .split-line {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
	}
</style>
