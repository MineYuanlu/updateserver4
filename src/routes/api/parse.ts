/** 形如bool的类型 */
export type BoolLike =
	| boolean
	| 'true'
	| 'false'
	| '1'
	| '0'
	| 't'
	| 'f'
	| 1
	| 0
	| `${'t' | 'T'}${'r' | 'R'}${'u' | 'U'}${'e' | 'E'}`
	| `${'f' | 'F'}${'a' | 'A'}${'l' | 'L'}${'s' | 'S'}${'e' | 'E'}`
	| 'T'
	| 'F';

export type MaybeBoolLike = BoolLike | undefined | null | 'undefined' | 'null' | '';

/**
 * 判断是否是形如bool的类型
 * @param v 待判断的值
 * @returns 是否是形如bool的类型
 */
export function isBoolLkie(v: unknown): v is BoolLike {
	if (typeof v === 'boolean') return true;
	if (typeof v === 'string') {
		v = v.toLowerCase();
		if (v === 'true' || v === '1' || v === 't') return true;
		if (v === 'false' || v === '0' || v === 'f') return true;
	}
	return false;
}
/**
 * 判断是否是形如bool的类型
 * @param v 待判断的值
 * @returns 是否是形如bool的类型
 */
export function isMaybeBoolLkie(v: unknown): v is MaybeBoolLike {
	if (v === undefined || v === null || v === 'undefined' || v === 'null' || v === '') return true;
	if (typeof v === 'boolean') return true;
	if (typeof v === 'string') {
		v = v.toLowerCase();
		if (v === 'true' || v === '1' || v === 't') return true;
		if (v === 'false' || v === '0' || v === 'f') return true;
	}
	return false;
}

/**
 * 将形如bool的类型转换为boolean类型
 * @param v 待转换的值
 * @returns 转换后的boolean类型的值
 * @throws {Error} 如果v不是形如bool的类型，则会抛出错误
 */
export function parseBoolLike(v: BoolLike): boolean {
	if (typeof v === 'boolean') return v;
	if (typeof v === 'number') return v !== 0;
	if (typeof v === 'string') {
		v = v.toLowerCase() as BoolLike;
		if (v === 'true' || v === '1' || v === 't') return true;
		if (v === 'false' || v === '0' || v === 'f') return false;
	}
	throw new Error(`Invalid boolean-like value: ${v}`);
}

/**
 * 将形如bool的类型转换为boolean类型
 * @param v 待转换的值
 * @param defaultValue 默认值
 * @returns 转换后的boolean类型的值
 * @throws {Error} 如果v不是形如bool的类型，则会抛出错误
 */
export function parseMaybeBoolLike(v: MaybeBoolLike, defaultValue: boolean = false): boolean {
	if (v === undefined || v === null || v === 'undefined' || v === 'null' || v === '')
		return defaultValue;
	if (typeof v === 'boolean') return v;
	if (typeof v === 'number') return v !== 0;
	if (typeof v === 'string') {
		v = v.toLowerCase() as BoolLike;
		if (v === 'true' || v === '1' || v === 't') return true;
		if (v === 'false' || v === '0' || v === 'f') return false;
	}
	throw new Error(`Invalid boolean-like value: ${v}`);
}
export const parseMaybeBoolLikeTrue = (v: MaybeBoolLike): boolean => parseMaybeBoolLike(v, true);
