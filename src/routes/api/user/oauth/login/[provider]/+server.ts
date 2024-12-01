import type { RequestHandler } from './$types';
import { getOAuthProvider } from '$lib/server/db/funcs';
import { buildURL, OAuthProviderTypes } from '$lib/server/oauth';
import { generateRandomString } from '$lib/server/common';
import { COOKIES } from '$lib/common/cookies';
import {
	api_user_oauth_login_provider__err_not_found as err_not_found,
	api_user_oauth_login_provider__err_invalid_provider as err_invalid_provider,
} from '$lib/paraglide/messages.js';
import { failure, success } from '../../../../common';

export const POST: RequestHandler = async (req) => {
	const provider_name = req.params.provider;
	const provider = await getOAuthProvider(provider_name);
	if (!provider) return failure(err_not_found({ name: provider_name }), 1);

	const type = OAuthProviderTypes[provider.type as keyof typeof OAuthProviderTypes];
	if (!type) return failure(err_invalid_provider({ type: provider.type }), 2);

	const redirect_uri = (() => {
		const url = new URL(provider.redirectUri);
		url.pathname = `/user/login/oauth/${provider_name}/callback`;
		return url.toString();
	})();
	const state = generateRandomString(16, 36);

	const url = buildURL(type.authorize, {
		client_id: provider.clientId,
		redirect_uri,
		state,
	});

	req.cookies.set(COOKIES.OAuthState, `${state}|${redirect_uri}`, {
		path: '/',
	});

	return success(url);
};
