import type { RequestHandler } from './$types';
import { success } from '../../../../common';
import { listOAuthProviders } from '$lib/server/db/funcs';
import { OAuthProviderTypes } from '$lib/server/oauth';

export type ListResp = {
	name: string;
	desc: string;
	type: string;
	logo?: string;
}[];

export const GET: RequestHandler = async () => {
	const providers = await listOAuthProviders();
	const data: ListResp = providers.map((p) => {
		const type = OAuthProviderTypes.find((t) => t.name === p.type);
		return {
			name: p.name,
			desc: p.desc,
			type: p.type,
			logo: type?.logo
		};
	});
	return success(data);
};
