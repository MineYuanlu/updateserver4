import type { RequestHandler } from './$types';
import { listProjectUsers } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import { checkProjPerm } from '../../common';
import { createAPI } from '../../../api.server';
import { UserRole, zProjId } from '$lib/common/project';
import { z } from 'zod';
import { zUserId } from '$lib/common/user';

export type ListUsersResp = Awaited<ReturnType<typeof listProjectUsers>>;

export const _GET = createAPI()
	.summary('列出项目成员列表')
	.cookie({
		user: userJwt.zod.optional(),
	})
	.query({
		pid: zProjId.describe('项目ID'),
	})
	.success<ListUsersResp>(
		z.array(
			z.object({
				uid: zUserId.describe('用户ID'),
				name: z.string().describe('用户名'),
				role: UserRole._z_value.describe('用户角色'),
			}),
		),
	)
	.flatArgs(true)
	.tag('project');

/** 列出项目成员列表 */
export const GET: RequestHandler = _GET.handler(async (_, { user, pid }, success) => {
	await checkProjPerm(pid, user?.id);
	const users = await listProjectUsers(pid);
	return success(users);
});
