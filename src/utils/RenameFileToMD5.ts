import {App, TFile, Notice} from 'obsidian';
import {t} from "../i18n/locale";
import {recentFilesRenameI18n} from '../i18n/modules/recent-files/rename';

export class FileHashUtils {
	static async generateHash(app: App, file: TFile): Promise<string> {
		const fileContent = await app.vault.readBinary(file);
		return digestToHex(fileContent);
	}
}

export class FileRenameUtils {
	static async renameWithHash(app: App, file: TFile | null): Promise<void> {
		const i18n = t(recentFilesRenameI18n);
		// 增加空值检查
		if (!file) {
			new Notice(i18n.validFileNotFound);
			return;
		}

		// 使用路径解析来处理文件重命名
		const filePath = file.path;
		const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
		const ext = file.extension;

		const hash = await FileHashUtils.generateHash(app, file);
		const newName = `${hash}_HASH.${ext}`;
		const newPath = `${dirPath}/${newName}`;

		try {
			await app.fileManager.renameFile(file, newPath);
			new Notice(i18n.fileRenamedTo(newName));
		} catch (error) {
			new Notice(i18n.renameError(String(error)));
		}
	}
}

async function digestToHex(content: ArrayBuffer): Promise<string> {
	const digest = await crypto.subtle.digest('SHA-256', content);
	const bytes = new Uint8Array(digest);
	return bytesToHex(bytes).slice(0, 32);
}

function bytesToHex(bytes: Uint8Array): string {
	return Array.from(bytes)
		.map((b) => b.toString(16).padStart(2, '0'))
		.join('');
}
