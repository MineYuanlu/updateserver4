import type { LayoutServerLoad } from './$types';
import { userJwt } from '$lib/server/user/jwt';
import { getProjectDetailById, getProjectUserRole } from '$lib/server/db/funcs';
import type { ProjId } from '$lib/common/project';
import { error } from '@sveltejs/kit';
import { hasPermission } from './menus';

export type ProjectDetailResp = NonNullable<Awaited<ReturnType<typeof getProjectDetailById>>>;

export const load: LayoutServerLoad = async (req) => {
	const pid = req.params.pid as ProjId;
	const user = await userJwt.getJwtCookie(req);
	const project = await getProjectDetailById(pid, user?.id);
	if (!project) return error(404);
	const role = user ? await getProjectUserRole(project.proj.id, user.id) : undefined;

	if (!hasPermission(pid, role, req.url.pathname)) error(403);

	return { project, role };
};
