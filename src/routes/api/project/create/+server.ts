import type { RequestHandler } from './$types';
import { checkRequestField, failure, failWhy, success } from '../../common';
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
} from '$lib/common/project';
import { generateId } from '$lib/server/common';
import { SqliteError } from 'better-sqlite3';
import { isConflictError } from '$lib/server/db/err';

export const POST: RequestHandler = async (req) => {
	const user = await userJwt.getJwtCookie(req);
	if (!user) return failure(err_need_login());

	const { name, desc, visibility } = checkRequestField(await req.request.json(), {
		name: [validateProjectName, 0, failWhy(whyInvalidProjectName)],
		desc: [validateProjectDesc, 0, failWhy(whyInvalidProjectDesc)],
		visibility: [
			Visibility._validateKeyOrVal,
			Visibility._toValue,
			(_, visibility) => failure(err_invalid_visibility({ visibility })),
		],
	});

	const projId = generateId('p');

	try {
		await createProject(projId, name, user.id, desc, visibility);
	} catch (e) {
		if (isConflictError(e)) return failure(err_name_taken({ name }));
		throw e;
	}
	return success(projId);
};
