import type { RequestHandler } from '../$types';
import { getOAuthProvider, getUserInfoByOAuth } from '$lib/server/db/funcs';
import { buildURL, execute, OAuthProviderTypes, parseResp } from '$lib/server/oauth';
import { error, redirect } from '@sveltejs/kit';
import { generateRandomString } from '$lib/server/common';
import {
	api_user_oauth_login_provider__err_not_found as err_not_found,
	api_user_oauth_login_provider__err_invalid_provider as err_invalid_provider,
	api_user_oauth_login_provider_callback__err_no_cookie as err_no_cookie,
	api_user_oauth_login_provider_callback__err_bad_state as err_bad_state
} from '$lib/paraglide/messages.js';
import { COOKIES } from '$lib/common/cookies';
import { failure, success } from '../../../../../common';
import { createSessionTokenCookie } from '$lib/server/auth';

export const GET: RequestHandler = async (req) => {
	const state_info = req.cookies.get(COOKIES.OAuthState);
	if (!state_info) return failure(err_no_cookie(), 1);

	const provider_name = req.params.provider;
	const provider = await getOAuthProvider(provider_name);
	if (!provider) return failure(err_not_found({ name: provider_name }), 1);

	const [req_state, redirect_uri] = state_info.split('|', 2);

	const type = OAuthProviderTypes.find((t) => t.name === provider.type);
	if (!type) return failure(err_invalid_provider({ type: provider.type }), 2);

	const { code, state } = await parseResp(
		type.authorize,
		Object.fromEntries(req.url.searchParams.entries())
	);

	if (state !== req_state) return failure(err_bad_state(), 1);

	const { access_token, token_type, scope } = await execute(type.access_token, {
		client_id: provider.clientId,
		client_secret: provider.clientSecret,
		code,
		redirect_uri,
		state
	});

	const { id, name, info } = await execute(type.get_user, {
		client_id: provider.clientId,
		client_secret: provider.clientSecret,
		code,
		redirect_uri,
		state,
		access_token,
		token_type,
		scope
	});

	const user_info = await getUserInfoByOAuth(provider_name, id);
	if (user_info) {
		await createSessionTokenCookie(req, user_info);
		return success();
	}
};
