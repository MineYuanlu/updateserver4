// See https://svelte.dev/docs/kit/types#app.d.ts

import type { UserSession } from '$lib/common/user';

// for information about these interfaces
declare global {
	namespace App {
		interface Locals {
			user?: UserSession | null;
		}
		interface Error {
			message: string;
			code: number;
		}
	}
}

export {};
