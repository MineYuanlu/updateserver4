<script lang="ts">
	import type { Snippet } from 'svelte';
	import type {
		EventHandler,
		FocusEventHandler,
		FormEventHandler,
		KeyboardEventHandler,
		MouseEventHandler
	} from 'svelte/elements';
	import { colorPack2Class, type ColorPack, type PreSetColorPacks } from '../color';

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
		style,
		color = 'blue'
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
		color?: ColorPack | PreSetColorPacks;
	} = $props();
	const { t, dt, bg, hbg, dbg, dhbg, b, db } = $derived(colorPack2Class(color));
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
	class:border-2={!!b}
	class:dark:border-2={!!db}
	class="rounded-lg px-4 py-2 focus:outline-none {t} {dt} {bg} {hbg} {dbg} {dhbg} {b} {db} {className}"
	{style}
>
	{@render children()}
</button>
