import type { ProjId, Visibility } from '$lib/common/project';
import type { Project } from '$lib/server/db/schema';
import type { ListResp } from '../../routes/api/project/list/+server';
import type { EditData } from '../../routes/api/project/edit/basic/+server';
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

/**
 * 更新项目信息
 * @return true: 更新成功, false: 没有变动, null: 项目不存在/权限不足
 */
export const updateProject = async (id: ProjId, data: EditData) =>
	apiReq2<boolean | null>('/api/project/edit/basic', null, {
		method: 'POST',
		data: { id, ...data },
	});
