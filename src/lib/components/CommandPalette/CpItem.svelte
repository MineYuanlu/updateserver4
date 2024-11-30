<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { MouseEventHandler } from 'svelte/elements';
	import type { Color } from '../color';
	let {
		title,
		subtitle,
		icon: Icon,
		suffix,
		color = 'blue',
		cursor = 'pointer',
		hover = $bindable(false),
		onmouseleave,
		onmouseenter,
		onclick,
		href,
		hreflang,
	}: {
		/**显示标题, 字符串/代码片段 */
		title?: string | Snippet<[]>;
		/**显示副标题 */
		subtitle?: string;
		/** 图标*/
		icon?: Component | any;
		/** 右侧提示文字, 字符串/代码片段(hover) */
		suffix?: Snippet<[boolean]> | string;
		/** 总体颜色 */
		color?: Color;
		/** 鼠标样式 (默认 pointer) */
		cursor?: string;
		/** 是否悬浮状态 (可绑定) */
		hover?: boolean;
		/** 鼠标离开事件 */
		onmouseleave?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | undefined | null;
		/** 鼠标进入事件 */
		onmouseenter?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | undefined | null;
		/** 点击事件 */
		onclick?: MouseEventHandler<HTMLButtonElement | HTMLAnchorElement> | undefined | null;
		/** 命令项链接, 指定此值后命令项将从button变为a标签 */
		href?: string;
		hreflang?: string;
	} = $props();
</script>

<!--
@component
命令面板结果项, 附属于 `<CommandPalette />` 组件
  -->

{#snippet content()}
	<!-- 左侧内容 -->
	<div class="flex items-center">
		{#if Icon}
			<div
				class="flex-shrink-0 rounded-md bg-{color}-100 p-2 text-{color}-500 dark:bg-{color}-500 dark:text-{color}-300"
			>
				<Icon class="h-6 w-6" />
			</div>
		{/if}
		<div class="ml-4">
			<h3 class="text-md font-medium text-gray-900 dark:text-gray-300">
				{#if typeof title === 'string'}
					{title}
				{:else if title}
					{@render title()}
				{/if}
			</h3>
			<p class="text-sm text-gray-500 dark:text-gray-400">
				{subtitle}
			</p>
		</div>
	</div>

	{#if suffix}
		<!-- 右侧内容 -->
		<div class="text-sm font-medium text-gray-500 dark:text-gray-400">
			{#if typeof suffix === 'string'}
				{suffix}
			{:else}
				{@render suffix(hover)}
			{/if}
		</div>
	{/if}
{/snippet}

{#if href}
	<a
		{href}
		{hreflang}
		class="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
		style:cursor
		onmouseenter={(e) => {
			hover = true;
			if (onmouseenter) onmouseenter(e);
		}}
		onmouseleave={(e) => {
			hover = false;
			if (onmouseleave) onmouseleave(e);
		}}
		{onclick}
	>
		{@render content()}
	</a>
{:else}
	<button
		class="flex w-full items-center justify-between rounded-xl p-3 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
		style:cursor
		onmouseenter={(e) => {
			hover = true;
			if (onmouseenter) onmouseenter(e);
		}}
		onmouseleave={(e) => {
			hover = false;
			if (onmouseleave) onmouseleave(e);
		}}
		{onclick}
	>
		{@render content()}
	</button>
{/if}
