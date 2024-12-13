import { WebRole } from '$lib/common/user';
import { userJwt } from '$lib/server/user/jwt';
import { type RequestEvent } from '@sveltejs/kit';

/**
 * 检查请求用户是否有网站管理员权限
 * @param req 请求对象
 * @returns 是否有网站管理员权限
 */
export async function isWebAdmin(req: Parameters<typeof userJwt.getJwtCookie>[0]) {
	const info = await userJwt.getJwtCookie(req);
	return info?.role === WebRole.admin.val;
}
