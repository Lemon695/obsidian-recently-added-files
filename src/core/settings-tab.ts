import {App, PluginSettingTab, Setting} from 'obsidian';
import type RecentlyAddedFilesPlugin from '../main';
import {t} from '../i18n/locale';
import {settingsTabI18n} from '../i18n/core/settings-tab';

export class RecentlyAddedFilesSettingsTab extends PluginSettingTab {
	constructor(app: App, private readonly plugin: RecentlyAddedFilesPlugin) {
		super(app, plugin);
	}

	display(): void {
		const {containerEl} = this;
		containerEl.empty();
		const i18n = t(settingsTabI18n);

		new Setting(containerEl)
			.setName(i18n.heading)
			.setHeading();

		containerEl.createEl('p', {text: i18n.intro});

		for (const module of this.plugin.moduleManager.getAll()) {
			const sectionEl = containerEl.createDiv({cls: 'newly-added-files-module-section'});

			new Setting(sectionEl)
				.setName(module.name)
				.setDesc(module.description)
				.addToggle((toggle) => {
					toggle
						.setValue(this.plugin.moduleManager.isEnabled(module.id))
						.onChange(async (enabled) => {
							if (enabled) {
								await this.plugin.moduleManager.enableModule(module.id);
							} else {
								await this.plugin.moduleManager.disableModule(module.id);
							}
							this.display();
						});
				});

			if (this.plugin.moduleManager.isEnabled(module.id) && module.renderSettings) {
				const moduleSettingsEl = sectionEl.createDiv({cls: 'newly-added-files-module-settings'});
				module.renderSettings(moduleSettingsEl);
			}
		}
	}
}
