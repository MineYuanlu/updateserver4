import * as runtime from '$lib/paraglide/runtime';
import { createI18n } from '@inlang/paraglide-sveltekit';
export const i18n = createI18n(runtime);

export type LanguageTag = (typeof runtime.availableLanguageTags)[number];
export type i18nMsgFunc<Param extends Record<string, unknown> = {}> = keyof Param extends never
	? (params?: Param, options?: { languageTag?: LanguageTag }) => string
	: (params: Param, options?: { languageTag?: LanguageTag }) => string;

/** 获取指定语言的基准路径 */
export function languagePath(tag: runtime.AvailableLanguageTag) {
	return tag === runtime.sourceLanguageTag ? '' : `/${tag}`;
}
export function getRealPath(path: string) {
	if (!path.startsWith('/')) return path; // 不处理相对路径
	for (const lang of runtime.availableLanguageTags) {
		if (lang === runtime.sourceLanguageTag) continue;
		const prefix = languagePath(lang);
		if (path.startsWith(prefix)) {
			path = path.substring(prefix.length);
			break;
		}
	}
	if (!path.startsWith('/')) path = `/${path}`;
	return path;
}

/** URL语言前缀函数 */
export const langPrefix = (): `/${(typeof runtime.availableLanguageTags)[number]}` | '' => {
	const tag = runtime.languageTag();
	return tag === runtime.sourceLanguageTag ? '' : `/${tag}`;
};
