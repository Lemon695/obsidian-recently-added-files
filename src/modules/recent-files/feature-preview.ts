import type {PluginModule} from '../../core/types';
import type RecentlyAddedFilesPlugin from '../../main';
import {t} from '../../i18n/locale';
import {recentFilesModuleI18n} from '../../i18n/modules/recent-files/module';
import {FilePreviewService} from './preview-service';
import type {RecentFilesPreviewAdapter} from './adapters';

class PreviewAdapter extends FilePreviewService implements RecentFilesPreviewAdapter {
	hide(): void {
		this.showNone();
	}
}

export class RecentFilesPreviewModule implements PluginModule {
	readonly id = 'recent-files-preview';
	readonly name = t(recentFilesModuleI18n).previewName;
	readonly description = t(recentFilesModuleI18n).previewDesc;

	private readonly adapter: RecentFilesPreviewAdapter = new PreviewAdapter();

	constructor(private readonly plugin: RecentlyAddedFilesPlugin) {}

	onload(): void {
		this.plugin.recentFilesAdapters.preview = this.adapter;
	}

	onunload(): void {
		if (this.plugin.recentFilesAdapters.preview === this.adapter) {
			this.plugin.recentFilesAdapters.preview = null;
		}
		this.adapter.hide();
	}
}
