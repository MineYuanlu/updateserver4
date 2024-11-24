import { error } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createOAuthProvider } from '$lib/server/db/funcs';
import { OAuthProviderTypeNames } from '$lib/server/oauth';
import { success } from '../../../../common';

export const POST: RequestHandler = async ({ request, url }) => {
	const { name, desc, type, client_id, client_secret, redirect_uri } = await request.json();

	// TODO 鉴权

	if (!name) error(400, "'name' is required");
	if (!desc) error(400, "'desc' is required");
	if (!type) error(400, "'type' is required");
	if (!client_id) error(400, "'client_id' is required");
	if (!client_secret) error(400, "'client_secret' is required");
	if (!redirect_uri) error(400, "'redirect_uri' is required");

	if (!OAuthProviderTypeNames.includes(type))
		error(
			400,
			`Invalid 'type' value. Must be one of: ${OAuthProviderTypeNames.join(', ')}, but got ${type}`
		);

	await createOAuthProvider(name, desc, type, client_id, client_secret, redirect_uri);

	return success(name);
};
