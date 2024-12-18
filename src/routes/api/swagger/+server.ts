import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import type { OpenAPIV3 } from 'openapi-types';
import { OpenAPI } from './paths';

export const GET: RequestHandler = async () => {
	return json({
		openapi: '3.0.0',
		info: {
			title: 'Updateserver4 API',
			version: '1.0.1',
		},
		servers: [],
		paths: OpenAPI,
	} satisfies OpenAPIV3.Document);
};
