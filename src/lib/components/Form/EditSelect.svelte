<script module lang="ts">
	export type Props = {
		/** 默认值, 用于比较是否修改. 修改此值会重置当前值&标签值. */
		default?: string;
		/** 当前值, 绑定值 */
		selectedValue?: any;
		/** 标签值, 用作ID, 绑定值 */
		value?: string;
		/** 下拉列表选项 */
		options: readonly OptInput[];
		/** 是否为无效值, 绑定值 */
		invalid?: boolean;
		/** 在无效时显示的提示信息 */
		errHint?: string | ((label: string | undefined, value: any) => string);
		/** 在有修改时显示的提示信息 */
		editHint?: string | ((label: string | undefined, value: any) => string);
	};
</script>

<script lang="ts">
	import Input from '$lib/components/Form/Input.svelte';
	import { component_form_edit_input__btn } from '$lib/paraglide/messages';
	import type { Props as InputProps, OptInput } from './Input.svelte';

	let {
		suffix = component_form_edit_input__btn(),
		default: defaultLabel,
		selectedValue: value = $bindable(),
		value: label = $bindable(),
		invalid = $bindable(false),
		errHint,
		editHint,
		...props
	}: Props & Exclude<InputProps, keyof Props> = $props();

	$effect(() => {
		label = defaultLabel;
	});

	const hint = $derived.by(() => {
		if (invalid) {
			if (typeof errHint === 'function') errHint = errHint(label, value);
			return errHint;
		} else if (label !== defaultLabel) {
			if (typeof editHint === 'function') editHint = editHint(label, value);
			return editHint;
		}
		return undefined;
	});
</script>

<!-- @component
Input包装, 带有默认值和当前值的Input, 附带按钮和更多hint提示, 提供枚举选项
-->
<Input
	bind:selectedValue={value}
	bind:value={label}
	bind:invalid
	{hint}
	{...props}
	suffix={!invalid && label !== defaultLabel ? suffix : undefined}
/>
