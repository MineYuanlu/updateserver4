import type { RequestHandler } from './$types';
import { createOAuthProvider } from '$lib/server/db/funcs';
import { checkRequestField, failure, success } from '../../../../common.server';
import { OAuthProviderTypeNames, type OAuthProviderTypeName } from '$lib/common/oauth';
import { isWebAdmin } from '../../../../perm';
import { error } from '@sveltejs/kit';
import { isConflictError } from '$lib/server/db/err';
import { api_user_oauth_providers__create_name_taken } from '$lib/paraglide/messages';
import {
	validateName,
	validateDesc,
	validateType,
	validateClientId,
	validateClientSecret_Create,
	validateRedirectUri,
} from '../checkers';

export type ReqData = {
	name: string;
	desc: string;
	type: string;
	client_id: string;
	client_secret: string;
	redirect_uri: string;
};

export const POST: RequestHandler = async ({ request, cookies }) => {
	if (!isWebAdmin({ cookies })) return error(404);

	const { name, desc, type, client_id, client_secret, redirect_uri } = checkRequestField(
		await request.json(),
		{
			name: validateName,
			desc: validateDesc,
			type: validateType,
			client_id: validateClientId,
			client_secret: validateClientSecret_Create,
			redirect_uri: validateRedirectUri,
		},
	);

	try {
		await createOAuthProvider(name, desc, type, client_id, client_secret, redirect_uri);
	} catch (e) {
		if (isConflictError(e)) return failure(api_user_oauth_providers__create_name_taken({ name }));
		throw e;
	}

	return success(true);
};
