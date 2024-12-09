<script module lang="ts">
	export type Props = {
		/** 默认值, 用于比较是否修改. 修改此值会重置当前值. */
		default?: string;
		/** 当前值, 绑定值 */
		value?: string;
		/** 是否为无效值, 绑定值 */
		invalid?: boolean;
		/** 在无效时显示的提示信息 */
		errHint?: string | ((v: string) => string);
		/** 在有修改时显示的提示信息 */
		editHint?: string | ((v: string) => string);
	};
</script>

<script lang="ts">
	import Input from '$lib/components/Form/Input.svelte';
	import { component_form_edit_input__btn } from '$lib/paraglide/messages';
	import type { Props as InputProps } from './Input.svelte';

	let {
		suffix = component_form_edit_input__btn(),
		default: defaultValue = '',
		value = $bindable(defaultValue),
		invalid = $bindable(false),
		errHint,
		editHint,
		...props
	}: Props & Exclude<InputProps, keyof Props> = $props();

	$effect(() => {
		value = defaultValue;
	});

	const hint = $derived.by(() => {
		if (invalid) {
			if (typeof errHint === 'function') errHint = errHint(value);
			return errHint;
		} else if (defaultValue !== value) {
			if (typeof editHint === 'function') editHint = editHint(value);
			return editHint;
		}
		return undefined;
	});
</script>

<!-- @component
Input包装, 带有默认值和当前值的Input, 附带按钮和更多hint提示
-->

<Input
	bind:value
	bind:invalid
	{hint}
	{...props}
	suffix={!invalid && defaultValue !== value ? suffix : undefined}
/>
