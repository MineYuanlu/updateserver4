import type { PageServerLoad } from './$types';
// import { openAPI } from '../api/openAPI/data.server';
import type { OpenAPIObject } from 'openapi3-ts/oas30';
import data from './data.json';

export const load: PageServerLoad = async (req) => {
	// const res = await req.fetch('https://petstore3.swagger.io/api/v3/openapi.json');
	// const openAPI: OpenAPIObject = await res.json();
	const openAPI: OpenAPIObject = data as any;
	return {
		openAPI,
	};
};
