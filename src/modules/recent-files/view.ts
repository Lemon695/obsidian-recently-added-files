import {
	App,
	ItemView,
	Keymap,
	Menu,
	Notice,
	PaneType,
	setIcon,
	setTooltip,
	TFile,
	WorkspaceLeaf,
} from 'obsidian';
import {getApiSafe} from 'front-matter-plugin-api-provider';
import type RecentlyAddedFilesPlugin from '../../main';
import {FilePath, NewFilesData} from '../../types/FileTypes';
import {ICON_NAME} from '../../view/icon';
import {NewFilesListViewType} from '../../constants';
import {FileNameUtils} from '../../utils/FileNameUtils';
import {FileUtils} from '../../utils/FileUtils';
import {t} from '../../i18n/locale';
import {recentFilesViewI18n} from '../../i18n/modules/recent-files/view';
import {applyPinning, filterFilesBySearch, resolveRenderWindow} from './list-logic';

interface DragManagerInterface {
	dragFile: (event: DragEvent, file: TFile) => unknown;
	onDragStart: (event: DragEvent, dragData: unknown) => void;
}

interface AppWithDragManager extends App {
	dragManager: DragManagerInterface;
}

export class NewFilesListView extends ItemView {
	private previewTimeout: ReturnType<typeof setTimeout> | null = null;
	private currentHoverElement: HTMLElement | null = null;
	private searchDebounceTimer: ReturnType<typeof setTimeout> | null = null;
	private searchQuery = '';
	private lastRenderSignature = '';
	private readonly i18n = t(recentFilesViewI18n);

	constructor(
		leaf: WorkspaceLeaf,
		private readonly plugin: RecentlyAddedFilesPlugin,
	) {
		super(leaf);
	}

	public async onOpen(): Promise<void> {
		this.redraw();
	}

	public async onClose(): Promise<void> {
		if (this.previewTimeout) {
			clearTimeout(this.previewTimeout);
			this.previewTimeout = null;
		}
		if (this.searchDebounceTimer) {
			clearTimeout(this.searchDebounceTimer);
			this.searchDebounceTimer = null;
		}
		this.currentHoverElement = null;
		this.lastRenderSignature = '';
		this.plugin.recentFilesAdapters.preview?.hide();
		if (this.plugin.view === this) {
			this.plugin.view = null;
		}
	}

	public getViewType(): string {
		return NewFilesListViewType;
	}

	public getDisplayText(): string {
		return this.plugin.data.listMode === 'modified'
			? this.i18n.viewTitleModified
			: this.i18n.viewTitle;
	}

	public getIcon(): string {
		return ICON_NAME;
	}

	public onPaneMenu(menu: Menu): void {
		menu
			.addItem((item) => {
					item
						.setTitle(this.i18n.clearList)
					.setIcon(ICON_NAME)
					.onClick(async () => {
						this.plugin.data.newFiles = [];
						this.plugin.data.pinnedPaths = [];
						await this.plugin.saveData();
						this.redraw();
					});
			})
			.addItem((item) => {
					item
						.setTitle(this.i18n.close)
					.setIcon('cross')
					.onClick(() => {
						this.app.workspace.detachLeavesOfType(NewFilesListViewType);
					});
			});
	}

	public readonly redraw = (): void => {
		const data = this.plugin.data;
		const openFile = this.app.workspace.getActiveFile();
		const frontMatterApi = getApiSafe(this.app);
		const frontMatterEnabled = frontMatterApi && frontMatterApi.getEnabledFeatures().contains('explorer');
		const frontMatterResolver = frontMatterEnabled
			? frontMatterApi.getResolverFactory()?.createResolver('explorer')
			: null;

		const listAdapter = this.plugin.recentFilesAdapters.list;
		const files = listAdapter
			? listAdapter.getVisibleFiles(data.newFiles, data, {searchQuery: this.searchQuery})
			: applyPinning(filterFilesBySearch(data.newFiles, this.searchQuery), data.pinnedPaths);
		const renderFiles = resolveRenderWindow(files);
		const signature = this.computeRenderSignature(data, renderFiles, openFile?.path ?? '');
		const rootEl = this.contentEl.querySelector<HTMLElement>('.nav-folder.mod-root');
		if (signature === this.lastRenderSignature && rootEl) {
			return;
		}
		this.lastRenderSignature = signature;

		const activeRootEl = rootEl ?? this.contentEl.createDiv({cls: 'nav-folder mod-root'});
		activeRootEl.empty();
		this.createFilterDropdown(activeRootEl, data);
		this.createSearchBox(activeRootEl);

		const childrenEl = activeRootEl.createDiv({cls: 'nav-folder-children'});
		renderFiles.forEach((currentFile) => {
			const isPinned = this.plugin.data.pinnedPaths.includes(currentFile.path);
			const navFile = childrenEl.createDiv({
				cls: 'tree-item nav-file newly-added-files-file',
			});
			const navFileTitle = navFile.createDiv({
				cls: 'tree-item-self is-clickable nav-file-title newly-added-files-title',
			});
			if (isPinned) {
				navFileTitle.addClass('newly-added-files-pinned');
			}
			const navFileIcon = navFileTitle.createDiv({
				cls: 'tree-item-icon newly-added-files-icon',
			});

			const fileExtension = currentFile.path.split('.').pop()?.toLowerCase();
			const iconName = listAdapter
				? listAdapter.getIcon(fileExtension)
				: 'lucide-file';
			setIcon(navFileIcon, iconName);

			const navFileTitleContent = navFileTitle.createDiv({
				cls: 'tree-item-inner nav-file-title-content newly-added-files-title-content',
			});
			const title = frontMatterResolver
				? frontMatterResolver.resolve(currentFile.path) ??
				FileNameUtils.getDisplayName(currentFile, data.showExtension ?? false)
				: FileNameUtils.getDisplayName(currentFile, data.showExtension ?? false);
			if (isPinned) {
				const pinIndicator = navFileTitleContent.createSpan({
					cls: 'newly-added-files-pin-indicator',
				});
				setIcon(pinIndicator, 'pin');
			}
			navFileTitleContent.createSpan({text: title, cls: 'newly-added-files-title-text'});

			setTooltip(navFile, currentFile.path);
			if (openFile && currentFile.path === openFile.path) {
				navFileTitle.addClass('is-active');
			}

			this.bindFileInteractions(
				navFileTitle,
				navFile,
				navFileTitleContent,
				currentFile,
				activeRootEl,
				fileExtension,
			);

			const navFileDelete = navFileTitle.createDiv({
				cls: 'newly-added-files-file-delete menu-item-icon',
			});
			setIcon(navFileDelete, 'lucide-x');
			navFileDelete.addEventListener('click', (event) => {
				event.stopPropagation();
				void this.removeFile(currentFile).then(() => this.redraw());
			});
		});
	};

	private computeRenderSignature(data: NewFilesData, files: FilePath[], openFilePath: string): string {
		return JSON.stringify({
			openFilePath,
			searchQuery: this.searchQuery,
			activeFileType: data.activeFileType,
			enableFileTypeFilter: data.enableFileTypeFilter,
			showExtension: data.showExtension ?? false,
			sortOrder: data.sortOrder,
			listMode: data.listMode,
			files: files.map((file) => `${file.path}|${file.basename}`),
		});
	}

	private bindFileInteractions(
		navFileTitle: HTMLElement,
		navFile: HTMLElement,
		navFileTitleContent: HTMLElement,
		currentFile: FilePath,
		rootEl: HTMLElement,
		fileExtension: string | undefined,
	): void {
		navFileTitle.setAttr('draggable', 'true');
		navFileTitle.addEventListener('dragstart', (event: DragEvent) => {
			const file = this.app.metadataCache.getFirstLinkpathDest(currentFile.path, '');
			if (!file) return;
			const dragManager = (this.app as AppWithDragManager).dragManager;
			const dragData = dragManager.dragFile(event, file);
			dragManager.onDragStart(event, dragData);
		});

		navFileTitle.addEventListener('mouseover', (event: MouseEvent) => {
			this.app.workspace.trigger('hover-link', {
				event,
				source: NewFilesListViewType,
				hoverParent: rootEl,
				targetEl: navFile,
				linktext: currentFile.path,
			});
			this.currentHoverElement = navFileTitle;
		});

		navFileTitle.addEventListener('mouseenter', (event) => {
			const previewAdapter = this.plugin.recentFilesAdapters.preview;
			if (!previewAdapter || !FileUtils.canPreview(fileExtension)) return;
			if (!this.previewTimeout) {
				this.previewTimeout = setTimeout(() => {
					if (this.currentHoverElement === navFileTitle) {
						void previewAdapter.show(this.app, currentFile, event);
					}
				}, 500);
			}
		});

		navFileTitle.addEventListener('mouseleave', () => {
			if (this.previewTimeout) {
				clearTimeout(this.previewTimeout);
				this.previewTimeout = null;
			}
			this.currentHoverElement = null;
			this.plugin.recentFilesAdapters.preview?.hide();
		});

		navFileTitle.addEventListener('contextmenu', (event: MouseEvent) => {
			const menu = new Menu();
			menu.addItem((item) =>
				item
					.setSection('action')
					.setTitle(this.i18n.openInNewTab)
					.setIcon('file-plus')
					.onClick(() => this.focusFile(currentFile, 'tab')),
			);

			const renameAdapter = this.plugin.recentFilesAdapters.rename;
			if (renameAdapter) {
				menu.addItem((item) =>
					item
						.setSection('action')
						.setTitle(this.i18n.renameWithHash)
						.setIcon('file-signature')
						.onClick(async () => {
							const file = this.app.vault.getFileByPath(currentFile.path);
							if (!file) {
								new Notice(this.i18n.fileNotFound);
								return;
							}
							await renameAdapter.rename(this.app, file);
							new Notice(this.i18n.fileRenamed);
						}),
				);
			}
			menu.addItem((item) =>
				item
					.setSection('action')
					.setTitle(
						this.plugin.data.pinnedPaths.includes(currentFile.path)
							? this.i18n.unpinFile
							: this.i18n.pinFile,
					)
					.setIcon('pin')
					.onClick(async () => {
						const isPinned = this.plugin.data.pinnedPaths.includes(currentFile.path);
						this.plugin.data.pinnedPaths = isPinned
							? this.plugin.data.pinnedPaths.filter((path) => path !== currentFile.path)
							: [...this.plugin.data.pinnedPaths, currentFile.path];
						await this.plugin.saveData();
						this.redraw();
					}),
			);

			const file = this.app.vault.getAbstractFileByPath(currentFile.path);
			if (!file) return;

			this.app.workspace.trigger('file-menu', menu, file, 'more-options');
			menu.showAtPosition({x: event.clientX, y: event.clientY});
		});

		navFileTitle.addEventListener('click', (event: MouseEvent) => {
			const newLeaf = Keymap.isModEvent(event);
			this.focusFile(currentFile, newLeaf ? 'tab' : false);
		});

		navFileTitleContent.addEventListener('mousedown', (event: MouseEvent) => {
			if (event.button === 1) {
				event.preventDefault();
				this.focusFile(currentFile, 'tab');
			}
		});
	}

	private createSearchBox(rootEl: HTMLElement): void {
		const searchContainer = rootEl.createDiv({
			cls: 'nav-folder-title newly-added-files-search',
		});

		const searchInput = searchContainer.createEl('input', {
			cls: 'newly-added-files-search-input',
			attr: {
				type: 'text',
				placeholder: this.i18n.searchPlaceholder,
				'aria-label': this.i18n.searchAriaLabel,
			},
		});
		searchInput.value = this.searchQuery;

		const clearButton = searchContainer.createDiv({
			cls: 'newly-added-files-search-clear',
		});
		setIcon(clearButton, 'lucide-x');
		clearButton.toggleClass('newly-added-files-hidden', this.searchQuery.length === 0);

		searchInput.addEventListener('input', (e) => {
			const value = (e.target as HTMLInputElement).value.toLowerCase();
			if (this.searchDebounceTimer) {
				clearTimeout(this.searchDebounceTimer);
			}

			this.searchDebounceTimer = setTimeout(() => {
				this.updateSearchQuery(value, true);
			}, 300);
		});

		clearButton.addEventListener('click', () => {
			this.updateSearchQuery('', true);
		});
	}

	private updateSearchQuery(query: string, keepFocus: boolean): void {
		this.searchQuery = query;
		this.redraw();
		if (!keepFocus) {
			return;
		}

		const input = this.contentEl.querySelector<HTMLInputElement>('.newly-added-files-search-input');
		if (!input) {
			return;
		}

		input.focus();
		input.setSelectionRange(query.length, query.length);
	}

	private createFilterDropdown(containerEl: HTMLElement, data: NewFilesData): void {
		if (!data.enableFileTypeFilter) return;

		const filterContainer = containerEl.createDiv({
			cls: 'nav-folder-title newly-added-files-filter',
		});
		filterContainer.createSpan({
			cls: 'newly-added-files-filter-label',
			text: this.i18n.filterLabel,
		});

		const filterDropdown = filterContainer.createEl('select', {
			cls: 'dropdown',
			attr: {'aria-label': this.i18n.filterAriaLabel},
		});
		const options = [
			{value: 'all', label: this.i18n.allFiles},
			{value: 'md', label: this.i18n.markdown},
			{value: 'pdf', label: this.i18n.pdf},
			{value: 'image', label: this.i18n.images},
			{value: 'video', label: this.i18n.videos},
			{value: 'canvas', label: this.i18n.canvas},
			{value: 'other', label: this.i18n.otherFiles},
		];
		options.forEach((option) => {
			const optionEl = filterDropdown.createEl('option', {
				text: option.label,
				value: option.value,
			});
			if (option.value === data.activeFileType) {
				optionEl.selected = true;
			}
		});

		filterDropdown.addEventListener('change', (event) => {
			const target = event.target as HTMLSelectElement;
			this.plugin.data.activeFileType = target.value;
			void this.plugin.saveData().then(() => {
				this.redraw();
			});
		});
	}

	private readonly removeFile = async (file: FilePath): Promise<void> => {
		this.plugin.data.newFiles = this.plugin.data.newFiles.filter(
			(currFile) => currFile.path !== file.path,
		);
		this.plugin.data.pinnedPaths = this.plugin.data.pinnedPaths.filter(
			(path) => path !== file.path,
		);
		await this.plugin.saveData();
	};

	private readonly focusFile = (file: FilePath, newLeaf: boolean | PaneType): void => {
		const targetFile = this.app.vault.getFileByPath(file.path);
		if (targetFile) {
			const leaf = this.app.workspace.getLeaf(newLeaf);
			void leaf.openFile(targetFile);
			return;
		}

		new Notice(this.i18n.cannotFindFile);
		this.plugin.data.newFiles = this.plugin.data.newFiles.filter(
			(fp) => fp.path !== file.path,
		);
		void this.plugin.saveData();
		this.redraw();
	};
}
