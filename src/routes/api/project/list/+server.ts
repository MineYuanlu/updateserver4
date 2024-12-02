import type { RequestHandler } from './$types';
import { failure_common_invalid_field, success } from '../../common';
import { listProjects } from '$lib/server/db/funcs';
export type ListResp = Awaited<ReturnType<typeof listProjects>>;

export const GET: RequestHandler = async ({ url }) => {
	const offset = parseInt(url.searchParams.get('offset') || '0');
	const limit = parseInt(url.searchParams.get('limit') || '100');
	if (isNaN(offset)) failure_common_invalid_field(offset);
	if (isNaN(limit)) failure_common_invalid_field(limit);

	const resp = await listProjects(offset, limit);

	return success(resp);
};
