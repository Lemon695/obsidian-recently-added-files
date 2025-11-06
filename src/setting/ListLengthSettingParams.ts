import {App, Notice, Plugin, Setting} from 'obsidian';
import NewFilesPlugin from '../main';
import {t} from "../i18n/locale";

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
		new Setting(this.containerEl)
			.setName(t('settingListLength'))
			.setDesc(t('settingListLengthDesc'))
			.addText((text) => {
				// Set input type to number
				text.inputEl.setAttr('type', 'number');
				text.inputEl.setAttr('placeholder', this.defaultMaxLength.toString());

				// Set initial value
				text.setValue(this.plugin.data.maxLength?.toString() || '')
					.onChange(this.handleChange.bind(this));

				// Handle blur event
				text.inputEl.onblur = this.handleBlur.bind(this);
			});
	}

	private handleChange(value: string): void {
		const parsed = parseInt(value, 10);
		if (!Number.isNaN(parsed) && parsed <= 0) {
			new Notice(t('settingListLengthError'));
			return;
		}
		this.plugin.data.maxLength = parsed;
	}

	private handleBlur(e: FocusEvent): void {
		const target = e.target as HTMLInputElement;
		const parsed = parseInt(target.value, 10);

		if (!isNaN(parsed) && parsed > 0) {
			this.plugin.data.maxLength = parsed;
			this.plugin.pruneLength();
			this.plugin.view.redraw();
		}
	}
}
