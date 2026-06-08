import NewFilesPlugin from "../main";
import {Setting} from "obsidian";
import {t} from "../i18n/locale";
import {recentFilesSettingsI18n} from '../i18n/modules/recent-files/settings';

export class SortOrderSetting {
	private containerEl: HTMLElement;
	private plugin: NewFilesPlugin;

	constructor({containerEl, plugin}: { containerEl: HTMLElement; plugin: NewFilesPlugin }) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	create(): void {
		const i18n = t(recentFilesSettingsI18n);
		new Setting(this.containerEl)
			.setName(i18n.sortOrderName)
			.setDesc(i18n.sortOrderDesc)
			.addDropdown((dropdown) => {
				dropdown
					.addOption('newest', i18n.sortNewest)
					.addOption('oldest', i18n.sortOldest)
					.addOption('az', i18n.sortAZ)
					.addOption('za', i18n.sortZA)
					.setValue(this.plugin.data.sortOrder)
					.onChange(async (value: 'newest' | 'oldest' | 'az' | 'za') => {
						this.plugin.data.sortOrder = value;
						await this.plugin.saveData();
						this.plugin.view?.redraw();
					});
			});
	}
}
