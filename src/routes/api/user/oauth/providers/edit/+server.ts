import type { RequestHandler } from './$types';
import { editOAuthProvider } from '$lib/server/db/funcs';
import { checkRequestField, failure, success } from '../../../../common.server';
import {
	validateName,
	validateDesc,
	validateType,
	validateClientId,
	validateClientSecret_Edit,
	validateRedirectUri,
} from '../checkers';
import { isWebAdmin } from '../../../../perm';
import { error } from '@sveltejs/kit';
import { isConflictError } from '$lib/server/db/err';
import {
	api_user_oauth_providers__edit_name_taken,
	api_user_oauth_providers__edit_not_found,
} from '$lib/paraglide/messages';

export type ReqData = {
	old: string;
	name: string;
	desc: string;
	type: string;
	client_id: string;
	client_secret: string;
	redirect_uri: string;
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	if (!isWebAdmin({ cookies })) return error(404);
	const { old, name, desc, type, client_id, client_secret, redirect_uri } = checkRequestField(
		await request.json(),
		{
			old: validateName,
			name: validateName,
			desc: validateDesc,
			type: validateType,
			client_id: validateClientId,
			client_secret: [validateClientSecret_Edit, (v: string) => v || null],
			redirect_uri: validateRedirectUri,
		},
	);

	let found = false;
	try {
		const ret = await editOAuthProvider(
			old,
			name,
			desc,
			type,
			client_id,
			client_secret,
			redirect_uri,
		);
		found = ret.changes > 0;
	} catch (e) {
		if (isConflictError(e)) return failure(api_user_oauth_providers__edit_name_taken({ name }));
		throw e;
	}
	if (!found) return failure(api_user_oauth_providers__edit_not_found({ name: old }));

	return success(true);
};
