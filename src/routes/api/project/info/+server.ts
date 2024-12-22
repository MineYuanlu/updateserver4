import type { RequestHandler } from './$types';
import { failure } from '../../common.server';
import { getProjectDetailById } from '$lib/server/db/funcs';
import { api_project__not_found } from '$lib/paraglide/messages';
import { userJwt } from '$lib/server/user/jwt';
import { createAPI } from '../../api.server';
import { Visibility, zProjId } from '$lib/common/project';
import { z } from 'zod';
import { zUserId } from '$lib/common/user';

export const _GET = createAPI()
	.summary('获取项目详情')
	.query({
		pid: zProjId,
	})
	.cookie({
		user: userJwt.zod.optional(),
	})
	.success<Awaited<ReturnType<typeof getProjectDetailById>>>(
		z.object({
			proj: z.object({
				id: zProjId.describe('project ID'),
				name: z.string().describe('project name'),
				oid: zUserId.describe('owner ID'),
				owner: z.string().nullable().describe('owner name'),
				desc: z.string().describe('project description'),
				visibility: Visibility._z_value.describe('project visibility'),
				version: z.string().nullable().describe('project using version'),
				versionCmp: z.object({}),
				createdAt: z.number().int().nullable().describe('project created time'),
				links: z.record(z.string()).describe('project links'),
			}),
			versions: z.array(
				z.object({
					version: z.string().describe('version name'),
					desc: z.string().nullable().describe('version description'),
					time: z.number().int().describe('version created time'),
					link: z.string().nullable().describe('version link'),
				}),
			),
			tags: z.array(z.string()).describe('project tags'),
		}),
	)
	.tag('project')
	.flatArgs(true);

/** 获取项目详情 */
export const GET: RequestHandler = _GET.handler(async (_, { pid, user }, success) => {
	const project = await getProjectDetailById(pid, user?.id);
	if (!project) return failure(api_project__not_found());
	return success(project);
});
