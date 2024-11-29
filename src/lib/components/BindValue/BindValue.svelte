<script lang="ts">
	import { pushState, replaceState } from '$app/navigation';
	import { onMount } from 'svelte';
	import { update } from './updater';
	import { browser } from '$app/environment';

	let {
		bind,
		value = $bindable(),
		replace = false,
		handler = (newVal: any) => (value = newVal)
	}: {
		/**需要绑定的查询参数的名称*/
		bind: string;
		/**当前绑定的值*/
		value: string;
		/**是否在更新时替换历史记录 (默认 false, 即每次变动都添加到历史记录)*/
		replace?: boolean;
		/**当查询参数变化时调用的处理函数 (默认为更新 value)*/
		handler?: (newVal: any) => void;
	} = $props();

	function updateURL() {
		if (!bind) return;
		const old = new URLSearchParams(window.location.search).get(bind);
		if (old === value) return;
		const url = new URL(window.location.href);
		url.searchParams.set(bind, value);

		if (replace) replaceState(url.toString(), {});
		else pushState(url.toString(), {});
		$update++;
	}

	let oldValue = value;

	$effect(() => {
		if (oldValue !== value) {
			updateURL();
			oldValue = value;
		}
	});
	function f(..._: any) {
		const newValue = new URLSearchParams(window.location.search).get(bind);
		if (oldValue !== newValue) handler(newValue);
	}
	if (browser) f();
	onMount(() => {
		return update.subscribe(() => f());
	});
</script>

<!-- @component
URL参数双向绑定, 仅脚本
 -->
