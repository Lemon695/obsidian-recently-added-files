import * as obsidian from 'obsidian';

export type I18nDict<T> = {zh: T; en: T};

export type Locale = 'zh' | 'en';

export function getLocale(): Locale {
	const lang = getLanguageFromObsidian() || window.localStorage.getItem('language') || 'en';
	return lang.startsWith('zh') ? 'zh' : 'en';
}

export function t<T>(dict: I18nDict<T>): T {
	return getLocale() === 'zh' ? dict.zh : dict.en;
}

function getLanguageFromObsidian(): string | null {
	const withLanguageApi = obsidian as unknown as {
		getLanguage?: () => string;
	};
	if (typeof withLanguageApi.getLanguage === 'function') {
		return withLanguageApi.getLanguage();
	}
	return null;
}
