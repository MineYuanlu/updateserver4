<script lang="ts">
	import type { ParameterObject, SchemaObject } from 'openapi3-ts/oas30';
	import Input from '$lib/components/Form/Input.svelte';
	import { ajv } from './common';
	import { XCircle } from '@steeze-ui/heroicons';

	let {
		param,
		schema,
		value = $bindable(),
		noValue = $bindable(false),
		setInvalid,
		setNoValue = $bindable(),
	}: {
		param: Omit<ParameterObject, 'in'>;
		schema: SchemaObject;
		value: string;
		noValue?: boolean;
		setInvalid?: (invalid: boolean) => void;
		setNoValue?: () => void;
	} = $props();

	setNoValue = () => {
		noValue = true;
		if (!param.required) invalid = false;
		value = '';
	};
	$effect(() => {
		if (value === undefined) value = '';
	});

	$effect(() => {
		if (value) noValue = false;
	});

	const enums = $derived(Array.isArray(schema.enum) ? new Set(schema.enum) : undefined);

	const checker = $derived(ajv.compile(schema));

	let invalid = $state(false);
	$effect(() => setInvalid?.(invalid));
</script>

<Input
	name={param.name}
	bind:value
	bind:invalid
	checker={(v) => {
		if (noValue && !param.required) return true;
		return checker(v);
	}}
	options={schema.enum}
	showAllOptions={enums ? enums.size < 10 : false}
	suffixIcon={noValue ? undefined : XCircle}
	onclick={setNoValue}
/>
