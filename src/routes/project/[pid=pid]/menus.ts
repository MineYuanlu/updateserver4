import { getClinkByProjectId, type ProjId, UserRole } from '$lib/common/project';
import {
	page_project_detail__navbar_back as mnv_back,
	page_project_detail__navbar_settings as mnv_settings,
	page_project_detail__navbar_members_manage as mnv_members_m,
	page_project_detail__navbar_members_list as mnv_members_l,
	page_project_detail__navbar_robots as mnv_robots,
	page_project_detail__navbar_cnts as mnv_cnts,
	page_project_detail__navbar_versions_manage as mnv_versions_m,
	page_project_detail__navbar_versions_list as mnv_versions_l,
} from '$lib/paraglide/messages';
import { type i18nMsgFunc } from '$lib/i18n';
import { type IconSource } from '@steeze-ui/svelte-icon';
import { Gear, Person, Reset, Rocket } from '@steeze-ui/radix-icons';
import { ChartPie, Lifebuoy } from '@steeze-ui/heroicons';
import type { EnumItem, EnumVal } from '$lib/common/enum';

export const menus = ['', '/settings', '/members', '/robots', '/analysis', '/versions'] as const;

type UserRole = EnumItem<typeof UserRole>;
/**
 * 基础菜单项
 * - 没有name + path: 作为分割线
 * - 没有path: 作为标题
 * - 有min/max: 权限控制
 */
export type MenuBasic =
	| {
			name: i18nMsgFunc;
			path: (typeof menus)[number];
			min?: EnumItem<typeof UserRole>;
			max?: EnumItem<typeof UserRole>;
			icon?: IconSource;
	  }
	| {
			name: i18nMsgFunc;
			path?: undefined;
			min?: EnumItem<typeof UserRole>;
			max?: EnumItem<typeof UserRole>;
			icon?: undefined;
	  }
	| {
			name?: undefined;
			path?: undefined;
			min?: undefined;
			max?: undefined;
			icon?: undefined;
	  };

const { developer, manager } = UserRole;

/**
 * 基础菜单项
 */
export const menu_basic: MenuBasic[] = [
	{ name: mnv_back, path: '', icon: Reset },
	{},
	{ name: mnv_settings, path: '/settings', min: developer, icon: Gear },
	{ name: mnv_members_m, path: '/members', min: manager, icon: Person },
	{ name: mnv_members_l, path: '/members', max: manager, icon: Person },
	{ name: mnv_robots, path: '/robots', icon: Rocket },
	{ name: mnv_cnts, path: '/analysis', icon: ChartPie },
	{ name: mnv_versions_m, path: '/versions', min: manager, icon: Lifebuoy },
	{ name: mnv_versions_l, path: '/versions', max: manager, icon: Lifebuoy },
];

const allow = (
	{ min, max }: { min?: UserRole; max?: UserRole },
	role?: EnumVal<typeof UserRole>,
) => {
	if (min && (!role || role < min.val)) return false;
	if (max && role && role > max.val) return false;
	return true;
};

/**
 * 检查是否有访问指定路径的权限
 * @param role 角色
 * @param path 路径
 * @returns 是否有权限
 */
export function hasPermission(
	pid: ProjId,
	role: undefined | EnumVal<typeof UserRole>,
	path: string,
): boolean {
	const link = getClinkByProjectId(pid);
	return menu_basic
		.filter((item) => path === `${link}${item.path}`)
		.some((item) => allow(item, role));
}

export type MenuItem = {
	name: i18nMsgFunc;
	href?: string;
	icon?: IconSource;
};
export type MenuItems = (MenuItem | null)[];
/**
 * 获取菜单项
 * @param pid 项目ID
 * @param role 用户角色
 * @returns 菜单项数组
 */
export function getMenuItems(pid: ProjId, role: EnumVal<typeof UserRole> | undefined): MenuItems {
	const link = getClinkByProjectId(pid);

	return menu_basic
		.filter((item) => allow(item, role))
		.map(({ name, path, icon }) => {
			if (path === undefined) {
				if (name) return { name, icon }; // 作为标题
				return null; // 作为分割线
			} else return { name, href: `${link}${path}`, icon }; // 作为菜单项
		});
}
