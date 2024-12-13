/**
 * 判断作为set是否相等
 *
 * array和string会被转换为set进行比较, null和undefined会被视为等于空set
 */
export const isEqualSet = (
	setA: Set<any> | string | Array<any> | undefined | null,
	setB: Set<any> | string | Array<any> | undefined | null,
) => {
	if (!(setA instanceof Set)) setA = new Set(setA);
	if (!(setB instanceof Set)) setB = new Set(setB);
	if (setA.size !== setB.size) return false;
	for (const item of setA) if (!setB.has(item)) return false;
	return true;
};

/**
 * 判断作为record是否相等
 *
 * record的key的顺序不敏感, 但value必须完全相等, null和undefined会被视为等于空record
 */
export const isEqualRecord = (
	recordA: Record<string, any> | undefined | null,
	recordB: Record<string, any> | undefined | null,
) => {
	if (!recordA) recordA = {};
	if (!recordB) recordB = {};

	if (!isEqualSet(Object.keys(recordA), Object.keys(recordB))) return false;

	for (const key in recordA) {
		if (recordA[key] !== recordB[key]) return false;
	}
	return true;
};
