import type {I18nDict} from '../../locale';

interface RecentFilesRenameI18n {
	validFileNotFound: string;
	fileRenamedTo: (name: string) => string;
	renameError: (error: string) => string;
}

export const recentFilesRenameI18n: I18nDict<RecentFilesRenameI18n> = {
	zh: {
		validFileNotFound: '未找到有效文件。',
		fileRenamedTo: (name: string) => `文件已重命名为 ${name}`,
		renameError: (error: string) => `重命名文件时发生错误：${error}`,
	},
	en: {
		validFileNotFound: 'Valid file not found.',
		fileRenamedTo: (name: string) => `The file has been renamed to ${name}`,
		renameError: (error: string) => `An error occurred while renaming the file: ${error}`,
	},
};
