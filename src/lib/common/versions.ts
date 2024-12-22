import {
	enum_version_cmp__equal,
	enum_version_cmp__newer,
	enum_version_cmp__older,
	enum_version_cmp__newer_other_unparsable,
	enum_version_cmp__older_unparsable,
	enum_version_cmp__newer_unparsable,
	enum_version_cmp__older_other_unparsable,
	enum_version_cmp__big_both_unparsable,
	enum_version_cmp__small_both_unparsable,
	check_version_cmp_args__bad_type,
	check_version_cmp_args__d_bad_type,
	check_version_cmp_args__d_too_long,
	check_version_cmp_args__d_repeated,
	check_version_cmp_args__s_bad_type,
	check_version_cmp_args__s_too_long,
	check_version_cmp_args__s_key_bad_type,
	check_version_cmp_args__s_key_too_long,
	check_version_cmp_args__s_value_bad_type,
	check_version_cmp_args__s_value_out_of_range,
} from '$lib/paraglide/messages';
import { isEqualSet } from '$lib/utils/equal';
import { z } from 'zod';
import { makeEnum, type EnumItem, type EnumVal } from './enum';

export const maxVersionLength = 32;
export const defaultDelimiters = '-./_~|+';

/**
 * 版本号比较结果
 *
 * 正负含义:
 * - 0 为相等,
 * - 正数为较新,
 * - 负数为较旧,
 * 值含义:
 * - ±1: 在出现版本不相等及之前, 均可解析
 * - ±2: 较新的可以解析, 较老的不可解析
 * - ±3: 较短的版本较老, 但较长的有不可解析部分
 * - ±4: 两个版本均不可解析, 返回字符比较结果
 */
export const VersionCmpResult = makeEnum({
	Equal: [0, enum_version_cmp__equal],
	Newer: [1, enum_version_cmp__newer],
	Older: [-1, enum_version_cmp__older],
	Newer_Other_Unparsable: [2, enum_version_cmp__newer_other_unparsable],
	Older_Unparsable: [-2, enum_version_cmp__older_unparsable],
	Newer_Unparsable: [3, enum_version_cmp__newer_unparsable],
	Older_Other_Unparsable: [-3, enum_version_cmp__older_other_unparsable],
	Big_Both_Unparsable: [4, enum_version_cmp__big_both_unparsable],
	Small_Both_Unparsable: [-4, enum_version_cmp__small_both_unparsable],
} as const);
export type VersionCmpResultItem = EnumItem<typeof VersionCmpResult>;
export type VersionCmpResultVal = EnumVal<typeof VersionCmpResult>;

/**
 * 版本号比较参数
 *
 * - delimiters: 版本号分隔符集, 默认为 '-./_~|+'.
 * - specials: 特殊版本号映射, 用于将特定版本号映射到数字, 用于比较.
 *
 * 对于参数:
 * - `null`=`undefined`=`{}`=`{d:undefined,s:undefined}`=`{d:defaultDelimiters,s:{}}`
 * - `string`=`{d:string}`
 */
export type VersionCmpArgs = {
	d?: string;
	s?: Record<string, number>;
};

export const maxDelimitersLength = 16;
export const maxSpecialsNumber = 128;

/**
 * 版本号比较参数分隔符合法性检查
 * @param d 分割符集
 * @returns 是否合法
 */
export function validateVersionCmpArgsDelimiters(d: unknown): d is string {
	if (d === undefined || d === null) return true;
	if (typeof d === 'string') {
		if (d.length > maxDelimitersLength) return false;
		if (new Set(d).size !== d.length) return false;
		return true;
	}
	return false;
}

/**
 * 版本号比较参数特殊版本号映射检查
 * @param s 特殊版本号映射
 * @returns 是否合法
 */
export function validateVersionCmpArgsSpecials(s: unknown): s is Record<string, number> {
	if (s === undefined || s === null) return true;
	if (typeof s === 'object' && s !== null && !Array.isArray(s)) {
		let cnt = 0;
		for (const k in s) {
			if (typeof k !== 'string') return false;
			if (k.length > maxVersionLength) return false;
			if (typeof (s as any)[k] !== 'number') return false;
			if (
				isNaN((s as any)[k]) ||
				Number.MAX_SAFE_INTEGER < (s as any)[k] ||
				(s as any)[k] < Number.MIN_SAFE_INTEGER
			)
				return false;
			if (++cnt > maxSpecialsNumber) return false;
		}
		return true;
	}
	return false;
}
/**
 * 版本号比较参数合法性检查
 * @param args 版本号比较参数
 * @returns 是否合法
 */
export function validateVersionCmpArgs(args: unknown): args is string | object {
	if (args === undefined || args === null) return true;
	if (typeof args === 'string') return validateVersionCmpArgsDelimiters(args);

	if (typeof args === 'object' && args !== null && !Array.isArray(args)) {
		if (!validateVersionCmpArgsDelimiters((args as any)['d'])) return false;
		if (!validateVersionCmpArgsSpecials((args as any)['s'])) return false;
		return true;
	}
	return false;
}

/**
 * 版本号比较参数分隔符合法性检查失败原因
 * @param d 分割符集
 * @returns 版本号比较结果解释
 */
export function whyInvalidVersionCmpArgsDelimiters(d: unknown): string | undefined {
	if (d === undefined || d === null) return undefined;
	if (typeof d === 'string') {
		if (d.length > maxDelimitersLength)
			return check_version_cmp_args__d_too_long({ max: maxDelimitersLength });
		if (new Set(d).size !== d.length) return check_version_cmp_args__d_repeated();
		return undefined;
	}
	return check_version_cmp_args__d_bad_type();
}

/**
 * 版本号比较参数特殊版本号映射检查失败原因
 * @param s 特殊版本号映射
 * @returns 版本号比较结果解释
 */
export function whyInvalidVersionCmpArgsSpecials(s: unknown): string | undefined {
	if (s === undefined || s === null) return undefined;
	if (typeof s === 'object' && s !== null && !Array.isArray(s)) {
		let cnt = 0;
		for (const k in s) {
			if (typeof k !== 'string') return check_version_cmp_args__s_key_bad_type();
			if (k.length > maxVersionLength)
				return check_version_cmp_args__s_key_too_long({ max: maxVersionLength });
			if (typeof (s as any)[k] !== 'number') return check_version_cmp_args__s_value_bad_type();
			if (
				isNaN((s as any)[k]) ||
				Number.MAX_SAFE_INTEGER < (s as any)[k] ||
				(s as any)[k] < Number.MIN_SAFE_INTEGER
			)
				return check_version_cmp_args__s_value_out_of_range();
			if (++cnt > maxSpecialsNumber)
				return check_version_cmp_args__s_too_long({ max: maxSpecialsNumber });
		}
		return undefined;
	}
	return check_version_cmp_args__s_bad_type();
}

/**
 * 版本号比较参数合法性检查失败原因
 * @param args 版本号比较参数
 * @returns 失败原因
 */
export function whyInvalidVersionCmpArgs(args: unknown): string | undefined {
	if (args === undefined || args === null) return undefined;
	if (typeof args === 'string') return whyInvalidVersionCmpArgsDelimiters(args);
	if (typeof args === 'object' && args !== null && !Array.isArray(args)) {
		const whyD = whyInvalidVersionCmpArgsDelimiters((args as any)['d']);
		if (whyD !== undefined) return whyD;
		const whyS = whyInvalidVersionCmpArgsSpecials((args as any)['s']);
		if (whyS !== undefined) return whyS;
		return undefined;
	}
	return check_version_cmp_args__bad_type();
}

/**
 * 转换版本号比较参数
 *
 * @param args 版本号比较参数
 * @returns 转换后的版本号比较参数
 */
export function transformVersionCmpArgs(args: unknown): VersionCmpArgs {
	if (args === undefined || args === null) return {};
	if (typeof args === 'string') return { d: args };

	if (typeof args === 'object' && args !== null && !Array.isArray(args)) {
		const ret: VersionCmpArgs = {};
		const d = (args as any)['d'];
		if (typeof d === 'string') ret.d = d;

		const s = (args as any)['s'];
		if (typeof s === 'object') ret.s = s as any;
		return ret;
	}
	return {};
}

export const zVersionCmpArgsDelimiter = z.custom<string>(validateVersionCmpArgsDelimiters, (t) => ({
	message: whyInvalidVersionCmpArgsDelimiters(t),
}));
export const zVersionCmpArgsSpecials = z.custom<Record<string, number>>(
	validateVersionCmpArgsSpecials,
	(t) => ({
		message: whyInvalidVersionCmpArgsSpecials(t),
	}),
);
export const zVersionCmpArgs = z
	.union([
		zVersionCmpArgsDelimiter,
		z.object({
			d: zVersionCmpArgsDelimiter.optional(),
			s: zVersionCmpArgsSpecials.optional(),
		}),
	])
	.refine(validateVersionCmpArgs, (t) => ({
		message: whyInvalidVersionCmpArgs(t),
	}))
	.transform(transformVersionCmpArgs);

/**
 * 规范化版本号比较参数
 * @param d 分割符集
 * @param s 特殊版本号映射
 * @returns 规范化后的版本号比较参数
 */
export function normVersionCmpArgs(
	d: string | undefined,
	s: Record<string, number> | [string, string][] | undefined,
) {
	const hasD = d !== undefined && !isEqualSet(d, defaultDelimiters);
	const hasS = s !== undefined && (Array.isArray(s) ? s.length > 0 : Object.keys(s).length > 0);
	if (!hasD && !hasS) return null;
	const args: VersionCmpArgs = {};
	if (hasD) args.d = d;
	if (hasS) args.s = Array.isArray(s) ? Object.fromEntries(s.map(([k, v]) => [k, Number(v)])) : s;
	return args;
}

export function argsToCmp(args: VersionCmpArgs | null | undefined): VersionCmp {
	return new VersionCmp((args ?? {}).d ?? defaultDelimiters, (args ?? {}).s ?? {});
}

/**
 * 版本号比较器
 */
export class VersionCmp {
	constructor(
		private delimiters: string = defaultDelimiters,
		public specials: Record<string, number>,
	) {
		this.delimiter = new Set(delimiters);
	}

	private delimiter: Set<string>;

	setDelimiters(delimiters: string) {
		this.delimiters = delimiters;
		this.delimiter = new Set(delimiters);
	}
	getDelimiters() {
		return this.delimiters;
	}

	/**
	 * 比较两个版本��字符串
	 *
	 * 1. 按照分隔符分割，默认为-./_~|，分割后逐一比较，数字越大的越新。
	 * 2. 分割后越靠前认为是越主要版本，靠前的不一致则忽略后续的比较。
	 * 3. 如果分割后长度不同，且前序版本比较一致，则较短的版本号空缺位置填入0参与比较。
	 * 4. 分割后的各部分如果不是数字，则尝试认作关键字，由映射表映射为数字后比较。
	 * 5. 如果分割后不是数字，且未出现在映射表中，则认为版本不可比较，是特殊版本。
	 *
	 * @param v1 第一个版本号字符串
	 * @param v2 第二个版本号字符串
	 * @return VersionCmpResult 返回值含义如下：
	 *   - VersionCmpResult::Equal：v1 和 v2 相同, (如果v1,v2出现对应位置的无法解析的部分, 但两部分字符相等, 则也返回0)
	 *   - VersionCmpResult::Newer：v1 比 v2 新
	 *   - VersionCmpResult::Older：v1 比 v2 旧
	 *   - VersionCmpResult::Newer_Other_Unparsable：v1 比 v2 新, 但另一个版本号不可解析
	 *   - VersionCmpResult::Older_Unparsable：v1 比 v2 旧, 但版本号不可解析
	 *   - VersionCmpResult::Newer_Unparsable：v1 比 v2 新, 但版本号不可解析
	 *   - VersionCmpResult::Older_Other_Unparsable：v1 比 v2 旧, 但另一个版本号不可解析
	 *   - VersionCmpResult::Big_Both_Unparsable：v1,v2 均不可解析, 但字符较大, 且不相等
	 *   - VersionCmpResult::Small_Both_Unparsable：v1,v2 均不可解析, 但字符较小, 且不相等
	 */
	compare(v1: string, v2: string): VersionCmpResultItem {
		const parts1 = this.parse(v1);
		const parts2 = this.parse(v2);
		const minLen = Math.min(parts1.length, parts2.length);
		for (let i = 0; i < minLen; i++) {
			const p1 = parts1[i];
			const p2 = parts2[i];
			const ok1 = typeof p1 === 'number';
			const ok2 = typeof p2 === 'number';
			if (ok1) {
				if (ok2) {
					if (p1 !== p2) return p1 > p2 ? VersionCmpResult.Newer : VersionCmpResult.Older;
				} else {
					return VersionCmpResult.Newer_Other_Unparsable;
				}
			} else {
				if (ok2) {
					return VersionCmpResult.Older_Unparsable;
				} else {
					if (p1 !== p2)
						return p1 > p2
							? VersionCmpResult.Big_Both_Unparsable
							: VersionCmpResult.Small_Both_Unparsable;
				}
			}
		}
		const maxLen = Math.max(parts1.length, parts2.length);
		for (let i = minLen; i < maxLen; i++) {
			const p1 = parts1[i];
			const p2 = parts2[i];
			if (p1 === undefined) {
				if (typeof p2 === 'number') return VersionCmpResult.Older;
				else return VersionCmpResult.Older_Other_Unparsable;
			} else if (typeof p1 === 'number') return VersionCmpResult.Newer;
			else return VersionCmpResult.Newer_Unparsable;
		}
		return VersionCmpResult.Equal;
	}

	/**
	 * 检测字符串能否被当前比较器识别
	 *
	 * @param v 版本号字符串
	 * @return true 能识别，false 不能识别
	 */
	check(v: string): boolean {
		return this.parse(v).every((x) => typeof x === 'number');
	}

	/**
	 * 将版本拆分为列表
	 *
	 * @param v 版本号字符串
	 * @return 版本号列表，如果无法解析，则对应位置为string，否则为int
	 */
	parse(v: string): (number | string)[] {
		const parts: (number | string)[] = [];
		let j = 0;
		for (let i = 0; i < v.length; i++) {
			if (this.delimiter.has(v[i])) {
				const str = v.substring(j, i);
				if (str in this.specials) parts.push(this.specials[str]);
				else {
					const num = Number(str);
					if (!isNaN(num)) parts.push(num);
					else parts.push(str);
				}
				j = i + 1;
			}
		}
		const str = v.substring(j);
		if (str in this.specials) parts.push(this.specials[str]);
		else {
			const num = Number(str);
			if (!isNaN(num)) parts.push(num);
			else parts.push(str);
		}
		return parts;
	}
}
