import NewFilesPlugin from "../main";
import {Setting} from "obsidian";
import {t} from "../i18n/locale";

export class FileTypeFilterSetting {
	private containerEl: HTMLElement;
	private plugin: NewFilesPlugin;

	constructor({containerEl, plugin}: { containerEl: HTMLElement; plugin: NewFilesPlugin }) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	create(): void {
		new Setting(this.containerEl)
			.setName(t('settingDefaultFilter'))
			.setDesc(t('settingDefaultFilterDesc'))
			.addDropdown((dropdown) => {
				dropdown
					.addOption('all', t('allFiles'))
					.addOption('md', t('markdown'))
					.addOption('pdf', t('pdf'))
					.addOption('image', t('images'))
					.addOption('video', t('videos'))
					.addOption('canvas', t('canvas'))
					.addOption('other', t('otherFiles'))
					.setValue(this.plugin.data.activeFileType)
					.onChange(async (value) => {
						this.plugin.data.activeFileType = value;
						await this.plugin.saveData();
						this.plugin.view.redraw();
					});
			});
	}
}
