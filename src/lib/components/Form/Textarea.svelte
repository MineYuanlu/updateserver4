<script lang="ts">
	import type {
		FocusEventHandler,
		FormEventHandler,
		KeyboardEventHandler,
		MouseEventHandler,
	} from 'svelte/elements';

	let {
		class: className,
		id,
		name,
		label,
		placeholder,
		value = $bindable(''),
		disabled,
		required,
		invalid = $bindable(false),
		checker: checkerLike,
		maxlength,
		inputClass,
		oninput,
		onfocus,
		onblur,
		onkeydown,
		onkeypress,
		onkeyup,
		onmouseenter,
		onmousemove,
		onmouseleave,
		...props
	}: {
		/** 最外层容器的类名 */
		class?: string;
		/** 输入框的 id */
		id?: string;
		/** 输入框的 name */
		name?: string;
		/** 输入框的标签 */
		label?: string;
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
		checker?: RegExp | ((value: string) => boolean);
		/** 输入框的最大长度 */
		maxlength?: number;
		/** 输入框的类名 */
		inputClass?: string;
		oninput?: FormEventHandler<HTMLTextAreaElement> | null | undefined;
		onfocus?: FocusEventHandler<HTMLTextAreaElement> | null | undefined;
		onblur?: FocusEventHandler<HTMLTextAreaElement> | null | undefined;
		onkeydown?: KeyboardEventHandler<HTMLTextAreaElement> | null | undefined;
		onkeypress?: KeyboardEventHandler<HTMLTextAreaElement> | null | undefined;
		onkeyup?: KeyboardEventHandler<HTMLTextAreaElement> | null | undefined;
		onmouseenter?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmousemove?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmouseleave?: MouseEventHandler<HTMLDivElement> | null | undefined;
	} = $props();

	const checkers = $derived.by(() => {
		const checkers: ((value: string) => boolean)[] = [];
		if (checkerLike) {
			if (typeof checkerLike == 'function') checkers.push(checkerLike);
			else checkers.push((value) => checkerLike.test(value));
		}
		if (maxlength && maxlength > 0) checkers.push((value) => value.length <= maxlength);
		return checkers;
	});
	$effect(() => {
		invalid = !checkers.every((c) => c(value));
	});
</script>

<div class="space-y-2 {className} relative">
	<!-- 标题 -->
	<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="input">{label}</label>

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
	>
		<!-- 输入框 -->
		<textarea
			{id}
			{name}
			{oninput}
			{onfocus}
			{onblur}
			{onkeydown}
			{onkeypress}
			{onkeyup}
			{placeholder}
			bind:value
			{disabled}
			{...props}
			class:focus:ring-blue-500={!invalid}
			class:dark:focus:ring-blue-500={!invalid}
			class:focus:ring-red-500={invalid}
			class:dark:focus:ring-red-500={invalid}
			class="flex-1 rounded-md border-0 px-2 py-2 text-black placeholder-gray-400 focus:outline-none focus:ring-0 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500 {inputClass}"
		>
		</textarea>
		{#if maxlength && maxlength > 0}
			<div
				class:text-gray-500={value.length <= maxlength}
				class:text-red-500={value.length > maxlength}
				class="absolute bottom-2 right-2 text-sm"
				style="user-select:none;pointer-events:none;"
			>
				{value.length} / {maxlength}
			</div>
		{/if}
	</div>
</div>
