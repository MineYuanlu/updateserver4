import type { RequestHandler } from './$types';
import { createOAuthUser, getOAuthProvider, getUserInfoByOAuth } from '$lib/server/db/funcs';
import { execute, OAuthProviderTypes, parseResp } from '$lib/server/oauth';
import {
	api_user_oauth_login_provider__err_not_found as err_not_found,
	api_user_oauth_login_provider__err_invalid_provider as err_invalid_provider,
	api_user_oauth_login_provider_callback__err_no_cookie as err_no_cookie,
	api_user_oauth_login_provider_callback__err_bad_state as err_bad_state,
} from '$lib/paraglide/messages.js';
import { COOKIES } from '$lib/common/cookies';
import { failure, success } from '../../../../../common';
import { oauthRegisterJwt, userJwt } from '$lib/server/jwt';

export const POST: RequestHandler = async (req) => {
	const body = await req.request.json();

	const state_info = req.cookies.get(COOKIES.OAuthState);
	if (!state_info) return failure(err_no_cookie(), 1);

	const provider_name = req.params.provider;
	const provider = await getOAuthProvider(provider_name);
	if (!provider) return failure(err_not_found({ name: provider_name }), 1);

	const [req_state, redirect_uri] = state_info.split('|', 2);

	const type = OAuthProviderTypes.find((t) => t.name === provider.type);
	if (!type) return failure(err_invalid_provider({ type: provider.type }), 2);

	const { code, state } = await parseResp(type.authorize, body);

	if (state !== req_state) return failure(err_bad_state(), 1);

	const { access_token, token_type, scope } = await execute(type.access_token, {
		client_id: provider.clientId,
		client_secret: provider.clientSecret,
		code,
		redirect_uri,
		state,
	});

	const { id, name, info } = await execute(type.get_user, {
		client_id: provider.clientId,
		client_secret: provider.clientSecret,
		code,
		redirect_uri,
		state,
		access_token,
		token_type,
		scope,
	});

	const user_info = await getUserInfoByOAuth(provider_name, id);
	if (user_info) {
		// 已有用户, 登录
		await userJwt.createJwtCookie(req, user_info);
		return success(true);
	}
	// 新用户, 注册
	await createOAuthUser(id, provider_name, info);
	const jwt = await oauthRegisterJwt.createJwt({
		id,
		p: provider_name,
	});
	return success({ jwt, name });
};
