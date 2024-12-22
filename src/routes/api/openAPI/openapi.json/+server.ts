import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { openAPI } from '../data.server';
import { cache } from '../../common.server';
import { dev } from '$app/environment';

export const GET: RequestHandler = async () => {
	if (dev) return json(openAPI);
	return cache(json(openAPI));
};
