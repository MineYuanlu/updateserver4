import type { OpenAPIV3 } from 'openapi-types';
import { paths } from './paths';
export const openAPI = {
	openapi: '3.0.0',
	info: {
		title: 'Updateserver4 API',
		version: '1.0.1',
	},
	servers: [],
	paths,
} satisfies OpenAPIV3.Document;
