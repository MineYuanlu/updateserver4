import type { RequestHandler } from './$types';
import { createOAuthProvider } from '$lib/server/db/funcs';
import { OAuthProviderTypeNames } from '$lib/server/oauth';
import { checkRequestField, failure, success } from '../../../../common';
import { api__common_invalid_field as common_invalid_field } from '$lib/paraglide/messages';

export type ReqData = {
	name: string;
	desc: string;
	type: string;
	client_id: string;
	client_secret: string;
	redirect_uri: string;
};

export const POST: RequestHandler = async ({ request }) => {
	const { name, desc, type, client_id, client_secret, redirect_uri } = checkRequestField(
		await request.json(),
		{
			name: validateName,
			desc: validateDesc,
			type: validateType,
			client_id: validateClientId,
			client_secret: validateClientSecret,
			redirect_uri: validateRedirectUri,
		},
	);

	// TODO 鉴权

	await createOAuthProvider(name, desc, type, client_id, client_secret, redirect_uri);

	return success(true);
};

function validateName(name: unknown): name is string {
	if (typeof name !== 'string') return false;
	if (name.length < 1 || name.length > 50) return false;
	return true;
}
function validateDesc(desc: unknown): desc is string {
	if (typeof desc !== 'string') return false;
	if (desc.length < 1 || desc.length > 200) return false;
	return true;
}
function validateType(type: unknown): type is string {
	if (typeof type !== 'string') return false;
	if (!OAuthProviderTypeNames.includes(type)) return false;
	return true;
}
function validateClientId(client_id: unknown): client_id is string {
	if (typeof client_id !== 'string') return false;
	if (client_id.length < 1 || client_id.length > 200) return false;
	return true;
}
function validateClientSecret(client_secret: unknown): client_secret is string {
	if (typeof client_secret !== 'string') return false;
	if (client_secret.length < 1 || client_secret.length > 200) return false;
	return true;
}
function validateRedirectUri(redirect_uri: unknown): redirect_uri is string {
	if (typeof redirect_uri !== 'string') return false;
	if (redirect_uri.length < 1 || redirect_uri.length > 200) return false;
	try {
		new URL(redirect_uri);
	} catch (_) {
		return false;
	}
	return true;
}
