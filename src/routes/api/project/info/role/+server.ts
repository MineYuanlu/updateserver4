import type { RequestHandler } from './$types';
import { checkRequestField, failure, success } from '../../../common';
import { getProjectUserRole } from '$lib/server/db/funcs';
import { isUS4ID } from '$lib/common/id';
import { api__need_login, api_project__err_bad_id } from '$lib/paraglide/messages';
import { userJwt } from '$lib/server/user/jwt';
import { getProjId } from '../../common';

export type RoleResp = Awaited<ReturnType<typeof getProjectUserRole>>;

/** 获取当前用户在项目内的权限 */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const user = await userJwt.getJwtCookie({ cookies });
	if (!user) return failure(api__need_login());

	const pid = getProjId(url.searchParams);

	const role = await getProjectUserRole(pid, user.id);

	return success(role);
};
