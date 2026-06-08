import type {I18nDict} from '../../locale';

interface RecentFilesSettingsI18n {
	omittedPathsName: string;
	omittedPathsDescPrefix: string;
	omittedPathsDescSuffix: string;
	omittedTagsName: string;
	omittedTagsDesc: string;
	omittedTagsPlaceholder: string;
	listLengthName: string;
	listLengthDesc: string;
	listLengthError: string;
	showExtensionName: string;
	showExtensionDesc: string;
	enableFilterName: string;
	enableFilterDesc: string;
	defaultFilterName: string;
	defaultFilterDesc: string;
	sortOrderName: string;
	sortOrderDesc: string;
	allFiles: string;
	markdown: string;
	pdf: string;
	images: string;
	videos: string;
	canvas: string;
	otherFiles: string;
	sortNewest: string;
	sortOldest: string;
	sortAZ: string;
	sortZA: string;
	listModeName: string;
	listModeDesc: string;
	listModeCreated: string;
	listModeModified: string;
}

export const recentFilesSettingsI18n: I18nDict<RecentFilesSettingsI18n> = {
	zh: {
		omittedPathsName: '排除路径模式',
		omittedPathsDescPrefix: '要忽略的正则表达式模式。每行一个模式。参见 ',
		omittedPathsDescSuffix: ' 获取帮助。',
		omittedTagsName: '排除前置标签',
		omittedTagsDesc: '要忽略的前置标签模式。每行一个模式',
		omittedTagsPlaceholder: '每行一个标签',
		listLengthName: '列表长度',
		listLengthDesc: '列表中保留的最大文件名数量。',
		listLengthError: '列表长度必须是正整数',
		showExtensionName: '显示文件扩展名',
		showExtensionDesc: '启用此选项将在列表中显示文件扩展名',
		enableFilterName: '启用文件类型筛选',
		enableFilterDesc: '开启后可以按文件类型筛选显示最近文件',
		defaultFilterName: '默认文件类型筛选',
		defaultFilterDesc: '选择列表中默认筛选的文件类型',
		sortOrderName: '文件排序方式',
		sortOrderDesc: '选择列表中文件的排序方式',
		allFiles: '全部文件',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: '图片',
		videos: '视频',
		canvas: '画布',
		otherFiles: '其他文件',
		sortNewest: '最新优先',
		sortOldest: '最旧优先',
		sortAZ: '按名称 A-Z',
		sortZA: '按名称 Z-A',
		listModeName: '列表追踪模式',
		listModeDesc: '选择列表记录“新建文件”还是“最近修改文件”',
		listModeCreated: '新建文件',
		listModeModified: '最近修改',
	},
	en: {
		omittedPathsName: 'Omitted pathname patterns',
		omittedPathsDescPrefix: 'RegExp patterns to ignore. One pattern per line. See ',
		omittedPathsDescSuffix: ' for help.',
		omittedTagsName: 'Omitted frontmatter tags',
		omittedTagsDesc: 'Frontmatter tag patterns to ignore. One pattern per line',
		omittedTagsPlaceholder: 'One tag per line',
		listLengthName: 'List length',
		listLengthDesc: 'Maximum number of filenames to keep in the list.',
		listLengthError: 'List length must be a positive integer',
		showExtensionName: 'Show file extensions',
		showExtensionDesc: 'Enabling this option will display file extensions in the list',
		enableFilterName: 'Enable file type filter',
		enableFilterDesc: 'When enabled, you can filter and display recent files by file type.',
		defaultFilterName: 'Default file type filter',
		defaultFilterDesc: 'Select the default file type to filter in the list',
		sortOrderName: 'File sort order',
		sortOrderDesc: 'Choose how files are sorted in the list',
		allFiles: 'All files',
		markdown: 'Markdown',
		pdf: 'PDF',
		images: 'Images',
		videos: 'Videos',
		canvas: 'Canvas',
		otherFiles: 'Other files',
		sortNewest: 'Newest first',
		sortOldest: 'Oldest first',
		sortAZ: 'By name A-Z',
		sortZA: 'By name Z-A',
		listModeName: 'List tracking mode',
		listModeDesc: 'Choose whether list tracks created files or recently modified files',
		listModeCreated: 'Created files',
		listModeModified: 'Recently modified',
	},
};
