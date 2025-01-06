import type { RequestHandler } from './$types';
import { failure } from '../../common.server';
import { api_project__err_name_taken as err_name_taken } from '$lib/paraglide/messages';
import { createProject, updateProjectUserRole } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import {
	UserRole,
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
	.tag('project')
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
		await updateProjectUserRole(projId, user.id, UserRole.owner.val);

		return success(projId);
	},
);
