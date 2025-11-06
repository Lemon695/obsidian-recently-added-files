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
		renameFailed: 'Failed to rename file',
		// MD5 重命名相关
		validFileNotFound: 'Valid file not found.',
		fileRenamedTo: 'The file has been renamed to {name}',
		renameError: 'An error occurred while renaming the file: {error}',
		// 视图相关
		viewTitle: 'Recently Added Files',
		close: 'Close',
		commandOpen: 'Open',
		cannotFindFile: 'Cannot find a file with that name',
		// 筛选相关
		filterLabel: 'Filter:',
		allFiles: 'All files',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: 'Images',
		videos: 'Videos',
		canvas: 'Canvas',
		otherFiles: 'Other Files',
		// 设置相关
		settingOmittedPaths: 'Omitted pathname patterns',
		settingOmittedPathsDesc: 'RegExp patterns to ignore. One pattern per line. See ',
		settingOmittedPathsLink: ' for help.',
		settingOmittedTags: 'Omitted frontmatter tags',
		settingOmittedTagsDesc: 'Frontmatter tags patterns to ignore. One pattern per line',
		settingListLength: 'List length',
		settingListLengthDesc: 'Maximum number of filenames to keep in the list.',
		settingListLengthError: 'List length must be a positive integer',
		settingShowExtension: 'Show File Extensions',
		settingShowExtensionDesc: 'Enabling this option will display file extensions in the list',
		settingEnableFilter: 'Enable File Type Filter',
		settingEnableFilterDesc: 'When enabled, you can filter and display recent files by file type.',
		settingDefaultFilter: 'Default file type filter',
		settingDefaultFilterDesc: 'Select the default file type to filter in the list',
		settingSortOrder: 'File Sort Order',
		settingSortOrderDesc: 'Choose how files are sorted in the list',
		sortNewest: 'Newest first',
		sortOldest: 'Oldest first',
		sortAZ: 'By name A-Z',
		sortZA: 'By name Z-A'
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
		renameFailed: '重命名文件失败',
		// MD5 重命名相关
		validFileNotFound: '未找到有效文件。',
		fileRenamedTo: '文件已重命名为 {name}',
		renameError: '重命名文件时发生错误：{error}',
		// 视图相关
		viewTitle: '最近添加的文件',
		close: '关闭',
		commandOpen: '打开',
		cannotFindFile: '找不到该名称的文件',
		// 筛选相关
		filterLabel: '筛选:',
		allFiles: '全部文件',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: '图片',
		videos: '视频',
		canvas: '画布',
		otherFiles: '其他文件',
		// 设置相关
		settingOmittedPaths: '排除路径模式',
		settingOmittedPathsDesc: '要忽略的正则表达式模式。每行一个模式。参见 ',
		settingOmittedPathsLink: ' 获取帮助。',
		settingOmittedTags: '排除前置标签',
		settingOmittedTagsDesc: '要忽略的前置标签模式。每行一个模式',
		settingListLength: '列表长度',
		settingListLengthDesc: '列表中保留的最大文件名数量。',
		settingListLengthError: '列表长度必须是正整数',
		settingShowExtension: '显示文件扩展名',
		settingShowExtensionDesc: '启用此选项将在列表中显示文件扩展名',
		settingEnableFilter: '启用文件类型筛选',
		settingEnableFilterDesc: '开启后可以按文件类型筛选显示最近文件',
		settingDefaultFilter: '默认文件类型筛选',
		settingDefaultFilterDesc: '选择列表中默认筛选的文件类型',
		settingSortOrder: '文件排序方式',
		settingSortOrderDesc: '选择列表中文件的排序方式',
		sortNewest: '最新优先',
		sortOldest: '最旧优先',
		sortAZ: '按名称 A-Z',
		sortZA: '按名称 Z-A'
	}
};

type Locale = keyof typeof translations;

export function getLocale(): Locale {
	const lang = window.localStorage.getItem('language') || 'en-GB';
	return (lang in translations ? lang : 'en-GB') as Locale;
}

export function t(key: keyof typeof translations["en-GB"], params?: Record<string, string>): string {
	const locale = getLocale();
	let text = translations[locale][key] || translations["en-GB"][key];
	// 替换占位符
	if (params) {
		Object.keys(params).forEach(paramKey => {
			text = text.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), params[paramKey]);
		});
	}
	return text;
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
