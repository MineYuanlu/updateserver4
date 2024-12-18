import { _POST as project_create_POST } from '$lib/../routes/api/project/create/+server';
import { _GET as project_info_GET } from '$lib/../routes/api/project/info/+server';
import { _GET as project_list_GET } from '$lib/../routes/api/project/list/+server';
import type { OpenAPIV3 } from 'openapi-types';

export const OpenAPI: OpenAPIV3.PathsObject = {};
function addOpenAPI(api: OpenAPIV3.OperationObject, path: string, method: string) {
    api.operationId = `${path.replace('/', '_')}_${method}`;
	(OpenAPI[`/api/${path}`] || (OpenAPI[`/api/${path}`] = {}))[method.toLowerCase() as 'get'] = api;
}

addOpenAPI(project_create_POST.openAPI(), "project/create", "POST")
addOpenAPI(project_info_GET.openAPI(), "project/info", "GET")
addOpenAPI(project_list_GET.openAPI(), "project/list", "GET")