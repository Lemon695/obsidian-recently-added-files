import NewFilesPlugin from "../main";
import {Setting} from "obsidian";
import {t} from "../i18n/locale";
import {recentFilesSettingsI18n} from '../i18n/modules/recent-files/settings';

export class FileTypeFilterSetting {
	private containerEl: HTMLElement;
	private plugin: NewFilesPlugin;

	constructor({containerEl, plugin}: { containerEl: HTMLElement; plugin: NewFilesPlugin }) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	create(): void {
		const i18n = t(recentFilesSettingsI18n);
		new Setting(this.containerEl)
			.setName(i18n.defaultFilterName)
			.setDesc(i18n.defaultFilterDesc)
			.addDropdown((dropdown) => {
				dropdown
					.addOption('all', i18n.allFiles)
					.addOption('md', i18n.markdown)
					.addOption('pdf', i18n.pdf)
					.addOption('image', i18n.images)
					.addOption('video', i18n.videos)
					.addOption('canvas', i18n.canvas)
					.addOption('other', i18n.otherFiles)
					.setValue(this.plugin.data.activeFileType)
					.onChange(async (value) => {
						this.plugin.data.activeFileType = value;
						await this.plugin.saveData();
						this.plugin.view?.redraw();
					});
			});
	}
}
