import type {I18nDict} from '../../locale';

interface RecentFilesViewI18n {
	viewTitle: string;
	viewTitleModified: string;
	commandOpen: string;
	clearList: string;
	close: string;
	openInNewTab: string;
	renameWithHash: string;
	pinFile: string;
	unpinFile: string;
	fileRenamed: string;
	fileNotFound: string;
	cannotFindFile: string;
	searchPlaceholder: string;
	searchAriaLabel: string;
	filterLabel: string;
	filterAriaLabel: string;
	allFiles: string;
	markdown: string;
	pdf: string;
	images: string;
	videos: string;
	canvas: string;
	otherFiles: string;
	pdfPreview: string;
}

export const recentFilesViewI18n: I18nDict<RecentFilesViewI18n> = {
	zh: {
		viewTitle: '最近添加的文件',
		viewTitleModified: '最近修改的文件',
		commandOpen: '打开',
		clearList: '清空列表',
		close: '关闭',
		openInNewTab: '在新标签页打开',
		renameWithHash: '用哈希重命名',
		pinFile: '置顶',
		unpinFile: '取消置顶',
		fileRenamed: '文件重命名成功',
		fileNotFound: '文件未找到',
		cannotFindFile: '找不到该名称的文件',
		searchPlaceholder: '搜索文件...',
		searchAriaLabel: '搜索文件',
		filterLabel: '筛选:',
		filterAriaLabel: '按文件类型筛选',
		allFiles: '全部文件',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: '图片',
		videos: '视频',
		canvas: '画布',
		otherFiles: '其他文件',
		pdfPreview: 'PDF 预览',
	},
	en: {
		viewTitle: 'Recently added files',
		viewTitleModified: 'Recently modified files',
		commandOpen: 'Open',
		clearList: 'Clear list',
		close: 'Close',
		openInNewTab: 'Open in new tab',
		renameWithHash: 'Rename with hash',
		pinFile: 'Pin',
		unpinFile: 'Unpin',
		fileRenamed: 'File renamed successfully',
		fileNotFound: 'File not found',
		cannotFindFile: 'Cannot find a file with that name',
		searchPlaceholder: 'Search files...',
		searchAriaLabel: 'Search files',
		filterLabel: 'Filter:',
		filterAriaLabel: 'Filter by file type',
		allFiles: 'All files',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: 'Images',
		videos: 'Videos',
		canvas: 'Canvas',
		otherFiles: 'Other files',
		pdfPreview: 'PDF preview',
	},
};
