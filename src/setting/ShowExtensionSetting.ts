import {Setting} from 'obsidian';
import NewFilesPlugin from '../main';
import {t} from "../i18n/locale";
import {recentFilesSettingsI18n} from '../i18n/modules/recent-files/settings';

interface ShowExtensionSettingParams {
	containerEl: HTMLElement;
	plugin: NewFilesPlugin;
	defaultShowExtension: boolean;
}

export class ShowExtensionSetting {
	private readonly containerEl: HTMLElement;
	private readonly plugin: NewFilesPlugin;
	private readonly defaultShowExtension: boolean;

	constructor({
					containerEl,
					plugin,
					defaultShowExtension,
				}: ShowExtensionSettingParams) {
		this.containerEl = containerEl;
		this.plugin = plugin;
		this.defaultShowExtension = defaultShowExtension;
	}

	create(): void {
		const i18n = t(recentFilesSettingsI18n);
		new Setting(this.containerEl)
			.setName(i18n.showExtensionName)
			.setDesc(i18n.showExtensionDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.data.showExtension ?? this.defaultShowExtension)
					.onChange(async (value) => {
						this.plugin.data.showExtension = value;
						await this.plugin.saveData();
						this.plugin.view?.redraw();
					});
			});
	}
}
