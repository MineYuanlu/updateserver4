// See https://svelte.dev/docs/kit/types#app.d.ts

import type { UserSession } from '$lib/server/auth';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: UserSession | null;
		}
	}
}

export {};
