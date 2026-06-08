import type {I18nDict} from '../locale';

interface SettingsTabI18n {
	heading: string;
	intro: string;
}

export const settingsTabI18n: I18nDict<SettingsTabI18n> = {
	zh: {
		heading: '最近添加的文件',
		intro: '启用或关闭模块。模块启用后，专属设置将显示在开关下方。',
	},
	en: {
		heading: 'Recently added files',
		intro: 'Enable or disable modules. Module settings appear below each toggle when enabled.',
	},
};
