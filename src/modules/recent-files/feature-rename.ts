import {App, TFile} from 'obsidian';
import type {PluginModule} from '../../core/types';
import type RecentlyAddedFilesPlugin from '../../main';
import {t} from '../../i18n/locale';
import {recentFilesModuleI18n} from '../../i18n/modules/recent-files/module';
import {FileRenameUtils} from '../../utils/RenameFileToMD5';
import type {RecentFilesRenameAdapter} from './adapters';

class RenameAdapter implements RecentFilesRenameAdapter {
	rename(app: App, file: TFile): Promise<void> {
		return FileRenameUtils.renameWithHash(app, file);
	}
}

export class RecentFilesRenameModule implements PluginModule {
	readonly id = 'recent-files-rename';
	readonly name = t(recentFilesModuleI18n).renameName;
	readonly description = t(recentFilesModuleI18n).renameDesc;

	private readonly adapter: RecentFilesRenameAdapter = new RenameAdapter();

	constructor(private readonly plugin: RecentlyAddedFilesPlugin) {}

	onload(): void {
		this.plugin.recentFilesAdapters.rename = this.adapter;
	}

	onunload(): void {
		if (this.plugin.recentFilesAdapters.rename === this.adapter) {
			this.plugin.recentFilesAdapters.rename = null;
		}
	}
}
