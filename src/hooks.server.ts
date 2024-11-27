import { sequence } from '@sveltejs/kit/hooks';
import { i18n } from '$lib/i18n';
import type { Handle } from '@sveltejs/kit';
import { COOKIES } from '$lib/common/cookies';
import { decodeJwt } from 'jose/jwt/decode';
import { deleteSessionTokenCookie } from '$lib/server/auth';
import type { UserSession } from '$lib/common/user';

const handleAuth: Handle = async ({ event, resolve }) => {
	const jwt = event.cookies.get(COOKIES.Session);
	try {
		event.locals.user = jwt ? decodeJwt<UserSession>(jwt) : null;
	} catch (_) {
		deleteSessionTokenCookie(event);
	}
	return resolve(event);
};

const handleParaglide: Handle = i18n.handle();
export const handle: Handle = sequence(handleAuth, handleParaglide);
