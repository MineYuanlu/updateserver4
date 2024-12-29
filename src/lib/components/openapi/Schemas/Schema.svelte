<script module lang="ts">
	const t_unknown = 'unknown' as const;
	const t_basic = ['string', 'number', 'integer', 'boolean'] as const;
</script>

<script lang="ts">
	import type { ParameterObject, SchemaObject, SchemaObjectType } from 'openapi3-ts/oas30';
	import Box from './Box.svelte';
	import { remRef } from '../utils';
	import {
		component_openapi_schemas_schema__default as m_default,
		component_openapi_schemas_schema__example_noname as m_example_noname,
		component_openapi_schemas_schema__fill as m_fill,
		component_openapi_schemas_schema__param_detail as m_param_detail,
		component_openapi_schemas_schema__param_unset as m_param_unset,
	} from '$lib/paraglide/messages';
	import Modal from '$lib/components/Modal/Modal.svelte';
	import InputJson from './InputJson.svelte';

	import CodeMirror from 'svelte-codemirror-editor';
	import { json as CodeMirrorJson } from '@codemirror/lang-json';
	import { oneDark as CodeMirrorOneDark } from '@codemirror/theme-one-dark';
	import { theme } from '$lib/stores/theme';
	import InputString from './InputString.svelte';
	import type { JSONSchema7 } from 'json-schema';
	import TxtBtn from '../TxtBtn.svelte';
	import { makeFillValues } from './fillValues';
	import type { RuneTypes } from '../param_rune';

	let {
		param,
		value = $bindable(),
		noValue = $bindable(false),
		setInvalid,
		media,
	}: {
		param: Omit<ParameterObject, 'in'> & { in: RuneTypes };
		value?: any;
		noValue?: boolean;
		setInvalid?: (invalid: boolean) => void;
		media?: string;
	} = $props();

	const mediaObj = $derived(media ? param.content?.[media] : undefined);

	const schema = $derived(remRef(mediaObj?.schema ?? param.schema));

	const types: (SchemaObjectType | typeof t_unknown)[] = $derived.by(() => {
		const type = schema?.type;
		return type === undefined
			? [t_unknown]
			: Array.isArray(type)
				? type.length < 1
					? [t_unknown]
					: type
				: [type];
	});
	// svelte-ignore state_referenced_locally
	let type = $state(types[0]);

	const fillValues = $derived(makeFillValues(param, schema, mediaObj));
	// svelte-ignore state_referenced_locally
	if (value === undefined && fillValues.length > 0) value = fillValues[0].value;
	else noValue = true;

	let fillModalOpen = $state(false);
	let fillSelectedIndex = $state<number>(0);

	const doFill = () => {
		if (fillValues.length < 1) return;
		if (fillValues.length === 1) {
			value = fillValues[0].value;
		} else {
			fillModalOpen = true;
			fillSelectedIndex = 0;
		}
	};

	let detailModalOpen = $state(false);

	let setNoValue: () => void = $state(() => {
		value = undefined;
		noValue = true;
		setInvalid?.(!!param.required);
	});
</script>

<!-- @component
一个参数组件的代理, 根据参数类型渲染不同的输入组件及外层Box
 -->

<Box
	name={param.name}
	type={param.in}
	description={param.description}
	required={param.required || param.in === 'path'}
	deprecated={param.deprecated}
>
	{#snippet extra1()}
		<TxtBtn label="类型" btn={types} bind:value={type} />
	{/snippet}
	{#snippet extra2()}
		{#if fillValues.length}
			<!-- `类型: [ string ]` -->
			<TxtBtn
				btn={fillValues.length === 1 && schema?.default ? fillValues[0].name : m_fill()}
				onclick={doFill}
			/>
		{/if}
		<!-- `[ 填充 ]` / `[ 默认 ]` -->
		<TxtBtn btn={m_param_detail()} onclick={() => (detailModalOpen = true)} />
		{#if !noValue}
			<!-- `[ 清空 ]` -->
			<TxtBtn btn={m_param_unset()} onclick={setNoValue} />
		{/if}
	{/snippet}
	{#key type}
		{#if type === 'string'}
			<InputString
				{param}
				schema={schema as SchemaObject}
				bind:value
				bind:noValue
				{setInvalid}
				bind:setNoValue
			/>
		{:else}
			<InputJson
				{param}
				schema={schema as JSONSchema7}
				{type}
				bind:value
				bind:noValue
				{setInvalid}
			/>
			<pre>{JSON.stringify(value, null, 2)}</pre>
		{/if}
	{/key}
</Box>
<!-- 样例选择 -->
<Modal
	bind:open={fillModalOpen}
	title="选择样例值"
	btns={['确定', '取消']}
	onConfirm={() => {
		value = fillValues[fillSelectedIndex].value;
	}}
>
	{#snippet body(toggle)}
		<div class="flex flex-col gap-4 p-4">
			<div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
				{#each fillValues as { name, value: _value }, i}
					<button
						class="px-4 py-2 {fillSelectedIndex === i
							? 'border-b-2 border-blue-500 font-medium text-blue-500'
							: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
						onclick={() => (fillSelectedIndex = i)}
						ondblclick={() => {
							value = _value;
							toggle(false);
						}}
					>
						{name}
					</button>
				{/each}
			</div>

			<div class="max-h-96 overflow-auto rounded p-4">
				{#if fillValues[fillSelectedIndex].summary}
					<div class="mb-1 truncate text-sm font-medium text-gray-600 dark:text-gray-300">
						{fillValues[fillSelectedIndex].summary}
					</div>
				{/if}
				{#if fillValues[fillSelectedIndex].description}
					<div class="whitespace-pre-wrap break-all text-sm text-gray-500 dark:text-gray-400">
						{fillValues[fillSelectedIndex].description}
					</div>
				{/if}
				<CodeMirror
					class={fillValues[fillSelectedIndex].summary || fillValues[fillSelectedIndex].description
						? 'mt-4'
						: ''}
					value={JSON.stringify(fillValues[fillSelectedIndex].value, null, 2)}
					lang={CodeMirrorJson()}
					theme={$theme === 'dark' ? CodeMirrorOneDark : undefined}
					readonly
					editable={false}
				/>
			</div>
		</div>
	{/snippet}
</Modal>

<!-- 参数详情 -->
<Modal bind:open={detailModalOpen} title="参数详情" btns={['关闭']}>
	{#snippet content()}
		<div class="p-4">
			<CodeMirror
				value={JSON.stringify(param, null, 2)}
				lang={CodeMirrorJson()}
				theme={$theme === 'dark' ? CodeMirrorOneDark : undefined}
				readonly
				editable={false}
			/>
		</div>
	{/snippet}
</Modal>
