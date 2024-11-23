import * as crypto from 'crypto';
import {TFile, Notice} from 'obsidian';

export class MD5Utils {
	static async generateMD5(app: any, file: TFile): Promise<string> {
		const fileContent = await app.vault.read(file);
		const md5Hash = crypto
			.createHash('md5')
			.update(fileContent)
			.digest('hex');
		return md5Hash;
	}
}

export class FileRenameUtils {
	static async renameWithMD5(app: any, file: TFile | null): Promise<void> {
		// 增加空值检查
		if (!file) {
			new Notice('Valid file not found.');
			return;
		}

		// 使用路径解析来处理文件重命名
		const filePath = file.path;
		const dirPath = filePath.substring(0, filePath.lastIndexOf('/'));
		const ext = file.extension;

		const md5Hash = await MD5Utils.generateMD5(app, file);
		const newName = `${md5Hash}_MD5.${ext}`;
		const newPath = `${dirPath}/${newName}`;

		try {
			await app.fileManager.renameFile(file, newPath);
			new Notice(`The file has been renamed to ${newName}`);
		} catch (error) {
			new Notice(`An error occurred while renaming the file: ${error}`);
		}
	}
}
