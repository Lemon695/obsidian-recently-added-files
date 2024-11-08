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
}

export const DEFAULT_DATA: NewFilesData = {
	newFiles: [],
	omittedPaths: [],
	omittedTags: [],
	showExtension: false,
};
