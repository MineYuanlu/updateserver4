import { redirect } from '@sveltejs/kit';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ params, url }) => {
	const jwt = url.searchParams.get('jwt');
	const name = url.searchParams.get('name');
	const provider = params.provider;
	if (!jwt || !name) return redirect(302, '/user/login');
	return {
		jwt,
		name,
		provider
	};
};