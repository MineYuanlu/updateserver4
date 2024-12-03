import type { PageServerLoad } from './$types';
import { userJwt } from '$lib/server/user/jwt';
import { getProjectDetailById } from '$lib/server/db/funcs';
import type { ProjId } from '$lib/common/project';
import { error } from '@sveltejs/kit';

export type ProjectDetailResp = NonNullable<Awaited<ReturnType<typeof getProjectDetailById>>>;

export const load: PageServerLoad = async (req) => {
	const pid = req.params.pid as ProjId;
	const user = await userJwt.getJwtCookie(req);
	const project = await getProjectDetailById(pid, user?.id);
	if (!project) return error(404);

	return { project };
};
