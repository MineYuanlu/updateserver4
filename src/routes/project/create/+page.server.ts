import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { langPrefix } from '../../api/common';

export const load: PageServerLoad = ({ locals }) => {
	if (!locals?.user) redirect(302, `${langPrefix()}/user/login`);
};
