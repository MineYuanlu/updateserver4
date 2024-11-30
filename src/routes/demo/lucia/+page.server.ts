import * as auth from '$lib/server/auth';
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	return { user: event.locals.user };
};

export const actions: Actions = {
	logout: async (event) => {
		auth.deleteSessionTokenCookie(event);

		return redirect(302, '/demo/lucia/login');
	},
};
