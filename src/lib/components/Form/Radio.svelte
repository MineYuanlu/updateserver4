<script lang="ts">
	import type { FocusEventHandler, MouseEventHandler } from 'svelte/elements';

	let {
		class: className,
		name,
		label,
		value = $bindable(''),
		options,
		disabled,
		inputClass,
		onmouseenter,
		onmousemove,
		onmouseleave,
		...props
	}: {
		/** 最外层容器的类名 */
		class?: string;
		/** 输入框的 name */
		name?: string;
		/** 输入框的标签 */
		label?: string;
		/** 输入框的值 (可绑定) */
		value?: string;
		/** 选项列表 */
		options: string[] | [string, string][] | Record<string, string>;
		/** 输入框是否禁用 */
		disabled?: boolean | null | undefined;
		/** 输入框是否必填 */
		required?: boolean | null | undefined;
		/** 输入框的类名 */
		inputClass?: string;
		onmouseenter?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmousemove?: MouseEventHandler<HTMLDivElement> | null | undefined;
		onmouseleave?: MouseEventHandler<HTMLDivElement> | null | undefined;
	} = $props();

	const option_array: [string, string][] = $derived.by(() => {
		if (Array.isArray(options)) {
			if (options.every((opt) => Array.isArray(opt))) return options;
			return options.map((opt) => [opt, opt]);
		} else {
			return Object.entries(options);
		}
	});
</script>

<div class="space-y-2 {className}">
	<!-- 标题 -->
	<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="input">{label}</label>

	<!-- 输入框容器 -->
	<div
		class="relative flex items-center space-x-6 rounded-md bg-white text-black dark:bg-gray-800 dark:text-white"
		{onmouseenter}
		{onmousemove}
		{onmouseleave}
		role="group"
	>
		{#each option_array as [option, label]}
			<label class="flex items-center space-x-2">
				<input
					type="radio"
					{name}
					bind:group={value}
					value={option}
					{disabled}
					{...props}
					class="h-4 w-4 border-gray-300 text-blue-500 dark:border-gray-600 dark:bg-gray-600 {inputClass}"
				/>
				<span class="text-base text-gray-700 dark:text-gray-300">{label}</span>
			</label>
		{/each}
	</div>
</div>
