import { dev } from '$app/environment';
import type { UserSession } from '$lib/common/user';
import type { i18nMsgFunc } from '$lib/i18n';
import * as m from '$lib/paraglide/messages.js';

export type Menu = {
	name: i18nMsgFunc;
	path: string;
	match?: string | RegExp;
	check?: (data: { user: UserSession | undefined | null }) => boolean;
};

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
		check: ({ user }) => user?.id !== undefined,
	},
	{
		name: m.menu_tag,
		path: '/tag',
		match: '/tag',
	},
	{
		name: m.menu_api,
		path: '/openAPI',
		match: '/openAPI',
	},
	{
		name: m.menu_dev,
		path: '/demo/components',
		match: '/demo/components',
		check: () => dev,
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
