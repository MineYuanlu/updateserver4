<script lang="ts">
	import type { ParameterObject, SchemaObject } from 'openapi3-ts/oas30';
	import Input from '$lib/components/Form/Input.svelte';
	import { ajv } from './common';

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

	const checker = $derived(ajv.compile(schema));
</script>

<Input
	name={param.name}
	bind:value
	bind:invalid
	{checker}
	options={schema.enum}
	showAllOptions={enums ? enums.size < 10 : false}
/>
