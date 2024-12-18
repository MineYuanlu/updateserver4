import type { RequestHandler } from './$types';
import { checkRequestField, failure, failWhy, success } from '../../common.server';
import {
	api_project__err_name_taken as err_name_taken,
	api_project__err_invalid_visibility as err_invalid_visibility,
	api__need_login as err_need_login,
} from '$lib/paraglide/messages';
import { createProject } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import {
	validateProjectDesc,
	validateProjectName,
	Visibility,
	whyInvalidProjectDesc,
	whyInvalidProjectName,
	zProjId,
	type ProjId,
} from '$lib/common/project';
import { generateId } from '$lib/server/common';
import { isConflictError } from '$lib/server/db/err';
import { createAPI } from '../../api.server';
import { z } from 'zod';

export const _POST = createAPI()
	.summary('Create a new project')
	.description('Create a new project with the given name, description, and visibility.')
	.cookie({
		user: userJwt.zod,
	})
	.body({
		name: z.string().refine(validateProjectName, (t) => ({ message: whyInvalidProjectName(t) })),
		desc: z.string().refine(validateProjectDesc, (t) => ({ message: whyInvalidProjectDesc(t) })),
		visibility: Visibility._z_toValue,
	})
	.success<ProjId>(zProjId)
	.flatArgs(true);

export const POST: RequestHandler = _POST.handler(
	async (_, { name, desc, visibility, user }, success) => {
		const projId = generateId('p');
		try {
			await createProject(projId, name, user.id, desc, visibility);
		} catch (e) {
			if (isConflictError(e)) return failure(err_name_taken({ name }));
			throw e;
		}
		return success(projId);
	},
);

// export const POST: RequestHandler = async (req) => {
// 	const user = await userJwt.getJwtCookie(req);
// 	if (!user) return failure(err_need_login());

// 	const { name, desc, visibility } = checkRequestField(await req.request.json(), {
// 		name: [validateProjectName, 0, failWhy(whyInvalidProjectName)],
// 		desc: [validateProjectDesc, 0, failWhy(whyInvalidProjectDesc)],
// 		visibility: [
// 			Visibility._validateKeyOrVal,
// 			Visibility._toValue,
// 			(_, visibility) => failure(err_invalid_visibility({ visibility })),
// 		],
// 	});

// 	const projId = generateId('p');

// 	try {
// 		await createProject(projId, name, user.id, desc, visibility);
// 	} catch (e) {
// 		if (isConflictError(e)) return failure(err_name_taken({ name }));
// 		throw e;
// 	}
// 	return success(projId);
// };
