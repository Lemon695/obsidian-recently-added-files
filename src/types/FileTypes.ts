export interface FilePath {
	path: string;
	basename: string;
}

export interface NewFilesData {
	newFiles: FilePath[];
	omittedPaths: string[];
	omittedTags: string[];
	maxLength?: number;
	showExtension?: boolean;
	activeFileType: string;
	enableFileTypeFilter: boolean; //配置项，是否开启筛选项
	sortOrder: 'newest' | 'oldest' | 'az' | 'za'; //排序选项
}

export const DEFAULT_DATA: NewFilesData = {
	newFiles: [],
	omittedPaths: [],
	omittedTags: [],
	maxLength: 100,
	showExtension: false,
	activeFileType: 'all',
	enableFileTypeFilter: false, //默认不开启筛选项
	sortOrder: 'newest', // 默认按最新时间排序
};
