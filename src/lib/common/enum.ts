import type { i18nMsgFunc } from '$lib/i18n';

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
export function makeEnum<Map extends Record<string, [number, i18nMsgFunc]>>(
	map: Map,
): {
	[K in keyof Map]: {
		name: K;
		val: Map[K][0];
		desc: Map[K][1];
	};
} & {
	/**
	 * 获取枚举值对应的键
	 * @param value 枚举值
	 * @returns 键 / undefined
	 */
	_toKey(value: unknown): keyof Map | undefined;
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
	_validateKey(key: unknown): key is keyof Map;

	/** 枚举的所有键 */
	_keys: readonly (keyof Map)[];
	/** 枚举的所有值 */
	_values: readonly Map[keyof Map][0][];
} {
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
	const ret: {
		[K in keyof Map]: {
			name: K;
			val: Map[K][0];
			desc: Map[K][1];
		};
	} = {} as any;
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
	return {
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
		_validateKey(key): key is keyof Map {
			return typeof key === 'string' && key in map;
		},
		_keys: keys_,
		_values: values_,
	};
}

export type EnumItem<T extends Record<string, any>> = {
	[K in keyof T]: T[K] extends { name: infer N; val: infer V; desc: infer D }
		? { name: N; val: V; desc: D }
		: never;
}[keyof T];
export type EnumKey<T extends { _keys: readonly string[] }> = T['_keys'][number];
export type EnumVal<T extends { _values: readonly unknown[] }> = T['_values'][number];
