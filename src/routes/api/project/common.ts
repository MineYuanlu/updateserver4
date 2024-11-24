// export const Reserved Word
export const reservedWords = ['create'] as const;

const reservedWordsSet = new Set<string>(reservedWords);

const project_name_regex = /^[A-Za-z][A-Za-z0-9_.-]{0,19}$/;
/**
 * 项目名称合法性检查
 *
 * `^[A-Za-z][A-Za-z0-9_.-]{0,19}$`
 * @param name 项目名称
 * @returns 是否合法
 */
export function checkProjectName(name: string) {
	if (typeof name !== 'string') return false;
	if (reservedWordsSet.has(name)) return false;
	return project_name_regex.test(name);
}
