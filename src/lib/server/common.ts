import { encodeBase32LowerCase } from '@oslojs/encoding';
import { getSettingValue } from './db/funcs';

const settingsDefine: {
	JWT_EXPIRATION: Setting<number>;
	JWT_SECRET: Setting<Uint8Array>;
	JWT_ALGORITHM: Setting<string>;
} = {
	JWT_EXPIRATION: {
		key: 'JWT_EXPIRATION',
		transform: (value: string) => parseInt(value),
		default: () => `${60 * 60 * 24 * 7}` // 7 days
	},
	JWT_SECRET: {
		key: 'SECRET_KEY',
		transform: (value: string) => new TextEncoder().encode(value),
		default: () => 'secret'
	},
	JWT_ALGORITHM: {
		key: 'JWT_ALGORITHM',
		transform: (value: string) => value,
		default: () => 'HS256'
	}
};
type Setting<T> = {
	key: string;
	transform: (value: string) => T;
	default: string | (() => string);
};
export type Settings = keyof typeof settingsDefine;
export type SettingValue<Key extends keyof typeof settingsDefine> = ReturnType<
	(typeof settingsDefine)[Key]['transform']
>;
const settingCache: {
	[key in keyof typeof settingsDefine]?: {
		hasValue: boolean;
		value: SettingValue<key>;
	};
} = {};

/**
 * 获取指定设置的值
 * @param key 设置的键名
 * @returns 该设置的值
 */
export async function getSetting<Key extends keyof typeof settingsDefine>(
	key: Key
): Promise<SettingValue<Key>> {
	if (settingCache[key]?.hasValue) return settingCache[key].value;

	const value = settingsDefine[key].transform(
		await getSettingValue(key, settingsDefine[key].default)
	);
	settingCache[key] = { hasValue: true, value } as any;
	return value as SettingValue<Key>;
}

export const US4IdTypesDesc = {
	u: 'user',
	p: 'project',
	r: 'robot'
} as const;

(() => {
	//检查US4ID类型是否正确
	const types = Object.keys(US4IdTypesDesc);
	for (let i = 0; i < types.length; i++) {
		for (let j = i + 1; j < types.length; j++) {
			if (types[i].startsWith(types[j]))
				throw new Error(`Internal error: US4ID type ${types[i]} should not start with ${types[j]}`);
			if (types[j].startsWith(types[i]))
				throw new Error(`Internal error: US4ID type ${types[j]} should not start with ${types[i]}`);
		}
	}
})();

export type US4IDType = keyof typeof US4IdTypesDesc;
/** UpdateServer4 统一 ID 类型: 以 type 开头的字符串 */
export type US4ID<Type extends US4IDType> = `${Type}${string}`;
/**
 * 生成一个US4ID
 * @param type ID类型
 * @returns 一个US4ID
 */
export function generateId<T extends US4IDType>(type: T): US4ID<T> {
	// ID with 120 bits of entropy, or about the same as UUID v4.
	const bytes = crypto.getRandomValues(new Uint8Array(15));
	const id = encodeBase32LowerCase(bytes);
	return (type + id) as any;
}

export function isUS4ID<T extends US4IDType>(t: T, id: string): id is US4ID<T> {
	return typeof id === 'string' && id.length >= 2 && id.startsWith(t);
}
export function getUS4ID<T extends US4IDType>(t: T, us4id: string): string | undefined;
export function getUS4ID<T extends US4IDType>(t: T, us4id: US4ID<T>): string;
export function getUS4ID<T extends US4IDType>(t: T, us4id: string): string | undefined {
	if (!isUS4ID(t, us4id)) return undefined;
	return us4id.slice(t.length);
}
export function toUS4ID<T extends US4IDType>(t: T, id: string): US4ID<T> {
	return (t + id) as any;
}
