import NewFilesPlugin from "../main";
import {Setting} from "obsidian";
import {t} from "../i18n/locale";

export class SortOrderSetting {
	private containerEl: HTMLElement;
	private plugin: NewFilesPlugin;

	constructor({containerEl, plugin}: { containerEl: HTMLElement; plugin: NewFilesPlugin }) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	create(): void {
		new Setting(this.containerEl)
			.setName(t('settingSortOrder'))
			.setDesc(t('settingSortOrderDesc'))
			.addDropdown((dropdown) => {
				dropdown
					.addOption('newest', t('sortNewest'))
					.addOption('oldest', t('sortOldest'))
					.addOption('az', t('sortAZ'))
					.addOption('za', t('sortZA'))
					.setValue(this.plugin.data.sortOrder)
					.onChange(async (value: 'newest' | 'oldest' | 'az' | 'za') => {
						this.plugin.data.sortOrder = value;
						await this.plugin.saveData();
						this.plugin.view.redraw();
					});
			});
	}
}
