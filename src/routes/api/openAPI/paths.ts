// @prettier-ignore
// @ts-nocheck
/* prettier-ignore-start */
/* eslint-disable */

import { _POST as project_create_POST } from '$lib/../routes/api/project/create/+server';
import { _POST as project_edit_basic_POST } from '$lib/../routes/api/project/edit/basic/+server';
import { _GET as project_info_GET } from '$lib/../routes/api/project/info/+server';
import { _GET as project_info_members_GET } from '$lib/../routes/api/project/info/members/+server';
import { _GET as project_info_role_GET } from '$lib/../routes/api/project/info/role/+server';
import { _GET as project_list_GET } from '$lib/../routes/api/project/list/+server';
import { _GET as tag_info_GET } from '$lib/../routes/api/tag/info/+server';
import { _GET as tag_list_GET } from '$lib/../routes/api/tag/list/+server';
import { _POST as user_login_POST } from '$lib/../routes/api/user/login/+server';
import type { PathsObject, OperationObject } from 'openapi3-ts/oas30';

export const paths: PathsObject = {};
function addOpenAPI(api: OperationObject, path: string, method: string) {
    api.operationId = `${path.replaceAll('/', '_')}_${method}`;
	(paths[`/api/${path}`] || (paths[`/api/${path}`] = {}))[method.toLowerCase() as 'get'] = api;
}

addOpenAPI(project_create_POST.openAPI(), "project/create", "POST")
addOpenAPI(project_edit_basic_POST.openAPI(), "project/edit/basic", "POST")
addOpenAPI(project_info_GET.openAPI(), "project/info", "GET")
addOpenAPI(project_info_members_GET.openAPI(), "project/info/members", "GET")
addOpenAPI(project_info_role_GET.openAPI(), "project/info/role", "GET")
addOpenAPI(project_list_GET.openAPI(), "project/list", "GET")
addOpenAPI(tag_info_GET.openAPI(), "tag/info", "GET")
addOpenAPI(tag_list_GET.openAPI(), "tag/list", "GET")
addOpenAPI(user_login_POST.openAPI(), "user/login", "POST")

/* prettier-ignore-end */
/* eslint-enable */
