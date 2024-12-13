export const US4IdTypesDesc = {
	u: 'user',
	p: 'project',
	r: 'robot',
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

export function isUS4ID<T extends US4IDType>(t: T, id: unknown): id is US4ID<T> {
	return typeof id === 'string' && id.length >= 2 && id.startsWith(t);
}
export function rawUS4ID<T extends US4IDType>(t: T, us4id: string): string | undefined;
export function rawUS4ID<T extends US4IDType>(t: T, us4id: US4ID<T>): string;
export function rawUS4ID<T extends US4IDType>(t: T, us4id: string): string | undefined {
	if (!isUS4ID(t, us4id)) return undefined;
	return us4id.slice(t.length);
}
export function toUS4ID<T extends US4IDType>(t: T, id: string): US4ID<T> {
	return (t + id) as any;
}
