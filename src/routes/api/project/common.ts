import type { EnumVal } from '$lib/common/enum';
import { isUS4ID } from '$lib/common/id';
import { UserRole, type ProjId } from '$lib/common/project';
import type { UserId } from '$lib/common/user';
import { api_project__err_bad_id, api_project__not_found } from '$lib/paraglide/messages';
import { checkPermByProjId } from '$lib/server/db/funcs';
import { checkRequestField, failure } from '../common.server';

/**
 * 从请求参数中获取项目id
 * @param data 请求参数, GET为URLSearchParams, POST为Record<any, unknown>, 固定获取`pid`字段
 * @returns 项目id
 * @throws 无法正确解析pid或pid不存在
 */
export const getProjId = (data: Record<any, unknown> | URLSearchParams): ProjId => {
	const { pid } = checkRequestField(data, {
		pid: [(v) => isUS4ID('p', v), 0, () => failure(api_project__err_bad_id())],
	});
	return pid;
};

/**
 * 检查用户是否有权限访问该项目
 * @param pid 项目id
 * @param uid 用户id
 * @param minRole 需要的最小权限等级, 默认为guest
 * @throws 用户无权限访问该项目: 即项目非公开且用户权限小于minRole
 */
export const checkProjPerm = async (
	pid: ProjId,
	uid: UserId | undefined,
	minRole: EnumVal<typeof UserRole> = UserRole.guest.val,
) => {
	if (!(await checkPermByProjId(pid, uid, minRole))) failure(api_project__not_found());
};
