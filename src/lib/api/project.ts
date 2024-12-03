import type { ProjId, Visibility } from '$lib/common/project';
import type { ListResp } from '../../routes/api/project/list/+server';
import { apiReq2 } from './common';

/** 创建项目 */
export const createProject = async (
	name: string,
	desc: string,
	visibility: (typeof Visibility._keys)[number],
) =>
	apiReq2<ProjId | null>('/api/project/create', null, {
		method: 'POST',
		data: { name, desc, visibility },
	});

/** 列出所有项目 */
export const listProjects = async (offset: number, limit: number) =>
	apiReq2<ListResp>('/api/project/list', [], { data: { offset, limit } });
