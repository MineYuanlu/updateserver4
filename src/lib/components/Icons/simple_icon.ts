import type { SimpleIcon as SI } from 'simple-icons';

export type SimpleIcon = SI;
export const isSimpleIcon = (icon: unknown): icon is SimpleIcon => {
	if (typeof icon !== 'object' || icon === null) return false;
	return (
		typeof (icon as SimpleIcon).title === 'string' &&
		typeof (icon as SimpleIcon).slug === 'string' &&
		typeof (icon as SimpleIcon).path === 'string'
	);
};
