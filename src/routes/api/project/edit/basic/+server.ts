import type { RequestHandler } from './$types';
import { checkRequestField, failure, failWhy, success } from '../../../common';
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
	validateProjectTag,
	Visibility,
	whyInvalidProjectDesc,
	whyInvalidProjectLinks,
	whyInvalidProjectName,
	whyInvalidProjectTag,
} from '$lib/common/project';
import {
	transformVersionCmpArgs,
	validateVersionCmpArgs,
	whyInvalidVersionCmpArgs,
} from '$lib/common/versions';
import { isConflictError } from '$lib/server/db/err';
import { WebRole } from '$lib/common/user';
import type { EnumKey } from '$lib/common/enum';

export type EditData = Omit<Parameters<typeof editProjectBasic>[1], 'visibility'> & {
	visibility?: EnumKey<typeof Visibility> | undefined;
};

export const POST: RequestHandler = async ({ url, cookies, request }) => {
	const user = await userJwt.getJwtCookie({ cookies });
	if (!user) error(403);

	const req = await request.json();

	const { id } = checkRequestField(req, {
		id: (v) => isUS4ID('p', v),
	});

	if (
		user.role !== WebRole.admin.val &&
		!(await checkPermByProjId(id, user.id, UserRole.developer.val))
	)
		error(403);

	const data = checkRequestField(req, {
		name: [okUn(validateProjectName), 0, failWhy(whyInvalidProjectName)],
		desc: [okUn(validateProjectDesc), 0, failWhy(whyInvalidProjectDesc)],
		visibility: [
			okUn(Visibility._validateKeyOrVal),
			tUn(Visibility._toValue),
			(_, visibility) => failure(err_invalid_visibility({ visibility })),
		],
		versionCmp: [
			okUn(validateVersionCmpArgs),
			tUn(transformVersionCmpArgs),
			failWhy(whyInvalidVersionCmpArgs),
		],
		links: [okUn(validateProjectLinks), 0, failWhy(whyInvalidProjectLinks)],
		tag: [okUn(validateProjectTag), 0, failWhy(whyInvalidProjectTag)],
	});

	let ok: boolean;
	try {
		ok = await editProjectBasic(id, data);
	} catch (e) {
		if (isConflictError(e)) failure(err_name_taken({ name: data.name ?? '?' }));
		throw e;
	}

	return success(ok);
};

/**
 * 允许 undefined 的字段
 * @param func 原始的校验函数
 * @returns 校验函数，允许 undefined 的字段
 */
const okUn = <T>(func: (v: unknown) => v is T) => {
	return (v: unknown): v is T | undefined => {
		if (v === undefined) return true;
		return func(v);
	};
};
const tUn = <T>(func: (v: unknown) => T) => {
	return (v: unknown): T | undefined => {
		if (v === undefined) return undefined;
		return func(v);
	};
};
