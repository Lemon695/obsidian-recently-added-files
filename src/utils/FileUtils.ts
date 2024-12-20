import {FILE_EXTENSIONS} from "../constants";

type FileType = keyof typeof FILE_EXTENSIONS;

export class FileUtils {

	public static isFileType(extension: string | undefined, type: FileType): boolean {
		if (!extension) return false;

		const lowerExtension = extension.toLowerCase();

		return (FILE_EXTENSIONS[type] as readonly string[]).includes(lowerExtension);
	}
}

