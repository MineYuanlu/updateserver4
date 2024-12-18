import type { i18nMsgFunc } from '$lib/i18n';
import { z } from 'zod';

type EnumRaw = {
	[key: string]: [number, i18nMsgFunc];
} & Record<number, never>;

type EnumItems<Map extends EnumRaw> = {
	[K in keyof Map]: {
		name: K;
		val: Map[K][0];
		desc: Map[K][1];
	};
};
type EnumFuncs<Map extends EnumRaw> = {
	/**
	 * 获取枚举值对应的键
	 * @param value 枚举值
	 * @returns 键 / undefined
	 */
	_toKey(value: keyof Map | Map[keyof Map][0]): Extract<keyof Map, string>;
	/**
	 * 获取枚举值对应的键
	 * @param value 枚举值
	 * @returns 键 / undefined
	 */
	_toKey(value: unknown): Extract<keyof Map, string> | undefined;
	/**
	 * 获取枚举键对应的值
	 * @param key 枚举键
	 * @returns 值 / undefined
	 */
	_toValue(key: keyof Map | Map[keyof Map][0]): Map[keyof Map][0];
	/**
	 * 获取枚举键对应的值
	 * @param key 枚举键
	 * @returns 值 / undefined
	 */
	_toValue(key: unknown): Map[keyof Map][0] | undefined;
	/**
	 * 获取枚举键对应的值
	 * @param key 枚举键
	 * @returns 值 / undefined
	 */
	_toDesc(key: unknown): string | undefined;
	/**
	 * 转为选项数组, [键, 描述][]
	 */
	_toOptions(): [keyof Map, string][];

	/**
	 * 验证键是否有效的枚举键
	 * @param key 枚举键
	 * @returns 是否有效
	 */
	_validateKey(key: unknown): key is Extract<keyof Map, string>;

	/**
	 * 验证值是否有效的枚举值
	 * @param value 枚举值
	 * @returns 是否有效
	 */
	_validateValue(value: unknown): value is Map[keyof Map][0];

	/**
	 * 验证键或值是否有效的枚举键或值
	 * @param key 枚举键或值
	 * @returns 是否有效
	 */
	_validateKeyOrVal(key: string): key is Extract<keyof Map, string> | `${Map[keyof Map][0]}`;

	/**
	 * 验证键或值是否有效的枚举键或值
	 * @param key 枚举键或值
	 * @returns 是否有效
	 */
	_validateKeyOrVal(key: number): key is Map[keyof Map][0];

	/**
	 * 验证键或值是否有效的枚举键或值
	 * @param key 枚举键或值
	 * @returns 是否有效
	 */
	_validateKeyOrVal(
		key: unknown,
	): key is Extract<keyof Map, string> | Map[keyof Map][0] | `${Map[keyof Map][0]}`;

	/** 枚举的所有键 */
	_keys: readonly (keyof Map)[];
	/** 枚举的所有值 */
	_values: readonly Map[keyof Map][0][];
};
type EnumZods<Map extends EnumRaw> = {
	/** 键约束, (`string`)`key`的枚举 */
	_z_key: z.ZodEffects<z.ZodString, Extract<keyof Map | `${Map[keyof Map][0]}`, string>, string>;
	/** 值约束, (`number`)`value`的枚举 */
	_z_value: z.ZodEffects<z.ZodNumber, Map[keyof Map][0], number>;
	/** 键值约束, (`string`)`key`或(`number`)`value`的枚举 */
	_z_kv: z.ZodUnion<
		[
			z.ZodEffects<z.ZodString, Extract<keyof Map | `${Map[keyof Map][0]}`, string>, string>,
			z.ZodEffects<z.ZodNumber, Map[keyof Map][0], number>,
		]
	>;
	/** 转换为`key`的键值约束, 输入(`string`)`key`或(`number`)`value`, 输出(`string`)`key` */
	_z_toKey: z.ZodEffects<
		z.ZodUnion<
			[
				z.ZodEffects<z.ZodString, Extract<keyof Map | `${Map[keyof Map][0]}`, string>, string>,
				z.ZodEffects<z.ZodNumber, Map[keyof Map][0], number>,
			]
		>,
		Extract<keyof Map, string>,
		string | number
	>;
	/** 转换为`value`的键值约束, 输入(`string`)`key`或(`number`)`value`, 输出(`number`)`value` */
	_z_toValue: z.ZodEffects<
		z.ZodUnion<
			[
				z.ZodEffects<z.ZodString, Extract<keyof Map | `${Map[keyof Map][0]}`, string>, string>,
				z.ZodEffects<z.ZodNumber, Map[keyof Map][0], number>,
			]
		>,
		Map[keyof Map][0],
		string | number
	>;

	/** zod枚举 */
	_z_enum: z.ZodNativeEnum<{ [K in keyof Map]: Map[K][0] } & Record<number, never>>;
};

/**
 * 创建约束枚举
 *
 * `键: [值, i18nMsg]`
 *
 * 示例:
 * ```typescript
 * export const Visibility = makeEnum({
 * 	private: [0, enum_project__visibility_public],
 * 	public: [1, enum_project__visibility_private],
 * } as const);
 * ```
 * @param map 枚举值-键映射
 * @returns 约束枚举
 */
export function makeEnum<Map extends EnumRaw>(
	map: Map,
): EnumItems<Map> & EnumFuncs<Map> & EnumZods<Map> {
	// 检查值没有重复
	const values = Object.values(map);
	if (!values.every(([value]) => typeof value === 'number')) {
		throw new Error('Enum values must be numbers');
	}
	if (new Set(values).size !== values.length) {
		throw new Error('Enum values must be unique');
	}
	const keys_ = Object.keys(map) as (keyof Map)[];
	const values_ = Object.values(map).map((value) => value[0]) as Map[keyof Map][0][];
	const valueToKey: Record<Map[keyof Map][0], keyof Map> = {} as any;
	for (let i = 0; i < keys_.length; i++) {
		valueToKey[values_[i]] = keys_[i];
	}
	const ret: EnumItems<Map> = {} as any;
	for (const key in map) {
		ret[key] = {
			name: key,
			val: map[key as keyof Map][0],
			desc: map[key as keyof Map][1],
		};
	}
	type Key = keyof Map;
	type Val = Map[Key][0];
	type Desc = Map[Key][1];

	const funcs: EnumFuncs<Map> = {
		...ret,
		_toKey(value) {
			if (typeof value === 'string') {
				if (value in map) return value as Key;
				value = parseInt(value, 10);
				if (isNaN(value as number)) return undefined as any;
			}
			if (typeof value === 'number') return valueToKey[value as Val];
			return undefined as any;
		},
		_toValue(key) {
			if (typeof key === 'string') {
				if (key in map) return map[key as Key][0];
				key = parseInt(key, 10);
				if (isNaN(key as number)) return undefined as any;
			}
			if (typeof key === 'number' && key in valueToKey) return key as Val;
			return undefined as any;
		},
		_toDesc(key) {
			if (typeof key === 'string') {
				if (key in map) return map[key as Key][1]({ key });
				key = parseInt(key, 10);
				if (isNaN(key as number)) return undefined as any;
			}
			if (typeof key === 'number' && key in valueToKey)
				return map[valueToKey[key as Val]][1]({ key });
			return undefined as any;
		},
		_toOptions() {
			return Object.entries(map).map(([key, [_, desc]]) => [key, desc({ key })]);
		},
		_validateKey(key): key is never {
			return typeof key === 'string' && key in map;
		},
		_validateValue(value): value is never {
			if (typeof value === 'string') {
				value = parseInt(value, 10);
				if (isNaN(value as number)) return false;
			}
			if (typeof value === 'number' && value in valueToKey) return true;
			return false;
		},
		_validateKeyOrVal(key): key is never {
			if (typeof key === 'string') {
				if (key in map) return true;
				key = parseInt(key, 10);
				if (isNaN(key as number)) return false;
			}
			if (typeof key === 'number' && key in valueToKey) return true;
			return false;
		},
		_keys: keys_,
		_values: values_,
	};
	const z_key = z
		.string()
		.refine<Extract<keyof Map, string> | `${Map[keyof Map][0]}`>(funcs._validateKeyOrVal, {
			message: `Invalid enum key, must be one of: ${keys_} / ${values_}`,
		});
	const z_value = z.number().refine<Map[keyof Map][0]>(funcs._validateValue, {
		message: `Invalid enum value, must be one of: ${values_}`,
	});
	const z_kv = z.union([z_key, z_value]);
	const z_toKey = z_kv.transform<Extract<keyof Map, string>>(funcs._toKey);
	const z_toValue = z_kv.transform<Map[keyof Map][0]>(funcs._toValue);
	const z_enum = z.nativeEnum<
		{
			[K in keyof Map]: Map[K][0];
		} & Record<number, never>
	>(Object.fromEntries(Object.entries(map).map(([k, [v]]) => [k, v])) as any);

	const zod: EnumZods<Map> = {
		_z_key: z_key,
		_z_value: z_value,
		_z_kv: z_kv,
		_z_toKey: z_toKey,
		_z_toValue: z_toValue,
		_z_enum: z_enum,
	};
	return {
		...ret,
		...funcs,
		...zod,
	};
}

export type EnumItem<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends { name: infer N; val: infer V; desc: infer D }
		? { name: N; val: V; desc: D }
		: never;
}[keyof T];
export type EnumKey<T extends { _keys: readonly string[] }> = T['_keys'][number];
export type EnumVal<T extends { _values: readonly unknown[] }> = T['_values'][number];
