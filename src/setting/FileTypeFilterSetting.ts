import NewFilesPlugin from "../main";
import {Setting} from "obsidian";

export class FileTypeFilterSetting {
	private containerEl: HTMLElement;
	private plugin: NewFilesPlugin;

	constructor({containerEl, plugin}: { containerEl: HTMLElement; plugin: NewFilesPlugin }) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	create(): void {
		new Setting(this.containerEl)
			.setName('Default file type filter')
			.setDesc('Select the default file type to filter in the list')
			.addDropdown((dropdown) => {
				dropdown
					.addOption('all', 'All files')
					.addOption('md', 'Markdown')
					.addOption('pdf', 'PDF')
					.addOption('image', 'Images')
					.addOption('video', 'Videos')
					.addOption('canvas', 'Canvas')
					.addOption('other', 'Other Files')
					.setValue(this.plugin.data.activeFileType)
					.onChange(async (value) => {
						this.plugin.data.activeFileType = value;
						await this.plugin.saveData();
						this.plugin.view.redraw();
					});
			});
	}
}
