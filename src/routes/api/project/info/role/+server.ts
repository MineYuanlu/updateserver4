import type { RequestHandler } from './$types';
import { getProjectUserRole } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import { createAPI } from '../../../api.server';
import { UserRole, zProjId } from '$lib/common/project';

export type RoleResp = Awaited<ReturnType<typeof getProjectUserRole>>;

export const _GET = createAPI()
	.summary('获取当前用户在项目内的权限')
	.cookie({
		user: userJwt.zod.describe('用户JWT'),
	})
	.query({
		pid: zProjId.describe('项目ID'),
	})
	.success<RoleResp>(UserRole._z_value.optional().describe('用户在项目内的权限'))
	.flatArgs(true)
	.tag('project');

/** 获取当前用户在项目内的权限 */
export const GET: RequestHandler = _GET.handler(async (_, { user, pid }, success) => {
	const role = await getProjectUserRole(pid, user.id);
	return success(role);
});
