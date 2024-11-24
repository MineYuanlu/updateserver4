<script lang="ts">
	import { page } from '$app/stores';

	let {
		bind,
		value = $bindable(),
		replace: replaceState = false,
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
		const old = $page.url.searchParams.get(bind);
		if (old === value) return;
		console.log('update bind', old, value);
		const url = new URL(window.location.href);
		url.searchParams.set(bind, value);
		if (replaceState) window.history.replaceState({}, '', url.toString());
		else window.history.pushState({}, '', url.toString());
	}

	let oldValue = value;

	$effect(() => {
		if (oldValue !== value) {
			updateURL();
			oldValue = value;
		}
	});
	$effect(() => {
		const newValue = $page.url.searchParams.get(bind);
		if (oldValue !== newValue) handler(newValue);
	});
</script>

<!-- @component
URL参数双向绑定
 -->
