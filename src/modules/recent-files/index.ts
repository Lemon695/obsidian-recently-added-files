import {
	addIcon,
	TAbstractFile,
	TFile,
	WorkspaceLeaf,
} from 'obsidian';
import type RecentlyAddedFilesPlugin from '../../main';
import type {PluginModule} from '../../core/types';
import {ICON_NAME, ICON_SVG} from '../../view/icon';
import {defaultMaxLength, NewFilesListViewType} from '../../constants';
import {FilePath} from '../../types/FileTypes';
import {FileNameUtils} from '../../utils/FileNameUtils';
import {t} from '../../i18n/locale';
import {recentFilesModuleI18n} from '../../i18n/modules/recent-files/module';
import {recentFilesViewI18n} from '../../i18n/modules/recent-files/view';
import {renderRecentFilesSettings} from './settings-renderer';
import {normalizeTags} from './list-logic';
import {NewFilesListView} from './view';
import {RecentFilesCommandRegistry} from './commands';
import {createScopedLogger, measureAsync} from '../../core/observability';

export class RecentFilesModule implements PluginModule {
	readonly id = 'recent-files-core';
	readonly name = t(recentFilesModuleI18n).coreName;
	readonly description = t(recentFilesModuleI18n).coreDesc;

	private isInitialized = false;
	private syncTimer: ReturnType<typeof setTimeout> | null = null;
	private flushing = false;
	private flushPending = false;
	private readonly regexCache: Map<string, RegExp | null> = new Map();
	private commandRegistry: RecentFilesCommandRegistry | null = null;
	private readonly logger = createScopedLogger('recent-files-core');

	constructor(private readonly plugin: RecentlyAddedFilesPlugin) {}

	onload(): void {
		addIcon(ICON_NAME, ICON_SVG);

		this.plugin.registerView(
			NewFilesListViewType,
			(leaf: WorkspaceLeaf) => {
				const view = new NewFilesListView(leaf, this.plugin);
				this.plugin.view = view;
				return view;
			},
		);
		this.commandRegistry = new RecentFilesCommandRegistry(this.plugin);
		this.registerCommands();

		this.plugin.registerHoverLinkSource(NewFilesListViewType, {
			display: t(recentFilesViewI18n).viewTitle,
			defaultMod: true,
		});

		this.plugin.app.workspace.onLayoutReady(() => {
			this.isInitialized = true;
			this.registerFileEvents();
		});
	}

	onunload(): void {
		if (this.syncTimer) {
			clearTimeout(this.syncTimer);
			this.syncTimer = null;
		}
		this.commandRegistry = null;
		this.plugin.view = null;
	}

	renderSettings(containerEl: HTMLElement): void {
		renderRecentFilesSettings(containerEl, this.plugin);
	}

	async pruneOmittedFiles(): Promise<void> {
		this.plugin.data.newFiles = this.plugin.data.newFiles.filter((file) => this.shouldAddFile(file));
		const availablePaths = new Set(this.plugin.data.newFiles.map((file) => file.path));
		this.plugin.data.pinnedPaths = this.plugin.data.pinnedPaths.filter((path) =>
			availablePaths.has(path),
		);
		await this.flushState();
	}

	async pruneLength(): Promise<void> {
		const maxLen = this.plugin.data.maxLength || defaultMaxLength;
		if (this.plugin.data.newFiles.length > maxLen) {
			this.plugin.data.newFiles = this.plugin.data.newFiles.slice(0, maxLen);
		}
		await this.flushState();
	}

	async onExternalSettingsChange(): Promise<void> {
		await this.pruneLength();
		await this.pruneOmittedFiles();
	}

	onUserEnable(): void {
		void this.plugin.app.workspace.ensureSideLeaf(NewFilesListViewType, 'left', {reveal: true});
	}

	private registerFileEvents(): void {
		this.plugin.registerEvent(this.plugin.app.vault.on('rename', this.handleRename));
		this.plugin.registerEvent(this.plugin.app.vault.on('delete', this.handleDelete));
		this.plugin.registerEvent(
			this.plugin.app.vault.on('modify', (file) => {
				if (file instanceof TFile) {
					void this.handleModify(file);
				}
			}),
		);
		this.plugin.registerEvent(
			this.plugin.app.vault.on('create', (file) => {
				if (file instanceof TFile) {
					void this.handleNewFile(file);
				}
			}),
		);
	}

	private registerCommands(): void {
		this.commandRegistry?.registerMany([
			{
				id: 'files-list',
				name: t(recentFilesViewI18n).commandOpen,
				callback: async () => {
					await this.openListView();
				},
			},
			{
				id: 'files-list-clear',
				name: 'Clear recently added files list',
				callback: async () => {
					this.plugin.data.newFiles = [];
					this.requestSync({immediate: true});
				},
			},
			{
				id: 'files-list-prune-missing',
				name: 'Prune missing entries from recently added files',
				callback: async () => {
					this.plugin.data.newFiles = this.plugin.data.newFiles.filter((item) =>
						!!this.plugin.app.vault.getFileByPath(item.path),
					);
					this.requestSync({immediate: true});
				},
			},
			{
				id: 'files-list-open-top-5',
				name: 'Open top 5 recently added files in new tabs',
				callback: async () => {
					const topFiles = this.plugin.data.newFiles.slice(0, 5);
					for (const item of topFiles) {
						const file = this.plugin.app.vault.getFileByPath(item.path);
						if (!file) continue;
						const leaf = this.plugin.app.workspace.getLeaf('tab');
						await leaf.openFile(file);
					}
				},
			},
		]);
	}

	private async openListView(): Promise<void> {
		const [existing] = this.plugin.app.workspace.getLeavesOfType(NewFilesListViewType);
		if (existing) {
			await this.plugin.app.workspace.revealLeaf(existing);
		} else {
			await this.plugin.app.workspace.ensureSideLeaf(NewFilesListViewType, 'left', {reveal: true});
		}
	}

	private shouldAddFile(file: FilePath): boolean {
		if (!file.path) return false;

		const patterns = this.plugin.data.omittedPaths.filter((path) => path.length > 0);
		if (patterns.some((pattern) => this.matchesPattern(pattern, file.path))) return false;

		const tfile = this.plugin.app.vault.getFileByPath(file.path);
		if (tfile) {
			const omittedTags = this.plugin.data.omittedTags.filter((tag) => tag.length > 0);
			const rawTags: unknown = this.plugin.app.metadataCache.getFileCache(tfile)?.frontmatter?.tags;
			const fileTags = normalizeTags(rawTags);
			if (fileTags.some((tag) => omittedTags.includes(tag))) {
				return false;
			}
		}

		return true;
	}

	private readonly handleRename = async (
		file: TAbstractFile,
		oldPath: string,
	): Promise<void> => {
		if (!this.isInitialized) return;

		const hasEntry = this.plugin.data.newFiles.some((f) => f.path === oldPath);
		if (hasEntry) {
			this.plugin.data.newFiles = this.plugin.data.newFiles.map((f) =>
				f.path === oldPath
					? {path: file.path, basename: FileNameUtils.trimExtension(file.name)}
					: f,
			);
			this.plugin.data.pinnedPaths = this.plugin.data.pinnedPaths.map((path) =>
				path === oldPath ? file.path : path,
			);
			this.requestSync();
		}
	};

	private readonly handleDelete = async (file: TAbstractFile): Promise<void> => {
		if (!this.isInitialized) return;

		const beforeLen = this.plugin.data.newFiles.length;
		this.plugin.data.newFiles = this.plugin.data.newFiles.filter(
			(newFile) => newFile.path !== file.path,
		);
		this.plugin.data.pinnedPaths = this.plugin.data.pinnedPaths.filter(
			(path) => path !== file.path,
		);

		if (beforeLen !== this.plugin.data.newFiles.length) {
			this.requestSync();
		}
	};

	private readonly handleNewFile = async (file: TFile): Promise<void> => {
		if (!this.isInitialized) return;
		if (this.plugin.data.listMode !== 'created') return;
		if (!this.shouldAddFile({path: file.path, basename: FileNameUtils.trimExtension(file.name)})) {
			return;
		}

		const existingEntry = this.plugin.data.newFiles.find(
			(newFile) => newFile.path === file.path,
		);
		if (!existingEntry) {
			this.plugin.data.newFiles.unshift({
				path: file.path,
				basename: FileNameUtils.trimExtension(file.name),
			});

			await this.pruneLength();
		}
	};

	private readonly handleModify = async (file: TFile): Promise<void> => {
		if (!this.isInitialized) return;
		if (this.plugin.data.listMode !== 'modified') return;
		if (!this.shouldAddFile({path: file.path, basename: FileNameUtils.trimExtension(file.name)})) {
			return;
		}

		this.plugin.data.newFiles = this.plugin.data.newFiles.filter(
			(newFile) => newFile.path !== file.path,
		);
		this.plugin.data.newFiles.unshift({
			path: file.path,
			basename: FileNameUtils.trimExtension(file.name),
		});
		await this.pruneLength();
	};

	private matchesPattern(pattern: string, filePath: string): boolean {
		if (this.regexCache.size > 200) {
			this.regexCache.clear();
		}
		if (!this.regexCache.has(pattern)) {
			try {
				this.regexCache.set(pattern, new RegExp(pattern));
			} catch {
				this.logger.warn(`Invalid omittedPaths regex: ${pattern}`);
				this.regexCache.set(pattern, null);
			}
		}

		const regex = this.regexCache.get(pattern);
		return regex ? regex.test(filePath) : false;
	}

	private requestSync(options?: {immediate?: boolean}): void {
		if (options?.immediate) {
			void this.flushState();
			return;
		}

		if (this.syncTimer) {
			this.flushPending = true;
			return;
		}
		this.syncTimer = setTimeout(() => {
			this.syncTimer = null;
			void this.flushState();
		}, 100);
	}

	private async flushState(): Promise<void> {
		if (this.flushing) {
			this.flushPending = true;
			return;
		}

		this.flushing = true;
		do {
			this.flushPending = false;
			await measureAsync(this.logger, 'save plugin data', async () => {
				await this.plugin.saveData();
			});
			this.plugin.view?.redraw();
		} while (this.flushPending);
		this.flushing = false;
	}
}

export {NewFilesListView};
