import { writable, type Writable } from 'svelte/store';

export const theme = writable<'dark' | 'light'>('light');
