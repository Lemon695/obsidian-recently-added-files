import {
	addIcon,
	App,
	ItemView,
	Keymap,
	Menu,
	Notice,
	PaneType,
	Plugin,
	PluginSettingTab,
	setIcon,
	Setting,
	TAbstractFile,
	TFile,
	Workspace,
	HoverParent,
	WorkspaceLeaf,
} from 'obsidian';

import {getApiSafe} from 'front-matter-plugin-api-provider';
import {FilePath, NewFilesData, DEFAULT_DATA} from './types/FileTypes';
import {ICON_NAME, ICON_SVG} from "./view/icon";
import {ListLengthSetting} from "./setting/ListLengthSettingParams";
import {ShowExtensionSetting} from "./setting/ShowExtensionSetting";
import {FileNameUtils} from './utils/FileNameUtils';

//dragManager-定义接口
interface DragManagerInterface {
	dragFile: (event: DragEvent, file: TFile) => unknown;
	onDragStart: (event: DragEvent, dragData: unknown) => void;
}

//Workspace-扩展定义接口
interface WorkspaceWithHoverSource extends Workspace {
	registerHoverLinkSource: (
		source: string,
		config: {
			display: string;
			defaultMod: boolean;
		}
	) => void;
}

const defaultMaxLength: number = 100;

const NewFilesListViewType = 'newly-added-files';

class NewFilesListView extends ItemView {
	private readonly plugin: NewFilesPlugin;
	private readonly data: NewFilesData;

	constructor(
		leaf: WorkspaceLeaf,
		plugin: NewFilesPlugin,
		data: NewFilesData,
	) {
		super(leaf);

		this.plugin = plugin;
		this.data = data;
	}

	public async onOpen(): Promise<void> {
		this.redraw();
	}

	public getViewType(): string {
		return NewFilesListViewType;
	}

	public getDisplayText(): string {
		return '';
	}

	public getIcon(): string {
		return ICON_NAME;
	}

	public onPaneMenu(menu: Menu): void {
		menu
			.addItem((item) => {
				item
					.setTitle('Clear list')
					.setIcon(ICON_NAME)
					.onClick(async () => {
						this.data.newFiles = [];
						await this.plugin.saveData();
						this.redraw();
					});
			})
			.addItem((item) => {
				item
					.setTitle('Close')
					.setIcon('cross')
					.onClick(() => {
						this.app.workspace.detachLeavesOfType(NewFilesListViewType);
					});
			});
	}

	public load(): void {
		super.load();
	}

	public readonly redraw = (): void => {
		const openFile = this.app.workspace.getActiveFile();

		const rootEl = createDiv({cls: 'nav-folder mod-root'});
		const childrenEl = rootEl.createDiv({cls: 'nav-folder-children'});

		const frontMatterApi = getApiSafe(this.app);
		const frontMatterEnabled = frontMatterApi && frontMatterApi.getEnabledFeatures().contains('explorer');
		const frontMatterResolver = frontMatterEnabled
			? frontMatterApi.getResolverFactory()?.createResolver('explorer')
			: null;

		this.data.newFiles.forEach((currentFile) => {
			const navFile = childrenEl.createDiv({
				cls: 'tree-item nav-file newly-added-files-file',
			});
			const navFileTitle = navFile.createDiv({
				cls: 'tree-item-self is-clickable nav-file-title newly-added-files-title',
			});
			const navFileTitleContent = navFileTitle.createDiv({
				cls: 'tree-item-inner nav-file-title-content newly-added-files-title-content',
			});

			//Show File Extensions
			const title = frontMatterResolver
				? frontMatterResolver.resolve(currentFile.path) ??
				FileNameUtils.getDisplayName(currentFile, this.data.showExtension ?? false)
				: FileNameUtils.getDisplayName(currentFile, this.data.showExtension ?? false);
			navFileTitleContent.setText(title);

			if (openFile && currentFile.path === openFile.path) {
				navFileTitle.addClass('is-active');
			}

			navFileTitle.setAttr('draggable', 'true');
			navFileTitle.addEventListener('dragstart', (event: DragEvent) => {
				if (!currentFile?.path) return;

				const file = this.app.metadataCache.getFirstLinkpathDest(
					currentFile.path,
					'',
				);

				if (!file) {
					return;
				}

				const dragManager = (this.app as unknown as { dragManager: DragManagerInterface }).dragManager;
				const dragData = dragManager.dragFile(event, file);
				dragManager.onDragStart(event, dragData);
			});

			navFileTitle.addEventListener('mouseover', (event: MouseEvent) => {
				if (!currentFile?.path) return;

				this.app.workspace.trigger('hover-link', {
					event,
					source: NewFilesListViewType,
					hoverParent: rootEl,
					targetEl: navFile,
					linktext: currentFile.path,
				});
			});

			navFileTitle.addEventListener('contextmenu', (event: MouseEvent) => {
				if (!currentFile?.path) return;

				const menu = new Menu();
				menu.addItem((item) =>
					item
						.setSection('action')
						.setTitle('Open in new tab')
						.setIcon('file-plus')
						.onClick(() => {
							this.focusFile(currentFile, 'tab');
						})
				);
				const file = this.app.vault.getAbstractFileByPath(currentFile?.path);
				if (!file) {
					return;
				}

				this.app.workspace.trigger(
					'file-menu',
					menu,
					file,
					'link-context-menu',
				);
				menu.showAtPosition({x: event.clientX, y: event.clientY});
			});

			navFileTitle.addEventListener('click', (event: MouseEvent) => {
				if (!currentFile) return;

				const newLeaf = Keymap.isModEvent(event)
				// 添加条件运算符
				this.focusFile(currentFile, newLeaf ? 'tab' : false);
			});

			navFileTitleContent.addEventListener('mousedown', (event: MouseEvent) => {
				if (!currentFile) return;

				if (event.button === 1) {
					event.preventDefault();
					this.focusFile(currentFile, 'tab');
				}
			});

			const navFileDelete = navFileTitle.createDiv({
				cls: 'newly-added-files-file-delete menu-item-icon',
			});
			setIcon(navFileDelete, 'lucide-x');
			navFileDelete.addEventListener('click', async (event) => {
				event.stopPropagation();

				await this.removeFile(currentFile);
				this.redraw();
			});
		});

		this.contentEl.setChildrenInPlace([rootEl]);
	};

	private readonly removeFile = async (file: FilePath): Promise<void> => {
		this.data.newFiles = this.data.newFiles.filter(
			(currFile) => currFile.path !== file.path,
		);
		await this.plugin.pruneLength();
	};

	private readonly updateData = async (file: TFile): Promise<void> => {
		this.data.newFiles = this.data.newFiles.filter(
			(currFile) => currFile.path !== file.path,
		);

		this.data.newFiles.unshift({
			basename: file.basename,
			path: file.path,
		});

		//处理保存
		await this.plugin.pruneLength();
	};

	private readonly update = async (openedFile: TFile): Promise<void> => {

		await sleep(100);

		if (!openedFile || !this.plugin.shouldAddFile(openedFile)) {
			return;
		}

		await this.updateData(openedFile);
		this.redraw();
	};
	private readonly focusFile = (file: FilePath, newLeaf: boolean | PaneType): void => {
		const targetFile = this.app.vault
			.getFiles()
			.find((f) => f.path === file.path);

		if (targetFile) {
			const leaf = this.app.workspace.getLeaf(newLeaf);
			leaf.openFile(targetFile);
		} else {
			new Notice('Cannot find a file with that name');
			this.data.newFiles = this.data.newFiles.filter(
				(fp) => fp.path !== file.path,
			);
			this.plugin.saveData();
			this.redraw();
		}
	};
}

export default class NewFilesPlugin extends Plugin {
	public data: NewFilesData;
	public view: NewFilesListView;
	private isInitialized = false;

	public async onload(): Promise<void> {
		console.log('New Files: Loading plugin v' + this.manifest.version);

		await this.loadData();

		addIcon(ICON_NAME, ICON_SVG);

		this.registerView(
			NewFilesListViewType,
			(leaf) => (this.view = new NewFilesListView(leaf, this, this.data)),
		);

		this.addCommand({
			id: 'files-list',
			name: 'Open',
			callback: async () => {
				let leaf: WorkspaceLeaf | null;
				[leaf] = this.app.workspace.getLeavesOfType(
					NewFilesListViewType,
				);
				if (!leaf) {
					leaf = this.app.workspace.getLeftLeaf(false);
					await leaf?.setViewState({type: NewFilesListViewType});
				}

				if (leaf) {
					this.app.workspace.revealLeaf(leaf);
				}
			},
		});

		((this.app.workspace as unknown) as WorkspaceWithHoverSource).registerHoverLinkSource(
			NewFilesListViewType,
			{
				display: 'New Files',
				defaultMod: true,
			}
		);

		this.app.workspace.onLayoutReady(() => {
			// 标记初始化完成
			this.isInitialized = true;

			// 注册文件事件监听器
			this.registerFileEvents();
		});

		this.addSettingTab(new NewFilesSettingTab(this.app, this));
	}

	private registerFileEvents() {
		this.registerEvent(this.app.vault.on('rename', this.handleRename));
		this.registerEvent(this.app.vault.on('delete', this.handleDelete));
		//只监听文件创建事件，不再监听所有文件
		this.registerEvent(
			this.app.vault.on('create', (file) => {
				if (file instanceof TFile) {
					this.handleNewFile(file);
				}
			})
		);

		console.log('NewFilesPlugin: File event listeners registered');
	}

	public onunload(): void {

	}

	public async loadData(): Promise<void> {
		this.data = Object.assign(DEFAULT_DATA, await super.loadData());
	}

	public async saveData(): Promise<void> {
		await super.saveData(this.data);
	}

	public async onExternalSettingsChange(): Promise<void> {
		await this.loadData();
		this.view.redraw();
	}

	public readonly pruneOmittedFiles = async (): Promise<void> => {
		this.data.newFiles = this.data.newFiles.filter(this.shouldAddFile);
		await this.saveData();
	};

	public readonly pruneLength = async (): Promise<void> => {
		const toRemove =
			this.data.newFiles.length - (this.data.maxLength || defaultMaxLength);
		if (toRemove > 0) {
			this.data.newFiles.splice(
				this.data.newFiles.length - toRemove,
				toRemove,
			);
		}

		await this.saveData();
		this.view.redraw();
	};

	public readonly shouldAddFile = (file: FilePath): boolean => {
		if (!file || !file.path) {
			return false;
		}

		// Matches for ignored Paths
		const patterns: string[] = this.data.omittedPaths.filter(
			(path) => path.length > 0,
		);
		const fileMatchesRegex = (pattern: string): boolean => {
			try {
				return new RegExp(pattern).test(file.path);
			} catch (err) {
				console.error('New Files: Invalid regex pattern: ' + pattern);
				return false;
			}
		};

		if (patterns.some(fileMatchesRegex)) {
			return false
		}

		// Matches for ignored Tags
		const tfile = this.app.vault.getFileByPath(file.path)
		if (tfile) {
			const omittedTags: string[] = this.data.omittedTags.filter(
				(tag) => tag.length > 0,
			);

			// If there are no tags, the frontmatter.tags property is missing.
			const fileTags: string[] = this.app.metadataCache.getFileCache(tfile)?.frontmatter?.tags || [];
			const tagMatch = (tag: string): boolean => omittedTags.includes(tag);

			if (fileTags.some(tagMatch)) {
				return false;
			}
		}

		return true;
	};

	public onUserEnable(): void {
		// Open our view automatically only when the plugin is first enabled.
		this.app.workspace.ensureSideLeaf(NewFilesListViewType, 'left', {reveal: true})
	}

	private readonly handleRename = async (
		file: TAbstractFile,
		oldPath: string,
	): Promise<void> => {
		if (!this.isInitialized) {
			return;
		}

		const entry = this.data.newFiles.find(
			(newFile) => newFile.path === oldPath,
		);
		if (entry) {
			entry.path = file.path;
			entry.basename = FileNameUtils.trimExtension(file.name);
			this.view.redraw();
			await this.saveData();
		}
	};

	private readonly handleDelete = async (
		file: TAbstractFile,
	): Promise<void> => {
		if (!this.isInitialized) {
			return;
		}

		const beforeLen = this.data.newFiles.length;
		this.data.newFiles = this.data.newFiles.filter(
			(newFile) => newFile.path !== file.path,
		);

		if (beforeLen !== this.data.newFiles.length) {
			this.view.redraw();
			await this.saveData();
		}
	};

	private readonly handleNewFile = async (
		file: TAbstractFile
	): Promise<void> => {
		// 如果还没有初始化完成，直接返回
		if (!this.isInitialized) {
			return;
		}

		// 确保文件不在 newFiles 列表中，且不是打开的历史文件
		const existingEntry = this.data.newFiles.find(
			(newFile) => newFile.path === file.path
		);

		if (!existingEntry) {
			this.data.newFiles.unshift({
				path: file.path,
				basename: FileNameUtils.trimExtension(file.name),
			});

			await this.saveData();
			await this.pruneLength();
			this.view.redraw();
		}
	};

}

class NewFilesSettingTab extends PluginSettingTab {
	private readonly plugin: NewFilesPlugin;

	constructor(app: App, plugin: NewFilesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	public display(): void {
		const {containerEl} = this;
		containerEl.empty();

		const patternFragment = document.createDocumentFragment();
		const link = document.createElement('a');
		link.href =
			'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#writing_a_regular_expression_pattern';
		link.text = 'MDN - Regular expressions';
		patternFragment.append('RegExp patterns to ignore. One pattern per line. See ');
		patternFragment.append(link);
		patternFragment.append(' for help.');

		new Setting(containerEl)
			.setName('Omitted pathname patterns')
			.setDesc(patternFragment)
			.addTextArea((textArea) => {
				textArea.inputEl.setAttr('rows', 6);
				textArea
					.setPlaceholder('^daily/\n\\.png$\nfoobar.*baz')
					.setValue(this.plugin.data.omittedPaths.join('\n'));
				textArea.inputEl.onblur = (e: FocusEvent) => {
					const patterns = (e.target as HTMLInputElement).value;
					this.plugin.data.omittedPaths = patterns.split('\n');
					this.plugin.pruneOmittedFiles();
					this.plugin.view.redraw();
				};
			});


		const tagFragment = document.createDocumentFragment();
		tagFragment.append('Frontmatter tags patterns to ignore. One pattern' +
			' per line');

		new Setting(containerEl)
			.setName('Omitted frontmatter tags')
			.setDesc(tagFragment)
			.addTextArea((textArea) => {
				textArea.inputEl.setAttr('rows', 6);
				textArea
					.setPlaceholder('daily\nignore')
					.setValue(this.plugin.data.omittedTags.join('\n'));
				textArea.inputEl.onblur = (e: FocusEvent) => {
					const patterns = (e.target as HTMLInputElement).value;
					this.plugin.data.omittedTags = patterns.split('\n');
					this.plugin.pruneOmittedFiles();
					this.plugin.view.redraw();
				};
			});

		// ListLengthSetting组件
		new ListLengthSetting({
			containerEl,
			plugin: this.plugin,
			defaultMaxLength
		}).create();

		// 在其他设置后添加新的扩展名显示设置
		new ShowExtensionSetting({
			containerEl,
			plugin: this.plugin,
			defaultShowExtension: false
		}).create();

		const div = containerEl.createEl('div', {
			cls: 'newly-added-files-donation',
		});

	}
}






