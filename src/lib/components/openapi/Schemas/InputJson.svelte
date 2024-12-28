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
		param: ParameterObject;
		schema: JSONSchema7;
		type: JSONSchema7TypeName | 'unknown';
		value: any;
		noValue?: boolean;
		setInvalid?: (invalid: boolean) => void;
	} = $props();

	const validate = $derived(ajv.compile(schema));

	let innerValue: string = $state('');
	let isInnerUpdate = $state(false);
	$effect(() => {
		console.log('effect1');
		try {
			isInnerUpdate = true;
			value = JSON.parse(innerValue);
			setInvalid?.(!validate(untrack(() => value)));
		} catch (e) {
			value = undefined;
			setInvalid?.(true);
		}
	});
	$effect(() => {
		console.log('effect2');
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
