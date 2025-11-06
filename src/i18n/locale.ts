export const translations = {
	'en-GB': {
		previewError: 'Preview failed',
		pdfPreview: 'PDF Preview',
		searchPlaceholder: 'Search files...',
		clearList: 'Clear list',
		openInNewTab: 'Open in new tab',
		renameWithMD5: 'Rename with MD5',
		fileRenamed: 'File renamed successfully',
		fileNotFound: 'File not found',
		renameFailed: 'Failed to rename file'
	},
	'zh': {
		previewError: '预览失败',
		pdfPreview: 'PDF 预览',
		searchPlaceholder: '搜索文件...',
		clearList: '清空列表',
		openInNewTab: '在新标签页打开',
		renameWithMD5: '用MD5重命名',
		fileRenamed: '文件重命名成功',
		fileNotFound: '文件未找到',
		renameFailed: '重命名文件失败'
	}
};

type Locale = keyof typeof translations;

export function getLocale(): Locale {
	const lang = window.localStorage.getItem('language') || 'en-GB';
	return (lang in translations ? lang : 'en-GB') as Locale;
}

export function t(key: keyof typeof translations["en-GB"]): string {
	const locale = getLocale();
	return translations[locale][key] || translations["en-GB"][key];
}
