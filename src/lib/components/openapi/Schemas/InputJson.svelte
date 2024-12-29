<script lang="ts">
	import type { ParameterObject } from 'openapi3-ts/oas30';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json as cmJson } from '@codemirror/lang-json';
	import { oneDark as cmOnDark } from '@codemirror/theme-one-dark';
	import { theme } from '$lib/stores/theme';
	import { untrack } from 'svelte';
	import type { JSONSchema7, JSONSchema7TypeName } from 'json-schema';
	import { ajv } from './common';
	let {
		param,
		schema,
		type,
		value = $bindable(),
		noValue = $bindable(false),
		setInvalid,
	}: {
		param: Omit<ParameterObject, 'in'>;
		schema: JSONSchema7;
		type: JSONSchema7TypeName | 'unknown';
		value: any;
		noValue?: boolean;
		setInvalid?: (invalid: boolean) => void;
	} = $props();

	console.log('schema', schema);

	const validate = $derived(ajv.compile(schema));

	let innerValue: string = $state('');
	let isInnerUpdate = $state(false);
	$effect(() => {
		noValue = untrack(() => value) === undefined;
		try {
			value = JSON.parse(innerValue);
			isInnerUpdate = true;
		} catch (e) {
			value = undefined;
			setInvalid?.(true);
			return;
		}
		try {
			setInvalid?.(!validate(untrack(() => value)));
		} catch (e) {
			setInvalid?.(true);
			console.error(
				'Failed to validate',
				e,
				'schema',
				untrack(() => schema),
				'value',
				untrack(() => value),
			);
			return;
		}
	});
	$effect(() => {
		value; // trigger update
		if (untrack(() => isInnerUpdate)) isInnerUpdate = false;
		else innerValue = JSON.stringify(value, null, 2);
	});
</script>

<!-- <CodeMirror6 extensions={[basicSetup, vscodeDark, json()]} bind:docStore /> -->
<CodeMirror
	bind:value={innerValue}
	lang={cmJson()}
	theme={$theme === 'dark' ? cmOnDark : undefined}
	extensions={[]}
	nodebounce
/>
