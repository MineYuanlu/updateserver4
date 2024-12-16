import type { RequestHandler } from './$types';
import { checkRequestField, failure, success } from '../../common';
import { getProjectDetailById, listProjects } from '$lib/server/db/funcs';
import { isUS4ID } from '$lib/common/id';
import { api_project__err_bad_id, api_project__not_found } from '$lib/paraglide/messages';
import { userJwt } from '$lib/server/user/jwt';
import { getProjId } from '../common';
export type ListResp = Awaited<ReturnType<typeof listProjects>>;

/** 获取项目详情 */
export const GET: RequestHandler = async ({ cookies, url }) => {
	const pid = getProjId(url.searchParams);
	const user = await userJwt.getJwtCookie({ cookies });
	const project = await getProjectDetailById(pid, user?.id);
	if (!project) return failure(api_project__not_found());
	return success(project);
};
