import { FilePath } from '../types/FileTypes';

export class FileNameUtils {
	/**
	 * 获取显示用的文件名
	 * @param file 文件路径信息
	 * @param showExtension 是否显示扩展名
	 * @returns 处理后的显示文件名
	 */
	public static getDisplayName(file: FilePath, showExtension: boolean): string {
		if (!file) {
			return '';
		}

		if (showExtension) {
			// 如果启用了显示扩展名，返回完整文件名
			return file.path.split('/').pop() || file.basename;
		}

		return file.basename;
	}

	/**
	 * 从完整文件名中移除扩展名
	 * @param fileName 完整文件名
	 * @returns 不含扩展名的文件名
	 */
	public static trimExtension(fileName: string): string {
		if (!fileName) {
			return '';
		}
		return fileName.replace(/\.[^/.]+$/, '');
	}
}
