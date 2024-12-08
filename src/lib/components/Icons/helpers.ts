import type { SimpleIcon as SI } from 'simple-icons';
import type { HeroIcon as HI } from './.heroicons';

export type SimpleIcon = SI;
export const isSimpleIcon = (icon: unknown): icon is SimpleIcon => {
	if (typeof icon !== 'object' || icon === null) return false;
	return (
		typeof (icon as SimpleIcon).title === 'string' &&
		typeof (icon as SimpleIcon).slug === 'string' &&
		typeof (icon as SimpleIcon).path === 'string'
	);
};

export type HeroIcon = HI;
export const isHeroIcon = (icon: unknown): icon is HeroIcon => {
	if (typeof icon !== 'object' || icon === null) return false;
	const id = (icon as HeroIcon)?.id;
	return typeof id === 'string' && id.startsWith('hi');
};
