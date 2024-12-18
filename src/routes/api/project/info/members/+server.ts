import type { RequestHandler } from './$types';
import { success } from '../../../common.server';
import { listProjectUsers } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import { checkProjPerm, getProjId } from '../../common';

export type ListUsersResp = Awaited<ReturnType<typeof listProjectUsers>>;

/** 获取当前用户在项目内的权限 */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const user = await userJwt.getJwtCookie({ cookies });
	const pid = getProjId(url.searchParams);
	await checkProjPerm(pid, user?.id);

	const users = await listProjectUsers(pid);

	return success(users);
};
