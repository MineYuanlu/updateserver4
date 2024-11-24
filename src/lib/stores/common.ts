import { onMount, type Snippet } from 'svelte';
import { writable } from 'svelte/store';

export const navbar = writable<Snippet | undefined>(undefined);

export const setNavBar = (_navbar: Snippet) => {
	onMount(() => {
		navbar.set(_navbar);
		return () => navbar.set(undefined);
	});
};
