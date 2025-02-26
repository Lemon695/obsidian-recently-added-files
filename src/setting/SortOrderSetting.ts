import NewFilesPlugin from "../main";
import {Setting} from "obsidian";

export class SortOrderSetting {
	private containerEl: HTMLElement;
	private plugin: NewFilesPlugin;

	constructor({containerEl, plugin}: { containerEl: HTMLElement; plugin: NewFilesPlugin }) {
		this.containerEl = containerEl;
		this.plugin = plugin;
	}

	create(): void {
		new Setting(this.containerEl)
			.setName('File Sort Order')
			.setDesc('Choose how files are sorted in the list')
			.addDropdown((dropdown) => {
				dropdown
					.addOption('newest', 'Newest first')
					.addOption('oldest', 'Oldest first')
					.addOption('az', 'By name A-Z')
					.addOption('za', 'By name Z-A')
					.setValue(this.plugin.data.sortOrder)
					.onChange(async (value: 'newest' | 'oldest' | 'az' | 'za') => {
						this.plugin.data.sortOrder = value;
						await this.plugin.saveData();
						this.plugin.view.redraw();
					});
			});
	}
}
