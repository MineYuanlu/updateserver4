import * as runtime from '$lib/paraglide/runtime';
import { createI18n } from '@inlang/paraglide-sveltekit';
export const i18n = createI18n(runtime);

export type LanguageTag = (typeof runtime.availableLanguageTags)[number];
export type i18nMsgFunc<Param = {}> = keyof Param extends never
	? (params?: Param, options?: { languageTag?: LanguageTag }) => string
	: (params: Param, options?: { languageTag?: LanguageTag }) => string;
