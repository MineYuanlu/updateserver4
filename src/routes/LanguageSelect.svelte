<script lang="ts">
	import { page } from '$app/stores';
	import CommandPalette from '$lib/components/CommandPalette/CommandPalette.svelte';
	import CpItem from '$lib/components/CommandPalette/CpItem.svelte';
	import { messages } from '$lib/paraglide/messages';
	import {
		availableLanguageTags,
		languageTag,
		sourceLanguageTag,
		type AvailableLanguageTag
	} from '$lib/paraglide/runtime';
	import { Enter } from 'radix-icons-svelte';

	let {
		open = $bindable(false)
	}: {
		open: boolean;
	} = $props();

	function filter(query: string, msg: string, tag: string) {
		query = query.toLowerCase();
		msg = msg.toLowerCase();
		tag = tag.toLowerCase();

		return msg.includes(query) || tag.includes(query);
	}
	function languagePath(tag: AvailableLanguageTag) {
		return tag === sourceLanguageTag ? '' : `/${tag}`;
	}
	const rel_path = $derived.by(() => {
		let path = $page.url.pathname;
		for (const lang of availableLanguageTags) {
			if (lang === sourceLanguageTag) continue;
			const prefix = languagePath(lang);
			if (path.startsWith(prefix)) {
				path = path.substring(prefix.length);
				break;
			}
		}
		if (!path.startsWith('/')) path = `/${path}`;
		return path;
	});
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
							<Enter />
						{/if}
					{/snippet}
				</CpItem>
			{/if}
		{/each}
	{/snippet}
</CommandPalette>
