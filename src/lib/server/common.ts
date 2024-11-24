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
