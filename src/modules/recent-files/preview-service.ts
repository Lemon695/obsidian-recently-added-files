import {App, TFile} from 'obsidian';
import {FilePath} from '../../types/FileTypes';
import {FileUtils} from '../../utils/FileUtils';
import {t} from '../../i18n/locale';
import {recentFilesViewI18n} from '../../i18n/modules/recent-files/view';

export class FilePreviewService {
	private readonly i18n = t(recentFilesViewI18n);

	showNone(): void {
		document.querySelector('.newly-added-files-preview')?.remove();
	}

	async show(app: App, file: FilePath, event: MouseEvent): Promise<void> {
		this.showNone();

		const tfile = app.vault.getFileByPath(file.path);
		if (!tfile) return;

		const previewEl = document.createElement('div');
		previewEl.className = 'newly-added-files-preview';

		const rect = (event.target as HTMLElement).getBoundingClientRect();
		const PREVIEW_MAX_HEIGHT = 300;
		const PREVIEW_MAX_WIDTH = 300;
		const GAP = 10;
		const top = rect.bottom + GAP + PREVIEW_MAX_HEIGHT > window.innerHeight
			? Math.max(0, rect.top - PREVIEW_MAX_HEIGHT - GAP)
			: rect.bottom + GAP;
		const left = Math.min(rect.left, window.innerWidth - PREVIEW_MAX_WIDTH - GAP);
		previewEl.style.top = `${top}px`;
		previewEl.style.left = `${Math.max(0, left)}px`;

		const extension = file.path.split('.').pop()?.toLowerCase();
		if (FileUtils.isFileType(extension, 'IMAGE')) {
			await this.renderImagePreview(app, tfile, previewEl);
		} else if (FileUtils.isFileType(extension, 'PDF')) {
			previewEl.createDiv({
				cls: 'newly-added-files-preview-pdf',
				text: this.i18n.pdfPreview,
			});
		}

		document.body.appendChild(previewEl);
	}

	private async renderImagePreview(app: App, tfile: TFile, previewEl: HTMLElement): Promise<void> {
		try {
			const arrayBuffer = await app.vault.readBinary(tfile);
			const blob = new Blob([arrayBuffer]);
			const url = URL.createObjectURL(blob);

			const img = document.createElement('img');
			img.src = url;
			img.className = 'newly-added-files-preview-img';
			previewEl.appendChild(img);

			img.onload = () => URL.revokeObjectURL(url);
			img.onerror = () => {
				URL.revokeObjectURL(url);
			};
		} catch {
			return;
		}
	}
}
