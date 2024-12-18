import { z } from 'zod';

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

export function isBoolLkie(v: string): v is Extract<BoolLike, string>;
export function isBoolLkie(v: boolean): true;
export function isBoolLkie(v: number): v is Extract<BoolLike, number>;
export function isBoolLkie(v: unknown): v is BoolLike;
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
		return false;
	}
	if (typeof v === 'number') {
		if (v === 1 || v === 0) return true;
		if (v === 1.0 || v === 0.0) return true;
		return false;
	}
	return false;
}

export function isMaybeBoolLkie(v: string): v is Extract<MaybeBoolLike, string>;
export function isMaybeBoolLkie(v: undefined | null): true;
export function isMaybeBoolLkie(v: boolean): true;
export function isMaybeBoolLkie(v: number): v is Extract<MaybeBoolLike, number>;
export function isMaybeBoolLkie(v: unknown): v is MaybeBoolLike;
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
	if (typeof v === 'number') {
		if (v === 1 || v === 0) return true;
		if (v === 1.0 || v === 0.0) return true;
		return false;
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
	if (typeof v === 'string') {
		v = v.toLowerCase() as BoolLike;
		if (v === 'true' || v === '1' || v === 't') return true;
		if (v === 'false' || v === '0' || v === 'f') return false;
	}
	if (typeof v === 'number') return v !== 0;
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
	if (typeof v === 'string') {
		v = v.toLowerCase() as BoolLike;
		if (v === 'true' || v === '1' || v === 't') return true;
		if (v === 'false' || v === '0' || v === 'f') return false;
	}
	if (typeof v === 'number') return v !== 0;
	throw new Error(`Invalid boolean-like value: ${v}`);
}
export const parseMaybeBoolLikeTrue = (v: MaybeBoolLike): boolean => parseMaybeBoolLike(v, true);

export const BoolLike = z.union([
	z.boolean(),
	z.string().refine<Extract<BoolLike, string>>(isBoolLkie).transform(parseBoolLike),
	z.number().refine<Extract<BoolLike, number>>(isBoolLkie).transform(parseBoolLike),
]);
export const MaybeBoolLike = z.union([
	z.undefined().transform(() => false),
	z.null().transform(() => false),
	z.boolean(),
	z
		.string()
		.refine<Extract<MaybeBoolLike, string>>(isMaybeBoolLkie)
		.transform((v) => parseMaybeBoolLike(v, false)),
	z
		.number()
		.refine<Extract<MaybeBoolLike, number>>(isMaybeBoolLkie)
		.transform((v) => parseMaybeBoolLike(v, false)),
]);

export const MaybeBoolLikeTrue = z.union([
	z.undefined().transform(() => true),
	z.null().transform(() => true),
	z.boolean(),
	z
		.string()
		.refine<Extract<MaybeBoolLike, string>>(isMaybeBoolLkie)
		.transform((v) => parseMaybeBoolLike(v, true)),
	z
		.number()
		.refine<Extract<MaybeBoolLike, number>>(isMaybeBoolLkie)
		.transform((v) => parseMaybeBoolLike(v, true)),
]);

// z.boolean().or(z.string().refine<BoolLike>(isBoolLkie).transform(parseBoolLike));
