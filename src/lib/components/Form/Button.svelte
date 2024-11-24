<script lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		EventHandler,
		FocusEventHandler,
		FormEventHandler,
		KeyboardEventHandler,
		MouseEventHandler
	} from 'svelte/elements';

	const {
		children,
		onclick,
		onmouseover,
		onmouseout,
		onfocus,
		onblur,
		onkeydown,
		onkeyup,
		onkeypress,
		oninput,
		onchange,
		onsubmit,
		onreset,
		disabled,
		class: className,
		style
	}: {
		children: Snippet<[]>;
		onclick?: MouseEventHandler<HTMLButtonElement> | null | undefined;
		onmouseover?: MouseEventHandler<HTMLButtonElement> | null | undefined;
		onmouseout?: MouseEventHandler<HTMLButtonElement> | null | undefined;
		onfocus?: FocusEventHandler<HTMLButtonElement> | null | undefined;
		onblur?: FocusEventHandler<HTMLButtonElement> | null | undefined;
		onkeydown?: KeyboardEventHandler<HTMLButtonElement> | null | undefined;
		onkeyup?: KeyboardEventHandler<HTMLButtonElement> | null | undefined;
		onkeypress?: KeyboardEventHandler<HTMLButtonElement> | null | undefined;
		oninput?: FormEventHandler<HTMLButtonElement> | null | undefined;
		onchange?: FormEventHandler<HTMLButtonElement> | null | undefined;
		onsubmit?: EventHandler<SubmitEvent, HTMLButtonElement> | null | undefined;
		onreset?: FormEventHandler<HTMLButtonElement> | null | undefined;
		disabled?: boolean | undefined;
		class?: string | undefined;
		style?: string | undefined;
	} = $props();
</script>

<button
	{onclick}
	{onmouseover}
	{onmouseout}
	{onfocus}
	{onblur}
	{onkeydown}
	{onkeyup}
	{onkeypress}
	{oninput}
	{onchange}
	{onsubmit}
	{onreset}
	{disabled}
	class="{className} rounded-lg bg-blue-500 px-4 py-2 text-white hover:bg-blue-700 focus:outline-none dark:bg-blue-600 dark:text-gray-100"
	{style}
>
	{@render children()}
</button>
