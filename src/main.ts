import {Plugin} from 'obsidian';
import {ModuleManager} from './core/module-manager';
import {
	DEFAULT_SETTINGS,
	needsSettingsPersistence,
	normalizeSettings,
	PluginSettings,
} from './core/types';
import {RecentlyAddedFilesSettingsTab} from './core/settings-tab';
import {RecentFilesModule, NewFilesListView} from './modules/recent-files';
import {NewFilesData} from './types/FileTypes';
import type {
	RecentFilesListAdapter,
	RecentFilesPreviewAdapter,
	RecentFilesRenameAdapter,
} from './modules/recent-files/adapters';
import {RecentFilesFilterModule} from './modules/recent-files/feature-filter';
import {RecentFilesPreviewModule} from './modules/recent-files/feature-preview';
import {RecentFilesRenameModule} from './modules/recent-files/feature-rename';

export default class RecentlyAddedFilesPlugin extends Plugin {
	public settings: PluginSettings = DEFAULT_SETTINGS;
	public moduleManager!: ModuleManager;

	// Compatibility fields for existing setting helper classes.
	public view: NewFilesListView | null = null;
	private recentFilesModule!: RecentFilesModule;
	public readonly recentFilesAdapters: {
		list: RecentFilesListAdapter | null;
		preview: RecentFilesPreviewAdapter | null;
		rename: RecentFilesRenameAdapter | null;
	} = {
		list: null,
		preview: null,
		rename: null,
	};

	public get data(): NewFilesData {
		return this.settings.recentFiles;
	}

	public set data(value: NewFilesData) {
		this.settings.recentFiles = value;
	}

	public async onload(): Promise<void> {
		await this.loadSettings();

		this.moduleManager = new ModuleManager(this);
		this.recentFilesModule = new RecentFilesModule(this);
		this.moduleManager.register(this.recentFilesModule);
		this.moduleManager.register(new RecentFilesFilterModule(this));
		this.moduleManager.register(new RecentFilesPreviewModule(this));
		this.moduleManager.register(new RecentFilesRenameModule(this));

		await this.moduleManager.loadAll();
		this.addSettingTab(new RecentlyAddedFilesSettingsTab(this.app, this));
	}

	public onunload(): void {
		this.moduleManager.unloadAll();
	}

	public async loadSettings(): Promise<void> {
		const data: unknown = await super.loadData();
		this.settings = normalizeSettings(data);
		if (needsSettingsPersistence(data)) {
			await super.saveData(this.settings);
		}
	}

	public async saveSettings(): Promise<void> {
		await super.saveData(this.settings);
	}

	// Compatibility methods for existing setting helper classes.
	public async saveData(): Promise<void> {
		await this.saveSettings();
	}

	public async pruneLength(): Promise<void> {
		await this.recentFilesModule.pruneLength();
	}

	public async pruneOmittedFiles(): Promise<void> {
		await this.recentFilesModule.pruneOmittedFiles();
	}

	public async onExternalSettingsChange(): Promise<void> {
		await this.recentFilesModule.onExternalSettingsChange();
	}

	public onUserEnable(): void {
		this.recentFilesModule.onUserEnable();
	}
}
