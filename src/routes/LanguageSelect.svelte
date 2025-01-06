<script lang="ts">
	import { page } from '$app/stores';
	import CommandPalette from '$lib/components/CommandPalette/CommandPalette.svelte';
	import CpItem from '$lib/components/CommandPalette/CpItem.svelte';
	import { getRealPath } from '$lib/i18n';
	import { messages } from '$lib/paraglide/messages';
	import { availableLanguageTags, languageTag } from '$lib/paraglide/runtime';
	import { Enter } from '@steeze-ui/radix-icons';
	import { Icon } from '@steeze-ui/svelte-icon';

	let {
		open = $bindable(false),
	}: {
		open: boolean;
	} = $props();

	function filter(query: string, msg: string, tag: string) {
		query = query.toLowerCase();
		msg = msg.toLowerCase();
		tag = tag.toLowerCase();

		return msg.includes(query) || tag.includes(query);
	}
	const rel_path = $derived(getRealPath($page.url.pathname));
</script>

<CommandPalette bind:open controls={null}>
	{#snippet item(query, togglePalette)}
		{#each availableLanguageTags as tag}
			{@const msg = messages({}, { languageTag: tag })}
			{#if filter(query, msg, tag)}
				<CpItem onclick={() => togglePalette(false)} href={rel_path} hreflang={tag}>
					{#snippet title()}
						{msg} <small class="text-gray-500 dark:text-gray-400">{tag}</small>
					{/snippet}
					{#snippet suffix(hover)}
						{#if hover && tag !== languageTag()}
							<Icon src={Enter} class="h-4 w-4" />
						{/if}
					{/snippet}
				</CpItem>
			{/if}
		{/each}
	{/snippet}
</CommandPalette>
