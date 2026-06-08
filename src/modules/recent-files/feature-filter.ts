import type {PluginModule} from '../../core/types';
import type RecentlyAddedFilesPlugin from '../../main';
import {t} from '../../i18n/locale';
import {recentFilesModuleI18n} from '../../i18n/modules/recent-files/module';
import {resolveFileIcon, sortAndFilterFiles} from './list-logic';
import type {RecentFilesListAdapter} from './adapters';

class FilterAdapter implements RecentFilesListAdapter {
	getVisibleFiles = sortAndFilterFiles;
	getIcon = resolveFileIcon;
}

export class RecentFilesFilterModule implements PluginModule {
	readonly id = 'recent-files-filter';
	readonly name = t(recentFilesModuleI18n).filterName;
	readonly description = t(recentFilesModuleI18n).filterDesc;

	private readonly adapter: RecentFilesListAdapter = new FilterAdapter();

	constructor(private readonly plugin: RecentlyAddedFilesPlugin) {}

	onload(): void {
		this.plugin.recentFilesAdapters.list = this.adapter;
		this.plugin.view?.redraw();
	}

	onunload(): void {
		if (this.plugin.recentFilesAdapters.list === this.adapter) {
			this.plugin.recentFilesAdapters.list = null;
			this.plugin.view?.redraw();
		}
	}
}
