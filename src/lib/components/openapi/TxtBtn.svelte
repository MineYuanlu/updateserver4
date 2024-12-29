<script lang="ts">
	let {
		label,
		btn: _btn,
		active: _active = true,
		value = $bindable(),
		onclick = (_, idx) => (_active = idx),
		class: clazz,
	}: {
		label?: string;
		btn: string | string[];
		active?: boolean | number;
		value?: string;
		onclick?: (label: string, idx: number, event: MouseEvent) => void;
		class?: string;
	} = $props();

	const btn = $derived(typeof _btn === 'string' ? [_btn] : _btn);
	const active = $derived(typeof _active === 'number' ? _active : _active ? 0 : -1);

	$effect(() => {
		value = btn[active];
	});
</script>

<!-- @component
文本按钮, 展示一个形如 `[ btn ]` 或 `[ btn1, btn2 ]` 的文本内容, 点击后触发事件
 -->
<span class="text-xs {clazz}">
	<span
		>{#if label !== undefined}{label}:&nbsp;{/if}[</span
	>{#each btn as t, i}{#if i}<span class="text-sm text-gray-500 dark:text-gray-400">,</span
			>{/if}{#if i === active}<button
				class="cursor-pointer font-mono font-medium text-black dark:text-white"
				onclick={(e) => onclick?.(t, i, e)}
				role="link">&nbsp;{t}&nbsp;</button
			>{:else}<button
				class="font-mono text-gray-500 hover:text-blue-500 dark:text-gray-400 dark:hover:text-blue-500"
				onclick={(e) => onclick?.(t, i, e)}
				role="link">&nbsp;{t}&nbsp;</button
			>{/if}{/each}<span>]</span>
</span>
