import NewFilesPlugin from "../main";
import {Setting} from "obsidian";
import {t} from "../i18n/locale";
import {recentFilesSettingsI18n} from '../i18n/modules/recent-files/settings';

export class FileTypeFilterToggleSetting {
	private containerEl: HTMLElement;
	private plugin: NewFilesPlugin;

	constructor({containerEl, plugin}: { containerEl: HTMLElement; plugin: NewFilesPlugin }) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	create(): void {
		const i18n = t(recentFilesSettingsI18n);
		new Setting(this.containerEl)
			.setName(i18n.enableFilterName)
			.setDesc(i18n.enableFilterDesc)
			.addToggle((toggle) => {
				toggle
					.setValue(this.plugin.data.enableFileTypeFilter)
					.onChange(async (value) => {
						this.plugin.data.enableFileTypeFilter = value;
						await this.plugin.saveData();
						this.plugin.view?.redraw();
					});
			});
	}
}
