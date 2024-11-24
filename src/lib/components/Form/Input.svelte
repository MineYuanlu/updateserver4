<script lang="ts">
	import type { Component, Snippet, SvelteComponentTyped } from 'svelte';
	import type {
		FocusEventHandler,
		FormEventHandler,
		KeyboardEventHandler,
		MouseEventHandler
	} from 'svelte/elements';

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
		onclick,
		oninput,
		onfocus,
		onblur,
		onkeydown,
		onkeypress,
		onkeyup,
		onmouseenter,
		onmousemove,
		onmouseleave
	}: {
		class?: string;
		id?: string;
		name?: string;
		label?: string;
		type?: string;
		placeholder?: string;
		value?: string;
		disabled?: boolean | null | undefined;
		inputClass?: string;
		prefix?: string;
		prefixIcon?: Component | any;
		prefixSnippet?: Snippet;
		suffix?: string;
		suffixIcon?: Component | any;
		suffixSnippet?: Snippet;
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
</script>

<div class="space-y-2 {className}">
	<!-- 标题 -->
	<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="input">{label}</label>

	<!-- 输入框容器 -->
	<div
		class="flex items-center rounded-md border border-gray-300 bg-white text-black shadow-sm ring-1 ring-blue-500 hover:border-blue-500 focus:border-blue-500 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:ring-gray-800 dark:hover:border-blue-500 dark:focus:border-blue-500"
		{onmouseenter}
		{onmousemove}
		{onmouseleave}
		role="group"
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
			{onblur}
			{onfocus}
			{onkeydown}
			{onkeypress}
			{onkeyup}
			{type}
			{placeholder}
			bind:value
			{disabled}
			class="flex-1 border-0 px-2 py-2 text-sm text-black placeholder-gray-400 focus:outline-none focus:ring-0 focus:ring-blue-500 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 dark:focus:ring-blue-500 {inputClass}"
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
	</div>
</div>
