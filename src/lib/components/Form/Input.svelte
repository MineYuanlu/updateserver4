<script module lang="ts">
	export type Props = {
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
		/** 输入框是否必填 */
		required?: boolean | null | undefined;
		/** 输入框是否无效 */
		invalid?: boolean | null | undefined;
		/** 输入框的校验器 (正则表达式或函数) */
		checker?: RegExp | ((value: string) => boolean) | null;
		/** 输入框是否初始化时无错误 */
		initNoErr?: boolean;
		/** 输入框的提示信息 */
		hint?: string | Snippet;
		/** 输入框的类名 */
		inputClass?: string;
		/** 前缀内容 */
		prefix?: string | Snippet;
		/** 前缀图标, 在prefix是Snippet时失效 */
		prefixIcon?: IconSource;
		/** 后缀内容 */
		suffix?: string | Snippet;
		/** 后缀图标, 在suffix是Snippet时失效 */
		suffixIcon?: IconSource;
		/** 下拉列表选项 */
		options?: readonly (string | [string, string])[];
		/** 自定义下拉列表选项, render(label:string, value:string) */
		optionSnippet?: Snippet<[string, string]>;
		/** 是否显示全部选项 */
		showAllOptions?: boolean;
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

		input?: HTMLInputElement;
	};
</script>

<script lang="ts">
	import type { Snippet } from 'svelte';
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
	import { isSnippet } from '../SoC/soc';
	import { Icon, type IconSource } from '@steeze-ui/svelte-icon';

	let {
		class: className,
		id,
		name,
		label,
		type = 'text',
		placeholder,
		value = $bindable(),
		disabled,
		required,
		invalid = $bindable(false),
		checker: checkerLike,
		initNoErr = true,
		hint,
		inputClass,
		prefix,
		prefixIcon,
		suffix,
		suffixIcon,
		options,
		optionSnippet,
		showAllOptions = false,
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

		input = $bindable(),

		...props
	}: Props = $props();

	const searchMatch = (a: string, b: string | undefined): boolean => {
		return !b || a.toLowerCase().includes(b.toLowerCase());
	};

	const filteredOptions = $derived(
		options
			? showAllOptions
				? [...options]
				: options.filter((option) => {
						if (typeof option === 'string') return searchMatch(option, value);
						else return searchMatch(option[0], value) || searchMatch(option[1], value);
					})
			: [],
	);
	const checker: ((value: string) => boolean) | null = $derived(
		checkerLike
			? typeof checkerLike == 'function'
				? checkerLike
				: (v) => checkerLike.test(v)
			: options
				? (v) => options.some((o) => (typeof o === 'string' ? o === v : o[0] === v))
				: null,
	);
	let isInit = $state(true); // 是否是初始状态, 在首次失去焦点或有任意输入时变为 false
	$effect(() => {
		// if (outerInvalid !== null) return; // 外部强制指定
		if (isInit && initNoErr) invalid = false;
		else if (checker) invalid = !checker(value ?? '');
	});

	let container: HTMLDivElement | undefined = $state();
</script>

{#if options}
	<KeyListener handler={() => (showDropdown = false)} key="Escape" />
	<ClickListener handler={() => (showDropdown = false)} exclude={container} />
{/if}

<div class="space-y-2 {className}">
	<!-- 标题 -->
	{#if label}
		<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="input">{label}</label>
	{/if}

	<!-- 输入框容器 -->
	<div
		class:ring-blue-500={!invalid}
		class:hover:ring-blue-600={!invalid}
		class:dark:ring-blue-600={!invalid}
		class:dark:hover:ring-blue-500={!invalid}
		class:ring-red-500={invalid}
		class:hover:ring-red-600={invalid}
		class:dark:ring-red-600={invalid}
		class:dark:hover:ring-red-500={invalid}
		class="relative flex items-center rounded-md bg-white text-black shadow-sm ring-1 dark:bg-gray-800 dark:text-white"
		{onmouseenter}
		{onmousemove}
		{onmouseleave}
		role="group"
		bind:this={container}
	>
		<!-- 前缀 -->
		{#if isSnippet(prefix)}
			{@render prefix()}
		{:else if prefix || prefixIcon}
			<div
				class="flex items-center border-r-2 border-r-gray-300 px-3 py-2 text-sm font-medium text-gray-500 dark:border-r-gray-600 dark:text-gray-300"
			>
				{#if prefixIcon}
					<Icon src={prefixIcon} class="mr-1 h-4 w-4 {prefix ? 'ml-1' : ''}" />
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
			bind:this={input}
			oninput={(e) => {
				isInit = false;
				if (oninput) oninput(e);
			}}
			{type}
			onfocus={(e) => {
				focusing = true;
				if (options) showDropdown = true;
				if (onfocus) onfocus(e);
			}}
			onblur={(e) => {
				focusing = false;
				isInit = false;
				if (onblur) onblur(e);
			}}
			{onkeydown}
			{onkeypress}
			{onkeyup}
			{placeholder}
			bind:value
			{disabled}
			{required}
			{...props}
			class:focus:ring-blue-500={!invalid}
			class:dark:focus:ring-blue-500={!invalid}
			class:focus:ring-red-600={invalid}
			class:dark:focus:ring-red-600={invalid}
			class="flex-1 rounded-md border-0 px-2 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 {inputClass}"
		/>

		<!-- 后缀 -->
		{#if isSnippet(suffix)}
			{@render suffix()}
		{:else if suffix || suffixIcon}
			<button
				{onclick}
				type="button"
				class="flex items-center border-l-2 border-l-gray-300 px-3 py-2 text-sm font-medium text-gray-600 hover:text-blue-600 dark:border-l-gray-600 dark:text-gray-300 dark:hover:text-blue-500"
			>
				{#if suffixIcon}
					<Icon src={suffixIcon} class="h-4 w-4 {suffix ? 'ml-1' : ''}" />
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
					{@const _value = typeof option === 'string' ? option : option[0]}
					{@const _label = typeof option === 'string' ? option : option[1]}
					<button
						class="flex w-full cursor-pointer px-3 py-2 text-left text-sm hover:bg-blue-100 dark:text-white dark:hover:bg-blue-600"
						onclick={() => {
							value = _value;
							showDropdown = false;
						}}
					>
						{#if optionSnippet}
							{@render optionSnippet(_label, _value)}
						{:else}
							{_label}
						{/if}
					</button>
				{/each}
			</ul>
		{/if}
	</div>
	{#if isSnippet(hint)}
		{@render hint()}
	{:else if hint}
		<p class="mt-2 text-sm text-gray-500 dark:text-gray-400">{hint}</p>
	{/if}
</div>
