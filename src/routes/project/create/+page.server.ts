import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { langPrefix } from '$lib/i18n';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals?.user) redirect(302, `${langPrefix()}/user/login`);
};
