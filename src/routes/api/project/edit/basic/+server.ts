import type { RequestHandler } from './$types';
import { checkRequestField, failure, failWhy, success } from '../../../common.server';
import { checkPermByProjId, editProjectBasic } from '$lib/server/db/funcs';
import { userJwt } from '$lib/server/user/jwt';
import { error } from '@sveltejs/kit';
import { isUS4ID } from '$lib/common/id';
import {
	api_project__err_invalid_visibility as err_invalid_visibility,
	api_project__err_name_taken as err_name_taken,
} from '$lib/paraglide/messages';
import {
	UserRole,
	validateProjectDesc,
	validateProjectLinks,
	validateProjectName,
	validateProjectTags,
	Visibility,
	whyInvalidProjectDesc,
	whyInvalidProjectLinks,
	whyInvalidProjectName,
	whyInvalidProjectTags,
	zProjectDesc,
	zProjectLinks,
	zProjectName,
	zProjectTags,
	zProjId,
} from '$lib/common/project';
import {
	transformVersionCmpArgs,
	validateVersionCmpArgs,
	whyInvalidVersionCmpArgs,
	zVersionCmpArgs,
} from '$lib/common/versions';
import { isConflictError } from '$lib/server/db/err';
import { WebRole, zUserId } from '$lib/common/user';
import type { EnumKey } from '$lib/common/enum';
import { createAPI } from '../../../api.server';
import { z } from 'zod';

export type EditData = Omit<Parameters<typeof editProjectBasic>[1], 'visibility'> & {
	visibility?: EnumKey<typeof Visibility> | undefined;
};

export const _POST = createAPI()
	.summary('Edit project basic information')
	.description(
		'Edit project basic information, such as name, description, visibility, links, tags, etc.',
	)
	.cookie({
		user: userJwt.zod,
	})
	.body({
		id: zProjId,
		name: zProjectName.optional(),
		desc: zProjectDesc.optional(),
		visibility: Visibility._z_toValue.optional(),
		versionCmp: zVersionCmpArgs.optional(),
		links: zProjectLinks.optional(),
		tags: zProjectTags.optional(),
	})
	.success<boolean>(z.boolean())
	.tag('project');

export const POST: RequestHandler = _POST.handler(
	async (_, { cookie: { user }, body: { id, ...data } }, success) => {
		if (
			user.role !== WebRole.admin.val &&
			!(await checkPermByProjId(id, user.id, UserRole.developer.val))
		)
			error(403);

		let ok: boolean;
		try {
			ok = await editProjectBasic(id, data);
		} catch (e) {
			if (isConflictError(e)) failure(err_name_taken({ name: data.name ?? '?' }));
			throw e;
		}

		return success(ok);
	},
);
