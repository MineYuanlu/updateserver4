<script lang="ts">
	import type { ParameterObject, SchemaObject } from 'openapi3-ts/oas30';
	import Input from '$lib/components/Form/Input.svelte';

	let {
		param,
		schema,
		value = $bindable(),
		invalid = $bindable(false),
	}: {
		param: ParameterObject;
		schema: SchemaObject;
		value: string;
		invalid?: boolean;
	} = $props();

	const enums = $derived(Array.isArray(schema.enum) ? new Set(schema.enum) : undefined);

	// 处理输入验证
	function checker(val: any) {
		if (typeof schema.minLength === 'number' && val.length < schema.minLength) return false;
		if (typeof schema.maxLength === 'number' && val.length > schema.maxLength) return false;
		if (typeof schema.pattern === 'string' && !new RegExp(schema.pattern).test(val)) return false;
		if (enums && !enums.has(val)) return false;
		return true;
	}
</script>

<Input
	name={param.name}
	bind:value
	bind:invalid
	{checker}
	options={schema.enum}
	showAllOptions={enums ? enums.size < 10 : false}
/>
