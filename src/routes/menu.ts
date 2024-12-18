import type { i18nMsgFunc } from '$lib/i18n';
import * as m from '$lib/paraglide/messages.js';

export type Menu = { name: i18nMsgFunc; path: string; match?: string | RegExp };

export const menus: Menu[] = [
	{
		name: m.menu_project,
		path: '/project',
		match: '/project',
	},
	{
		name: m.menu_admin,
		path: '/admin',
		match: '/admin',
	},
	{
		name: m.menu_api,
		path: '/swagger',
		match: '/swagger',
	},
	{
		name: m.name,
		path: '/demo/components',
		match: '/demo/components',
	},
];

export function isNowMenu(menu: Menu, url: URL): boolean {
	const match = menu.match ?? menu.path;
	if (typeof match === 'string') {
		return url.pathname.startsWith(match);
	} else if (match instanceof RegExp) {
		return match.test(url.pathname);
	} else {
		return false;
	}
}
