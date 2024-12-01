import type { ProjId, Visibility } from '$lib/common/project';
import type { ListResp } from '../../routes/api/project/list/+server';
import { apiReq } from './common';

/** 创建项目 */
export const createProject = async (
	name: string,
	desc: string,
	visibility: (typeof Visibility._keys)[number],
) => apiReq<ProjId | null>('/api/project/create', 'POST', null, { name, desc, visibility });

/** 列出所有项目 */
export const listProjects = async (offset: number, limit: number) =>
	apiReq<ListResp>('/api/project/list', 'GET', [], { offset, limit });
