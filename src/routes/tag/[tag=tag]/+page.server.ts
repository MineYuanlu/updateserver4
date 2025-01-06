import { listTagProjects } from '$lib/server/db/funcs';
import { _GET } from '../../api/tag/info/+server';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async (event) => {
	const params = new URLSearchParams(event.url.searchParams);
	params.set('tag', event.params.tag);
	const { tag, offset, limit, search } = await _GET.parseQuery(params);

	const projects = await listTagProjects(tag, offset, limit, search, event.locals.user?.id);
	console.log('projects', projects, 'params', tag, offset, limit, search, params);
	return {
		projects,
	};
};
