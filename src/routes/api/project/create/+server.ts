import type { RequestHandler } from './$types';
import { checkRequestField, failure, success } from '../../common';
import {
	api_project__err_invalid_name as err_invalid_name,
	api_project__err_name_taken as err_name_taken,
	api_project__err_invalid_visibility as err_invalid_visibility,
	api__need_login as err_need_login,
} from '$lib/paraglide/messages';
import { createProject } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import { maxProjectDescriptionLength, validateProjectName, Visibility } from '$lib/common/project';
import { generateId } from '$lib/server/common';
import { SqliteError } from 'better-sqlite3';

export const POST: RequestHandler = async (req) => {
	const user = await userJwt.getJwtCookie(req);
	if (!user) return failure(err_need_login());

	const { name, desc, visibility } = checkRequestField(await req.request.json(), {
		name: [validateProjectName, (_, name) => failure(err_invalid_name({ name }))],
		desc: validateProjectDesc,
		visibility: [
			Visibility._validateKey,
			(_, visibility) => failure(err_invalid_visibility({ visibility })),
		],
	});

	const projId = generateId('p');

	try {
		await createProject(projId, name, user.id, desc, Visibility._toValue(visibility));
	} catch (e) {
		if (e instanceof SqliteError) {
			if (e.code === 'SQLITE_CONSTRAINT_UNIQUE') return failure(err_name_taken({ name }));
		}
		throw e;
	}
	return success(projId);
};

function validateProjectDesc(desc: unknown): desc is string {
	if (typeof desc !== 'string') return false;
	if (desc.length > maxProjectDescriptionLength) return false;
	return true;
}
