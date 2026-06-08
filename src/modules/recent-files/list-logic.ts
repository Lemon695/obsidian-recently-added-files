import {FilePath, NewFilesData} from '../../types/FileTypes';
import {FILE_EXTENSIONS} from '../../constants';
import {FileUtils} from '../../utils/FileUtils';

export interface ListQueryOptions {
	searchQuery?: string;
}

export interface RenderWindowOptions {
	offset?: number;
	limit?: number;
}

export function sortAndFilterFiles(
	files: FilePath[],
	data: NewFilesData,
	options?: ListQueryOptions,
): FilePath[] {
	const filteredByType = filterFilesByType(files, data);
	const filtered = filterFilesBySearch(filteredByType, options?.searchQuery);

	const sorted = (() => {
	switch (data.sortOrder) {
		case 'newest':
			return filtered;
		case 'oldest':
			return filtered.slice().reverse();
		case 'az':
			return filtered
				.slice()
				.sort((a, b) => a.basename.toLowerCase().localeCompare(b.basename.toLowerCase()));
		case 'za':
			return filtered
				.slice()
				.sort((a, b) => b.basename.toLowerCase().localeCompare(a.basename.toLowerCase()));
		default:
			return filtered;
	}
	})();

	return applyPinning(sorted, data.pinnedPaths);
}

export function filterFilesByType(files: FilePath[], data: NewFilesData): FilePath[] {
	if (!data.enableFileTypeFilter || data.activeFileType === 'all') {
		return files;
	}

	const typeMap: Record<string, keyof typeof FILE_EXTENSIONS> = {
		md: 'MARKDOWN',
		pdf: 'PDF',
		image: 'IMAGE',
		video: 'VIDEO',
		canvas: 'CANVAS',
	};

	return files.filter((file) => {
		const extension = file.path.split('.').pop()?.toLowerCase();
		if (data.activeFileType === 'other') {
			return Object.values(typeMap).every(
				(type) => !FileUtils.isFileType(extension, type),
			);
		}
		const targetType = typeMap[data.activeFileType];
		return targetType ? FileUtils.isFileType(extension, targetType) : true;
	});
}

export function filterFilesBySearch(files: FilePath[], searchQuery: string | undefined): FilePath[] {
	const query = (searchQuery ?? '').trim().toLowerCase();
	if (!query) {
		return files;
	}

	return files.filter((file) => {
		const path = file.path.toLowerCase();
		const basename = file.basename.toLowerCase();
		return path.includes(query) || basename.includes(query);
	});
}

export function resolveRenderWindow(
	files: FilePath[],
	options?: RenderWindowOptions,
): FilePath[] {
	const offset = Math.max(0, options?.offset ?? 0);
	const limit = options?.limit;
	if (typeof limit !== 'number' || limit <= 0) {
		return files.slice(offset);
	}
	return files.slice(offset, offset + limit);
}

export function applyPinning(files: FilePath[], pinnedPaths: string[]): FilePath[] {
	if (pinnedPaths.length === 0) {
		return files;
	}
	const pinnedSet = new Set(pinnedPaths);
	const pinned = files.filter((file) => pinnedSet.has(file.path));
	const others = files.filter((file) => !pinnedSet.has(file.path));
	return [...pinned, ...others];
}

export function resolveFileIcon(extension: string | undefined): string {
	if (FileUtils.isFileType(extension, 'MARKDOWN')) return 'lucide-file-text';
	if (FileUtils.isFileType(extension, 'PDF')) return 'lucide-file-text';
	if (FileUtils.isFileType(extension, 'IMAGE')) return 'lucide-image';
	if (FileUtils.isFileType(extension, 'VIDEO')) return 'lucide-video';
	if (FileUtils.isFileType(extension, 'CANVAS')) return 'lucide-layout-dashboard';
	return 'lucide-file';
}

export function normalizeTags(rawTags: unknown): string[] {
	if (Array.isArray(rawTags)) {
		return rawTags.filter((tag): tag is string => typeof tag === 'string');
	}
	if (typeof rawTags === 'string') {
		return [rawTags];
	}
	return [];
}
