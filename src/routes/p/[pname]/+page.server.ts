import { error, redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { checkPermGetProjIdByName } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import { languageTag } from '$lib/paraglide/runtime';
import { langPrefix } from '../../api/common';
import { validateProjectName } from '$lib/common/project';

export const load: PageServerLoad = async (req) => {
	const name = req.params.pname;
	if (!validateProjectName(name)) error(400);
	const user = await userJwt.getJwtCookie(req);
	const pid = await checkPermGetProjIdByName(req.params.pname, user?.id);

	if (!pid) error(404);
	languageTag;
	redirect(302, `${langPrefix()}/project/${pid}`);
};
