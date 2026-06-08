import {App, TFile} from 'obsidian';
import {FilePath, NewFilesData} from '../../types/FileTypes';
import type {ListQueryOptions} from './list-logic';

export interface RecentFilesListAdapter {
	getVisibleFiles(files: FilePath[], data: NewFilesData, options?: ListQueryOptions): FilePath[];
	getIcon(extension: string | undefined): string;
}

export interface RecentFilesPreviewAdapter {
	show(app: App, file: FilePath, event: MouseEvent): Promise<void>;
	hide(): void;
}

export interface RecentFilesRenameAdapter {
	rename(app: App, file: TFile): Promise<void>;
}
