import { encodeBase32LowerCase } from '@oslojs/encoding';
import { getSettingValue } from './db/funcs';
import crypto from 'crypto';
import type { US4ID, US4IDType } from '$lib/common/id';

const settingsDefine: {
	JWT_EXPIRATION: Setting<number>;
	JWT_SECRET: Setting<Uint8Array>;
	JWT_ALGORITHM: Setting<string>;
} = {
	JWT_EXPIRATION: {
		key: 'JWT_EXPIRATION',
		transform: (value) => parseInt(value.toString()),
		default: () => `${60 * 60 * 24 * 7}` // 7 days
	},
	JWT_SECRET: {
		key: 'JWT_SECRET',
		transform: (value) => value,
		default: () => crypto.getRandomValues(Buffer.allocUnsafe(2048))
	},
	JWT_ALGORITHM: {
		key: 'JWT_ALGORITHM',
		transform: (value) => value.toString(),
		default: () => 'HS256'
	}
};
type Setting<T> = {
	key: string;
	transform: (value: Buffer) => T;
	default: string | Buffer | (() => string | Buffer);
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
