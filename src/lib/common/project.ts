export const projectNameReservedWords = ['create'] as const;

const _pnrw = new Set<string>(projectNameReservedWords);

const projectNameRegex = /^[A-Za-z][A-Za-z0-9_.-]{0,19}$/;
/**
 * 项目名称合法性检查
 *
 * `^[A-Za-z][A-Za-z0-9_.-]{0,19}$`
 * @param name 项目名称
 * @returns 是否合法
 */
export function validateProjectName(name: unknown): name is string {
	if (typeof name !== 'string') return false;
	if (_pnrw.has(name)) return false;
	return projectNameRegex.test(name);
}
