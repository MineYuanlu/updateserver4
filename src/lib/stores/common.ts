import { onMount, type Snippet } from 'svelte';
import { writable, type Writable } from 'svelte/store';

export const navbar = writable<Snippet | undefined>(undefined);

export const setNavBar = (_navbar: Snippet) => {
	onMount(() => {
		navbar.set(_navbar);
		return () => navbar.set(undefined);
	});
};

export type Setting = Snippet<[(v?: boolean) => void]>;
export type Settings = Record<string, Setting>;
/** 全局设置菜单 */
export const settings = writable<Settings>({});
/** 添加全局设置菜单 */
export const setSettings = (v: Setting) => setAValue(settings, v);

const setAValue = <T>(all: Writable<Record<string, T>>, value: T) => {
	onMount(() => {
		let id: string | undefined = undefined;
		all.update((v) => {
			do id = randId();
			while (v[id]);
			v[id] = value;
			return v;
		});
		return () =>
			all.update((v) => {
				if (id) delete v[id];
				return v;
			});
	});
};

const randId = () => Math.random().toString(36).substring(2);
