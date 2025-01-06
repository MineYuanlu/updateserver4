import type { RequestHandler } from './$types';
import { createAPI } from '../../api.server';
import { z } from 'zod';
import { Visibility, zProjectTag, zProjId } from '$lib/common/project';
import { listTagProjects } from '$lib/server/db/funcs';
import { zUserId } from '$lib/common/user';
import { userJwt } from '$lib/server/user/jwt';

export type ListResp = Awaited<ReturnType<typeof listTagProjects>>;

export const _GET = createAPI()
	.summary('获取标签信息')
	.description('获取一个标签的详细信息')
	.cookie({
		user: userJwt.zod.optional(),
	})
	.query({
		tag: zProjectTag,
		offset: z.coerce.number().int().min(0).default(0),
		limit: z.coerce.number().int().min(1).max(1000).default(20),
		search: z.string().optional(),
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
	.tag('tag')
	.flatArgs(true);

export const GET: RequestHandler = _GET.handler(
	async (_, { tag, offset, limit, search, user }, success) => {
		return success(await listTagProjects(tag, offset, limit, search, user?.id));
	},
);
