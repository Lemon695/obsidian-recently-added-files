import {Notice, Setting} from 'obsidian';
import NewFilesPlugin from '../main';
import {t} from "../i18n/locale";
import {recentFilesSettingsI18n} from '../i18n/modules/recent-files/settings';

export interface ListLengthSettingParams {
	containerEl: HTMLElement;
	plugin: NewFilesPlugin;
	defaultMaxLength: number;
}

export class ListLengthSetting {
	private readonly containerEl: HTMLElement;
	private readonly plugin: NewFilesPlugin;
	private readonly defaultMaxLength: number;

	constructor({containerEl, plugin, defaultMaxLength}: ListLengthSettingParams) {
		this.containerEl = containerEl;
		this.plugin = plugin;
		this.defaultMaxLength = defaultMaxLength;
	}

	public create(): void {
		const i18n = t(recentFilesSettingsI18n);
		new Setting(this.containerEl)
			.setName(i18n.listLengthName)
			.setDesc(i18n.listLengthDesc)
			.addText((text) => {
				// Set input type to number
				text.inputEl.setAttr('type', 'number');
				text.inputEl.setAttr('placeholder', this.defaultMaxLength.toString());

				// Set initial value
				text.setValue(this.plugin.data.maxLength?.toString() || '')
					.onChange((value) => this.handleChange(value));

				// Handle blur event
				text.inputEl.onblur = (event: FocusEvent) => {
					this.handleBlur(event);
				};
			});
	}

	private handleChange(value: string): void {
		const i18n = t(recentFilesSettingsI18n);
		const parsed = parseInt(value, 10);
		if (Number.isNaN(parsed) || parsed <= 0) {
			if (value.trim().length > 0) {
				new Notice(i18n.listLengthError);
			}
			return;
		}
		this.plugin.data.maxLength = parsed;
	}

	private handleBlur(e: FocusEvent): void {
		const target = e.target as HTMLInputElement;
		const parsed = parseInt(target.value, 10);

		if (!isNaN(parsed) && parsed > 0) {
			this.plugin.data.maxLength = parsed;
			void this.plugin.pruneLength();
			this.plugin.view?.redraw();
		}
	}
}
