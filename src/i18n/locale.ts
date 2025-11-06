export const translations = {
	en: {
		previewError: 'Preview failed',
		pdfPreview: 'PDF Preview',
		searchPlaceholder: 'Search files...',
		clearList: 'Clear list',
		close: 'Close',
		openInNewTab: 'Open in new tab',
		renameWithMD5: 'Rename with MD5',
		fileRenamed: 'File renamed successfully',
		fileNotFound: 'File not found',
		renameFailed: 'Failed to rename file',
		cannotFindFile: 'Cannot find a file with that name',
		filterLabel: 'Filter:',
		allFiles: 'All files',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: 'Images',
		videos: 'Videos',
		canvas: 'Canvas',
		otherFiles: 'Other Files'
	},
	zh: {
		previewError: '预览失败',
		pdfPreview: 'PDF 预览',
		searchPlaceholder: '搜索文件...',
		clearList: '清空列表',
		close: '关闭',
		openInNewTab: '在新标签页打开',
		renameWithMD5: '用MD5重命名',
		fileRenamed: '文件重命名成功',
		fileNotFound: '文件未找到',
		renameFailed: '重命名文件失败',
		cannotFindFile: '找不到该文件',
		filterLabel: '筛选：',
		allFiles: '所有文件',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: '图片',
		videos: '视频',
		canvas: 'Canvas',
		otherFiles: '其他文件'
	}
};

type Locale = keyof typeof translations;

export function getLocale(): Locale {
	const lang = window.localStorage.getItem('language') || 'en-GB';
	return (lang in translations ? lang : 'en-GB') as Locale;
}

export function t(key: keyof typeof translations["en"]): string {
	const locale = getLocale();
	return translations[locale][key] || translations["en"][key];
}

/**
 * 调试函数：打印当前语言设置
 */
export function debugLocale(): void {
	console.log('=== Locale Debug Info ===');
	console.log('Current locale:', getLocale());
	console.log('localStorage language:', window.localStorage.getItem('language'));
	console.log('navigator.language:', navigator.language);
	console.log('moment locale:', (window as any).moment?.locale());
	console.log('========================');
}
