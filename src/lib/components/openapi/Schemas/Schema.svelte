<script module lang="ts">
	const t_unknown = 'unknown' as const;
	const t_basic = ['string', 'number', 'integer', 'boolean'] as const;
</script>

<script lang="ts">
	import {
		isSchemaObject,
		type ParameterObject,
		type SchemaObject,
		type SchemaObjectType,
	} from 'openapi3-ts/oas30';
	import Box from './Box.svelte';
	import { remRef } from '../utils';
	import BasicInput from './BasicInput.svelte';
	import {
		component_openapi_schemas_schema__default as m_default,
		component_openapi_schemas_schema__example_noname as m_example_noname,
		component_openapi_schemas_schema__fill as m_fill,
		component_openapi_schemas_schema__param_detail as m_param_detail,
	} from '$lib/paraglide/messages';
	import Modal from '$lib/components/Modal/Modal.svelte';

	let {
		param,
		value = $bindable(),
	}: {
		param: ParameterObject;
		value?: any;
	} = $props();

	const schema = $derived(remRef(param.schema));

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

	const defaults = $derived.by(() => {
		const data: [string, any][] = [];
		if (schema?.default) data.push([m_default(), schema.default]);
		if (param.example) data.push([m_example_noname(), param.example]);
		if (param.examples) {
			if (Array.isArray(param.examples))
				data.push(
					...param.examples.map((v) => [m_example_noname(), v] satisfies [string | undefined, any]),
				);
			else data.push(...Object.entries(param.examples));
		}
		if (schema) {
			if (schema.example) data.push([m_example_noname(), schema.example]);
			if (schema.examples) {
				if (Array.isArray(schema.examples))
					data.push(
						...schema.examples.map(
							(v) => [m_example_noname(), v] satisfies [string | undefined, any],
						),
					);
				else data.push(...Object.entries(schema.examples));
			}
		}
		return data;
	});
	// svelte-ignore state_referenced_locally
	if (value === undefined && defaults.length > 0) value = defaults[0][1];

	let fillModalOpen = $state(false);
	let fillSelectedIndex = $state<number>(0);

	const doFill = () => {
		if (defaults.length < 1) return;
		if (defaults.length === 1) {
			value = defaults[0][1];
		} else {
			fillModalOpen = true;
			fillSelectedIndex = 0;
		}
	};

	let detailModalOpen = $state(false);
</script>

<Box
	name={param.name}
	type={param.in}
	description={param.description}
	required={param.required || param.in === 'path'}
	deprecated={param.deprecated}
>
	{#snippet extra1()}
		<span class="text-xs">
			<span>类型:&nbsp;[&nbsp;</span>{#each types as t, i}{#if i}<span
						class="text-sm text-gray-500 dark:text-gray-400">&nbsp;,&nbsp;</span
					>{/if}{#if t === type}<span
						class="cursor-pointer font-mono font-medium text-black dark:text-white">{t}</span
					>{:else}<button
						class="font-mono text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500"
						onclick={() => (type = t)}
						role="link">{t}</button
					>{/if}{/each}<span>&nbsp;]</span>
		</span>
	{/snippet}
	{#snippet extra2()}
		{#if defaults.length}
			<span>
				<button class="font-mono font-medium text-black dark:text-white" onclick={doFill}>
					[&nbsp;{defaults.length === 1 ? defaults[0][0] : m_fill()}&nbsp;]
				</button>
			</span>
			<span>
				<button
					class="font-mono font-medium text-black dark:text-white"
					onclick={() => (detailModalOpen = true)}
				>
					[&nbsp;{defaults.length === 1 ? defaults[0][0] : m_param_detail()}&nbsp;]
				</button>
			</span>
		{/if}
	{/snippet}
	{#key type}
		{#if t_basic.includes(type as any)}
			<BasicInput
				{param}
				type={type as (typeof t_basic)[number]}
				bind:value
				schema={schema as SchemaObject}
			/>
		{:else}
			123
		{/if}
	{/key}
</Box>
<!-- 样例选择 -->
<Modal
	bind:open={fillModalOpen}
	title="选择样例值"
	btns={['确定', '取消']}
	onConfirm={() => {
		value = defaults[fillSelectedIndex][1];
	}}
>
	{#snippet body(toggle)}
		<div class="flex flex-col gap-4 p-4">
			<div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
				{#each defaults as [name], i}
					<button
						class="px-4 py-2 {fillSelectedIndex === i
							? 'border-b-2 border-blue-500 font-medium text-blue-500'
							: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
						onclick={() => (fillSelectedIndex = i)}
						ondblclick={() => {
							value = defaults[fillSelectedIndex][1];
							toggle(false);
						}}
					>
						{name}
					</button>
				{/each}
			</div>

			<div class="max-h-96 overflow-auto rounded bg-gray-100 p-4 dark:bg-gray-900">
				<pre class="whitespace-pre-wrap font-mono text-sm">
					{JSON.stringify(defaults[fillSelectedIndex][1], null, 2)}
				</pre>
			</div>
		</div>
	{/snippet}
</Modal>

<!-- 参数详情 -->
<Modal bind:open={detailModalOpen} title="参数详情">
	{#snippet content()}
		<div class="p-4">
			<pre>{JSON.stringify(param, null, 2)}</pre>
		</div>
	{/snippet}
</Modal>
