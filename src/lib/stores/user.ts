import type { UserSession } from '$lib/common/user';
import { writable } from 'svelte/store';

export const user = writable<UserSession | undefined | null>(undefined);
