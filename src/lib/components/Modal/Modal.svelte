<script lang="ts">
	import type { Component, Snippet } from 'svelte';
	import type { Color } from '../color';

	type BtnProp = {
		label?: string;
		onClick?: () => void;
		bgColor?: Color;
		color?: Color;
	};
	let {
		icon: Icon,
		iconColor = 'blue',
		iconSnippet,
		title,
		content,
		body,
		btns: _btns = [],
		footer,
		onClose,
		onCancel,
		onConfirm
	}: {
		icon?: Component | any;
		iconColor?: Color;
		iconSnippet?: Snippet;
		title?: Snippet | string;
		content?: Snippet | string;
		body?: Snippet;
		btns?:
			| { label: string; onClick?: () => void; bgColor?: Color; color?: Color }[]
			| [string]
			| [string, string];
		footer?: Snippet;
		onClose?: () => void;
		onCancel?: () => void;
		onConfirm?: () => void;
	} = $props();

	const _fallbackBtns: BtnProp[] = $derived([
		{ onClick: onCancel, bgColor: 'gray', color: 'gray' },
		{ onClick: onConfirm, bgColor: 'blue', color: 'gray' }
	]);

	const _getBtns = (() => {
		function merge(btn: (typeof _btns)[number], fb: (typeof _fallbackBtns)[number]): BtnProp {
			if (typeof btn === 'string') btn = { label: btn };
			return {
				label: btn.label,
				onClick: btn?.onClick || fb.onClick,
				color: btn?.color || fb.color,
				bgColor: btn?.bgColor || fb.bgColor
			};
		}
		return (btns: typeof _btns, fbs: typeof _fallbackBtns): BtnProp[] => {
			if (btns.length === 1) return [merge(btns[0], fbs[1])];
			else if (btns.length === 2) return [merge(btns[0], fbs[0]), merge(btns[1], fbs[1])];
			else return btns as BtnProp[];
		};
	})();

	const btns = $derived(_getBtns(_btns, _fallbackBtns));
</script>

<div class="relative z-10" aria-labelledby="modal-title" role="dialog" aria-modal="true">
	<!--
      Background backdrop, show/hide based on modal state.
  
      Entering: "ease-out duration-300"
        From: "opacity-0"
        To: "opacity-100"
      Leaving: "ease-in duration-200"
        From: "opacity-100"
        To: "opacity-0"
    -->
	<div class="fixed inset-0 bg-gray-500/75 transition-opacity" aria-hidden="true"></div>

	<div class="fixed inset-0 z-10 w-screen overflow-y-auto">
		<div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
			<!--
          Modal panel, show/hide based on modal state.
  
          Entering: "ease-out duration-300"
            From: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            To: "opacity-100 translate-y-0 sm:scale-100"
          Leaving: "ease-in duration-200"
            From: "opacity-100 translate-y-0 sm:scale-100"
            To: "opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        -->
			<div
				class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg"
			>
				{#if body}
					{@render body()}
				{:else}
					<div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
						<div class="sm:flex sm:items-start">
							{#if iconSnippet}
								{@render iconSnippet()}
							{:else if Icon}
								<div
									class="mx-auto flex size-12 shrink-0 items-center justify-center rounded-full bg-{iconColor}-100 sm:mx-0 sm:size-10"
								>
									<Icon class="size-6 text-{iconColor}-600" />
								</div>
							{/if}
							<div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
								{#if typeof title === 'string'}
									<h3 class="text-base font-semibold text-gray-900" id="modal-title">
										{title}
									</h3>
								{:else if title}
									{@render title()}
								{/if}

								{#if typeof content === 'string'}
									<div class="mt-2">
										<p class="text-sm text-gray-500">
											{content}
										</p>
									</div>
								{:else if content}
									{@render content()}
								{/if}
							</div>
						</div>
					</div>
				{/if}
				{#if footer}
					{@render footer()}
				{:else}
					<div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
						{#each btns as { label, onClick, color = 'blue', bgColor = color }, i}
							<button
								type="button"
								class="{i
									? 'mt-3'
									: ''}inline-flex w-full justify-center rounded-md bg-{bgColor}-600 px-3 py-2 text-sm font-semibold text-{color}-100 shadow-sm hover:bg-{bgColor}-500 sm:ml-3 sm:w-auto"
							>
								{label}
							</button>
						{/each}
						<button
							type="button"
							class="inline-flex w-full justify-center rounded-md bg-red-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 sm:ml-3 sm:w-auto"
							>Deactivate</button
						>
						<button
							type="button"
							class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
							>Cancel</button
						>
					</div>
				{/if}
			</div>
		</div>
	</div>
</div>
