import {Setting} from 'obsidian';
import NewFilesPlugin from '../main';
import {t} from "../i18n/locale";

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
		new Setting(this.containerEl)
			.setName(t('settingShowExtension'))
			.setDesc(t('settingShowExtensionDesc'))
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.data.showExtension ?? this.defaultShowExtension)
					.onChange(async (value) => {
						this.plugin.data.showExtension = value;
						await this.plugin.saveData();
						this.plugin.view.redraw();
					});
			});
	}
}
