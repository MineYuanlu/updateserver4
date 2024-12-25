<script lang="ts">
	import type { ParameterObject, SchemaObject } from 'openapi3-ts/oas30';
	import Input from '$lib/components/Form/Input.svelte';

	let {
		param,
		invalid = $bindable(false),
		value = $bindable(''),
	}: {
		param: ParameterObject;
		invalid?: boolean;
		value: string;
	} = $props();

	// 处理输入验证
	function checker(val: any) {
		return true;
	}
</script>

<Input name={param.name} bind:value bind:invalid {checker} />
