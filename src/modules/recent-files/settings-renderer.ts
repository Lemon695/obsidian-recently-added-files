import {Setting} from 'obsidian';
import type RecentlyAddedFilesPlugin from '../../main';
import {t} from '../../i18n/locale';
import {defaultMaxLength} from '../../constants';
import {recentFilesSettingsI18n} from '../../i18n/modules/recent-files/settings';
import {ListLengthSetting} from '../../setting/ListLengthSettingParams';
import {ShowExtensionSetting} from '../../setting/ShowExtensionSetting';
import {FileTypeFilterToggleSetting} from '../../setting/FileTypeFilterToggleSetting';
import {FileTypeFilterSetting} from '../../setting/FileTypeFilterSetting';
import {SortOrderSetting} from '../../setting/SortOrderSetting';

export function renderRecentFilesSettings(
	containerEl: HTMLElement,
	plugin: RecentlyAddedFilesPlugin,
): void {
	const i18n = t(recentFilesSettingsI18n);
	const patternFragment = document.createDocumentFragment();
	const link = document.createElement('a');
	link.href = 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#writing_a_regular_expression_pattern';
	link.text = 'MDN - Regular expressions';
	patternFragment.append(i18n.omittedPathsDescPrefix);
	patternFragment.append(link);
	patternFragment.append(i18n.omittedPathsDescSuffix);

	new Setting(containerEl)
		.setName(i18n.omittedPathsName)
		.setDesc(patternFragment)
		.addTextArea((textArea) => {
			textArea.inputEl.setAttr('rows', 6);
			textArea
				.setPlaceholder('^daily/\n\\.png$\nfoobar.*baz')
				.setValue(plugin.data.omittedPaths.join('\n'));
			textArea.inputEl.onblur = (e: FocusEvent) => {
				const patterns = (e.target as HTMLInputElement).value;
				plugin.data.omittedPaths = patterns.split('\n');
				void plugin.pruneOmittedFiles();
				plugin.view?.redraw();
			};
		});

	new Setting(containerEl)
		.setName(i18n.omittedTagsName)
		.setDesc(i18n.omittedTagsDesc)
		.addTextArea((textArea) => {
			textArea.inputEl.setAttr('rows', 6);
			textArea
				.setPlaceholder(i18n.omittedTagsPlaceholder)
				.setValue(plugin.data.omittedTags.join('\n'));
			textArea.inputEl.onblur = (e: FocusEvent) => {
				const patterns = (e.target as HTMLInputElement).value;
				plugin.data.omittedTags = patterns.split('\n');
				void plugin.pruneOmittedFiles();
				plugin.view?.redraw();
			};
		});

	new ListLengthSetting({
		containerEl,
		plugin,
		defaultMaxLength,
	}).create();

	new ShowExtensionSetting({
		containerEl,
		plugin,
		defaultShowExtension: false,
	}).create();

	new FileTypeFilterToggleSetting({
		containerEl,
		plugin,
	}).create();

	new FileTypeFilterSetting({
		containerEl,
		plugin,
	}).create();

	new SortOrderSetting({
		containerEl,
		plugin,
	}).create();

	new Setting(containerEl)
		.setName(i18n.listModeName)
		.setDesc(i18n.listModeDesc)
		.addDropdown((dropdown) => {
			dropdown
				.addOption('created', i18n.listModeCreated)
				.addOption('modified', i18n.listModeModified)
				.setValue(plugin.data.listMode)
				.onChange(async (value) => {
					plugin.data.listMode = value === 'modified' ? 'modified' : 'created';
					await plugin.saveData();
					plugin.view?.redraw();
				});
		});
}
