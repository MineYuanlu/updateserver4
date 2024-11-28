export type UserInfo = {
	id: UserId;
	name: string;
	role: UserRole;
};
export type UserSession = {
	typ: 'USER';
} & UserInfo;

export const types = {
	U: 'User',
	R: 'Robot',
	OAUTH: 'OAuth'
};
export type Types = keyof typeof types;

export type TokenInfo<Data extends Record<string, unknown>, Type extends Types> = {
	typ: Type;
} & Data;
