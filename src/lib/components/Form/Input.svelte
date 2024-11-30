<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type {
		FocusEventHandler,
		FormEventHandler,
		HTMLInputTypeAttribute,
		KeyboardEventHandler,
		MouseEventHandler,
	} from 'svelte/elements';
	import { slide } from 'svelte/transition';
	import KeyListener from '../Global/KeyListener.svelte';
	import ClickListener from '../Global/ClickListener.svelte';

	let {
		class: className,
		id,
		name,
		label,
		type = 'text',
		placeholder,
		value = $bindable(''),
		disabled,
		inputClass,
		prefix,
		prefixIcon: PrefixIcon,
		prefixSnippet,
		suffix,
		suffixIcon: SuffixIcon,
		suffixSnippet,
		options,
		focusing = $bindable(false),
		showDropdown = $bindable(false),
		onclick,
		oninput,
		onfocus,
		onblur,
		onkeydown,
		onkeypress,
		onkeyup,
		onmouseenter,
		onmousemove,
		onmouseleave,
	}: {
		/** 最外层容器的类名 */
		class?: string;
		/** 输入框的 id */
		id?: string;
		/** 输入框的 name */
		name?: string;
		/** 输入框的标签 */
		label?: string;
		/** 输入框的类型 */
		type?: HTMLInputTypeAttribute;
		/** 输入框的占位符 */
		placeholder?: string;
		/** 输入框的值 (可绑定) */
		value?: string;
		/** 输入框是否禁用 */
		disabled?: boolean | null | undefined;
		/** 输入框的类名 */
		inputClass?: string;
		/** 前缀内容 */
		prefix?: string;
		/** 前缀图标 */
		prefixIcon?: Component | any;
		/** 前缀内容(优先于prefix & prefixIcon) */
		prefixSnippet?: Snippet;
		/** 后缀内容 */
		suffix?: string;
		/** 后缀图标 */
		suffixIcon?: Component | any;
		/** 后缀内容(优先于suffix & suffixIcon) */
		suffixSnippet?: Snippet;
		/** 下拉列表选项 */
		options?: string[];
		/** 输入框是否有焦点 (可绑定) */
		focusing?: boolean;
		/** 下拉列表是否显示 (可绑定) */
		showDropdown?: boolean;
		onclick?: MouseEventHandler<HTMLButtonElement> | null | undefined;
		oninput?: FormEventHandler<HTMLInputElement> | null | undefined;
		onfocus?: FocusEventHandler<HTMLInputElement> | null | undefined;
		onblur?: FocusEventHandler<HTMLInputElement> | null | undefined;
		onkeydown?: KeyboardEventHandler<HTMLInputElement> | null | undefined;
		onkeypress?: KeyboardEventHandler<HTMLInputElement> | null | undefined;
		onkeyup?: KeyboardEventHandler<HTMLInputElement> | null | undefined;
		onmouseenter?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmousemove?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmouseleave?: MouseEventHandler<HTMLDivElement> | null | undefined;
	} = $props();

	const filteredOptions = $derived(
		options ? options.filter((option) => option.toLowerCase().includes(value.toLowerCase())) : [],
	);

	let container: HTMLDivElement | undefined = $state();
</script>

{#if options}
	<KeyListener handler={() => (showDropdown = false)} key="Escape" />
	<ClickListener handler={() => (showDropdown = false)} exclude={container} />
{/if}

<div class="space-y-2 {className}">
	<!-- 标题 -->
	<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="input">{label}</label>

	<!-- 输入框容器 -->
	<div
		class="relative flex items-center rounded-md border border-gray-300 bg-white text-black shadow-sm ring-1 ring-blue-500 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:ring-gray-800 dark:hover:border-blue-500 dark:focus:border-blue-500"
		{onmouseenter}
		{onmousemove}
		{onmouseleave}
		role="group"
		bind:this={container}
	>
		<!-- 前缀 -->
		{#if prefixSnippet}
			{@render prefixSnippet()}
		{:else if prefix || PrefixIcon}
			<div
				class="flex items-center border-r-2 border-r-gray-300 px-3 py-2 text-sm font-medium text-gray-500 dark:border-r-gray-600 dark:text-gray-300"
			>
				{#if PrefixIcon}
					<PrefixIcon />
				{/if}
				{#if PrefixIcon && prefix}
					<span class="ml-1"></span>
				{/if}
				{#if prefix}
					{prefix}
				{/if}
			</div>
		{/if}

		<!-- 输入框 -->
		<input
			{id}
			{name}
			{oninput}
			{type}
			onfocus={(e) => {
				focusing = true;
				if (options) showDropdown = true;
				if (onfocus) onfocus(e);
			}}
			onblur={(e) => {
				focusing = false;
				if (onblur) onblur(e);
			}}
			{onkeydown}
			{onkeypress}
			{onkeyup}
			{placeholder}
			bind:value
			{disabled}
			class="flex-1 rounded-md border-0 px-2 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-500 {inputClass}"
		/>

		<!-- 后缀 -->
		{#if suffixSnippet}
			{@render suffixSnippet()}
		{:else if suffix || SuffixIcon}
			<button
				{onclick}
				type="button"
				class="flex items-center border-l-2 border-l-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:border-l-gray-600 dark:text-gray-300 dark:hover:text-blue-500"
			>
				{#if SuffixIcon}
					<SuffixIcon />
				{/if}
				{#if SuffixIcon && suffix}
					<span class="ml-1"></span>
				{/if}
				{#if suffix}
					{suffix}
				{/if}
			</button>
		{/if}

		<!-- 下拉列表 -->
		{#if showDropdown && filteredOptions.length > 0}
			<ul
				class="absolute right-0 top-8 z-50 mt-2 max-h-60 w-full origin-top-right overflow-y-auto rounded-md bg-white p-2 shadow-lg ring-1 ring-black ring-opacity-5 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700"
				transition:slide={{ duration: 80 }}
			>
				{#each filteredOptions as option}
					<button
						class="w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-blue-100 dark:text-white dark:hover:bg-blue-600"
						onclick={() => {
							console.log(option);
							value = option;
							showDropdown = false;
						}}
					>
						{option}
					</button>
				{/each}
			</ul>
		{/if}
	</div>
</div>
