import type { LayoutServerLoad } from './$types';
import { userJwt } from '$lib/server/user/jwt';
import { getProjectDetailById, getProjectUserRole } from '$lib/server/db/funcs';
import type { ProjId } from '$lib/common/project';
import { error } from '@sveltejs/kit';
import { WebRole } from '$lib/common/user';

export type ProjectDetailResp = NonNullable<Awaited<ReturnType<typeof getProjectDetailById>>>;

export const load: LayoutServerLoad = async (req) => {
	const user = await userJwt.getJwtCookie(req);
	if (user?.role !== WebRole.admin.val) error(404);

	return {};
};
