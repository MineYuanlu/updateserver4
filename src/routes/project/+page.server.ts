import type { PageServerLoad } from './$types';
import { listProjects } from '$lib/server/db/funcs';

export const load: PageServerLoad = async (req) => {
	const page = parseInt(req.url.searchParams.get('page') ?? '1');
	const pageSize = 20;
	let preData: { data: Awaited<ReturnType<typeof listProjects>>; offset: number; limit: number };
	if (isNaN(page) || page < 1) {
		preData = { data: [], offset: 0, limit: 0 };
	} else {
		const offset = (page - 1) * pageSize;
		const limit = pageSize;
		preData = { data: await listProjects(offset, limit), offset, limit };
	}
	return { preData };
};
