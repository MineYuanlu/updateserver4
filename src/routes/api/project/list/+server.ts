import type { RequestHandler } from './$types';
import { listProjects } from '$lib/server/db/funcs';
import { z } from 'zod';
import { createAPI } from '../../api.server';
import { Visibility, zProjId } from '$lib/common/project';
import { zUserId } from '$lib/common/user';
import { userJwt } from '$lib/server/user/jwt';

export type ListResp = Awaited<ReturnType<typeof listProjects>>;

export const _GET = createAPI()
	.summary('List projects')
	.cookie({
		user: userJwt.zod.optional(),
	})
	.query({
		limit: z.coerce
			.number()
			.int()
			.min(1)
			.max(1000)
			.optional()
			.default(100)
			.describe('limit of projects to return'),
		offset: z.coerce
			.number()
			.int()
			.min(0)
			.optional()
			.default(0)
			.describe('offset of projects to return'),
	})
	.success<ListResp>(
		z.array(
			z.object({
				id: zProjId.describe('project ID'),
				name: z.string().describe('project name'),
				oid: zUserId.describe('owner ID'),
				owner: z.string().describe('owner name'),
				version: z.string().nullable().describe('project using version'),
				desc: z.string().describe('project description'),
				visibility: Visibility._z_value.describe('project visibility'),
				visits: z.number().int().nullable().describe('number of visits'),
			}),
		),
	)
	.tag('project')
	.flatArgs(true);

export const GET: RequestHandler = _GET.handler(async (_, { user, limit, offset }, success) => {
	return success(await listProjects(offset, limit, user?.id));
});
