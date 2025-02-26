import {FILE_EXTENSIONS} from "../constants";

type FileType = keyof typeof FILE_EXTENSIONS;

export class FileUtils {

	private static extensionTypeCache = new Map<string, Set<string>>();


	public static isFileType(extension: string | undefined, type: FileType): boolean {
		if (!extension) return false;

		const lowerExtension = extension.toLowerCase();

		if (!this.extensionTypeCache.has(type)) {
			this.extensionTypeCache.set(
				type,
				new Set(FILE_EXTENSIONS[type] as readonly string[])
			);
		}

		return this.extensionTypeCache.get(type)!.has(lowerExtension);
	}

	public static canPreview(extension: string | undefined): boolean {
		if (!extension) return false;

		// 只对图片和PDF提供预览
		return this.isFileType(extension, 'IMAGE') ||
			this.isFileType(extension, 'PDF');
	}
}

