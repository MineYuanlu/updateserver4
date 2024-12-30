<script module lang="ts">
	const t_unknown = 'unknown' as const;
</script>

<script lang="ts">
	import type { ParameterObject, SchemaObject, SchemaObjectType } from 'openapi3-ts/oas30';
	import Box from './Box.svelte';
	import { remRef } from '../utils';
	import {
		component_openapi_schemas_schema__fill as m_fill,
		component_openapi_schemas_schema__fill_fake as m_fill_fake,
		component_openapi_schemas_schema__fill_select as m_fill_select,
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
	import { makeFakeValues, makeFillValues, type FillValue } from './fillValues';
	import type { RuneTypes } from '../param_rune';
	import KeyDownUpListener from '$lib/components/Global/KeyDownUpListener.svelte';
	import { dev } from '$app/environment';

	let {
		param,
		value = $bindable(),
		noValue = $bindable(false),
		setInvalid,
		doFastFill = $bindable(),
		media,
	}: {
		param: Omit<ParameterObject, 'in'> & { in: RuneTypes };
		value?: any;
		noValue?: boolean;
		setInvalid?: (invalid: boolean) => void;
		doFastFill: () => void;
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
	const fakeValues = $derived(makeFakeValues(schema));
	// svelte-ignore state_referenced_locally
	if (value === undefined && fillValues.length > 0) value = fillValues[0].value;
	else noValue = true;

	let fillModalOpen = $state(false);
	let fillSelectedIndex = $state<number>(0);

	const doFill = async () => {
		const fvs = await Promise.all(fakeValues).then((v) => v.filter((v) => v !== undefined));
		if (fillValues.length + fvs.length > 1 || isShiftDown) {
			fillModalOpen = true;
			fillSelectedIndex = 0;
		} else if (fillValues.length === 1 && fvs.length === 0) {
			value = fillValues[0].value;
		} else if (fillValues.length === 0 && fvs.length === 1) {
			value = fvs[0].value;
		}
	};
	doFastFill = async () => {
		if (fillValues.length > 0) {
			value = fillValues[0].value;
			return;
		}

		for (const fvp of fakeValues) {
			const fv = await fvp;
			if (fv) {
				value = fv.value;
				return;
			}
		}
	};

	let detailModalOpen = $state(false);

	let setNoValue: () => void = $state(() => {
		value = undefined;
		noValue = true;
		setInvalid?.(!!param.required);
	});

	let isShiftDown = $state(false);
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
		<!-- `类型: [ string ]` -->
		<TxtBtn label="类型" btn={types} bind:value={type} />
	{/snippet}
	{#snippet extra2()}
		<!-- `[ 填充 ]` / `[ 模拟 ]` / `[ 选择 ]` -->
		{#await Promise.all(fakeValues)}
			{#if fillValues.length > 1 || isShiftDown}
				<TxtBtn btn={m_fill_select()} onclick={doFill} />
			{:else if fillValues.length == 1}
				<TxtBtn btn={m_fill()} onclick={doFill} />
			{/if}
		{:then _fvs}
			{@const fvs = _fvs.filter((v) => v)}
			{#if fillValues.length + fvs.length > 1 || isShiftDown}
				<TxtBtn btn={m_fill_select()} onclick={doFill} />
			{:else if fillValues.length === 1 && fvs.length === 0}
				<TxtBtn btn={m_fill()} onclick={doFill} />
			{:else if fillValues.length === 0 && fvs.length === 1}
				<TxtBtn btn={m_fill_fake()} onclick={doFill} />
			{/if}
		{/await}
		{#if !noValue}
			<!-- `[ 清空 ]` -->
			<TxtBtn btn={m_param_unset()} onclick={setNoValue} />
		{/if}

		<!-- `[ 详情 ]` -->
		<TxtBtn btn={m_param_detail()} onclick={() => (detailModalOpen = true)} />
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
			{#if dev}
				<pre>{JSON.stringify(value, null, 2)}</pre>
			{/if}
		{/if}
	{/key}
</Box>
<!-- 样例选择 -->
<Modal
	bind:open={fillModalOpen}
	title="选择样例值"
	btns={['确定', '取消']}
	onConfirm={() => {
		if (fillSelectedIndex < fillValues.length) value = fillValues[fillSelectedIndex].value;
		else
			fakeValues[fillSelectedIndex - fillValues.length].then((fv) => {
				if (fv) value = fv.value;
			});
	}}
>
	{#snippet body(toggle)}
		<div class="flex flex-col gap-4 p-4">
			<div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
				{#snippet fill_modal_header({ name, value: _value }: FillValue, i: number)}
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
				{/snippet}
				{#each fillValues as fv, i}
					{@render fill_modal_header(fv, i)}
				{/each}
				{#each fakeValues as fvp, i}
					{#await fvp then fv}
						{#if fv}
							{@render fill_modal_header(fv, fillValues.length + i)}
						{/if}
					{/await}
				{/each}
			</div>
			{#snippet fill_modal_body({ summary, description, value }: FillValue)}
				<div class="max-h-96 overflow-auto rounded p-4">
					{#if summary}
						<div class="mb-1 truncate text-sm font-medium text-gray-600 dark:text-gray-300">
							{summary}
						</div>
					{/if}
					{#if description}
						<div class="whitespace-pre-wrap break-all text-sm text-gray-500 dark:text-gray-400">
							{description}
						</div>
					{/if}
					<CodeMirror
						class={summary || description ? 'mt-4' : ''}
						value={JSON.stringify(value, null, 2)}
						lang={CodeMirrorJson()}
						theme={$theme === 'dark' ? CodeMirrorOneDark : undefined}
						readonly
						editable={false}
					/>
				</div>
			{/snippet}
			{#if fillSelectedIndex < fillValues.length}
				{@render fill_modal_body(fillValues[fillSelectedIndex])}
			{:else}
				{#await fakeValues[fillSelectedIndex - fillValues.length] then fv}
					{#if fv}
						{@render fill_modal_body(fv)}
					{/if}
				{/await}
			{/if}
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

<KeyDownUpListener key="Shift" bind:down={isShiftDown} />
