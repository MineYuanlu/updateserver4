import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkPermGetProjIdByName } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import { validateProjectName } from '$lib/common/project';
import { langPrefix } from '$lib/i18n';

/** /p/[pname] -> /project/[pid] */
export const load: PageServerLoad = async (req) => {
	const name = req.params.pname;
	if (!validateProjectName(name)) error(400);
	const user = await userJwt.getJwtCookie(req);
	const pid = await checkPermGetProjIdByName(req.params.pname, user?.id);

	if (!pid) error(404);
	redirect(302, `${langPrefix()}/project/${pid}`);
};
