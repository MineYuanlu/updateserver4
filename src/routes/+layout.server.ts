import type { UserSession } from '$lib/common/user';
import { COOKIES } from '../lib/common/cookies';
import type { LayoutServerLoad } from './$types';
import { decodeJwt } from 'jose';

export const load: LayoutServerLoad = async (event) => {
	const jwt = event.cookies.get(COOKIES.Session);
	const user = jwt ? decodeJwt<UserSession>(jwt) : null;
	const theme = event.cookies.get(COOKIES.Theme);
	return { user, theme };
};
