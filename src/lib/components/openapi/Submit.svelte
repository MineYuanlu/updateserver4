<script module lang="ts">
	import { javascript as CodeMirrorJavaScript } from '@codemirror/lang-javascript';
	import { java as CodeMirrorJava } from '@codemirror/lang-java';
	import { python as CodeMirrorPython } from '@codemirror/lang-python';
	import { go as CodeMirrorGo } from '@codemirror/lang-go';
	import type { LanguageSupport } from '@codemirror/language';

	const langs: Record<CodeGenType, LanguageSupport | null> = {
		JavaScript: CodeMirrorJavaScript(),
		Java: CodeMirrorJava(),
		Python: CodeMirrorPython(),
		Go: CodeMirrorGo(),
		cURL: null,
	};
</script>

<script lang="ts">
	import { page } from '$app/stores';
	import type { OperationObject, ParameterObject } from 'openapi3-ts/oas30';
	import Button from '../Form/Button.svelte';
	import KeyDownUpListener from '../Global/KeyDownUpListener.svelte';
	import Modal from '../Modal/Modal.svelte';
	import { codeGenSelectType, codeGenTypes, makeCode, makeReq, type CodeGenType } from './submits';
	import CodeMirror from 'svelte-codemirror-editor';
	import { json as CodeMirrorJson } from '@codemirror/lang-json';
	import { oneDark as CodeMirrorOneDark } from '@codemirror/theme-one-dark';
	import { theme } from '$lib/stores/theme';
	let {
		media,
		values,
		noValues,
		invalid,
		path,
		method,
		color,
		op,
		doFastFill,
	}: {
		media: string | undefined;
		values: any[];
		noValues: boolean[];
		invalid: boolean[];
		path: string;
		method: string;
		color: any;
		op: OperationObject;
		doFastFill: () => void;
	} = $props();

	const reqs = $derived(makeReq(method, $page.url.href, media, op, values, noValues, path));

	let isShiftDown = $state(false);
	let codeModalOpen = $state(false);
</script>

<div class="flex flex-col gap-2">
	<div class="rounded-md border p-3 {color.border}">
		<div class="flex flex-col gap-2">
			<div class="flex items-center gap-2">
				<span class="text-sm font-medium">请求信息</span>
			</div>

			<div class="flex flex-col gap-1 text-sm">
				<div class="flex items-center gap-2">
					<span class="font-medium {color.t}">{reqs.method}:</span>
					<span class="whitespace-pre-wrap break-all font-mono">{reqs.url}</span>
				</div>
				{#if reqs.headers.length}
					<span class="rounded-md border border-gray-200 p-2 font-mono dark:border-gray-800">
						<pre>{reqs.headers.map(([k, v]) => `${k}: ${v}`).join('\n')}</pre>
					</span>
				{/if}
			</div>
		</div>
	</div>
</div>
<div class="flex items-center gap-2">
	{#if op.parameters || op.requestBody}
		<Button color="secondary" onclick={doFastFill}>填充参数</Button>
	{/if}
	<Button color="secondary" onclick={() => (codeModalOpen = true)}>生成代码</Button>
	<Button color="white" disabled={!isShiftDown && invalid.some((v) => v)}
		>&nbsp;发送请求&nbsp;</Button
	>
</div>
<KeyDownUpListener key="Shift" bind:down={isShiftDown} />

<!-- 生成代码 -->
<Modal bind:open={codeModalOpen} title="生成代码" btns={['确定', '取消']}>
	{#snippet body()}
		<div class="flex flex-col gap-4 p-4">
			<div class="flex gap-2 border-b border-gray-200 dark:border-gray-700">
				{#each codeGenTypes as type}
					<button
						class="px-4 py-2 {$codeGenSelectType === type
							? 'border-b-2 border-blue-500 font-medium text-blue-500'
							: 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}"
						onclick={() => ($codeGenSelectType = type)}
					>
						{type}
					</button>
				{/each}
			</div>

			<div class="max-h-96 overflow-auto rounded p-4">
				<CodeMirror
					value={makeCode(reqs, $codeGenSelectType)}
					lang={langs[$codeGenSelectType]}
					theme={$theme === 'dark' ? CodeMirrorOneDark : undefined}
					readonly
					editable={false}
				/>
			</div>
		</div>
	{/snippet}
</Modal>
