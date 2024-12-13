import { OAuthProviderTypeNames, type OAuthProviderTypeName } from '$lib/common/oauth';

export function validateName(name: unknown): name is string {
	if (typeof name !== 'string') return false;
	if (name.length < 1 || name.length > 50) return false;
	return true;
}
export function validateDesc(desc: unknown): desc is string {
	if (typeof desc !== 'string') return false;
	if (desc.length < 1 || desc.length > 200) return false;
	return true;
}
export function validateType(type: unknown): type is OAuthProviderTypeName {
	if (typeof type !== 'string') return false;
	if (!OAuthProviderTypeNames.includes(type as OAuthProviderTypeName)) return false;
	return true;
}
export function validateClientId(client_id: unknown): client_id is string {
	if (typeof client_id !== 'string') return false;
	if (client_id.length < 1 || client_id.length > 200) return false;
	return true;
}
export function validateClientSecret_Create(client_secret: unknown): client_secret is string {
	if (typeof client_secret !== 'string') return false;
	if (client_secret.length < 1 || client_secret.length > 200) return false;
	return true;
}
export function validateClientSecret_Edit(client_secret: unknown): client_secret is string {
	if (typeof client_secret !== 'string') return false;
	if (client_secret.length > 200) return false;
	return true;
}
export function validateRedirectUri(redirect_uri: unknown): redirect_uri is string {
	if (typeof redirect_uri !== 'string') return false;
	if (redirect_uri.length < 1 || redirect_uri.length > 200) return false;
	try {
		new URL(redirect_uri);
	} catch (_) {
		return false;
	}
	return true;
}
