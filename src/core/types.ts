import type {FilePath, NewFilesData} from '../types/FileTypes';
import {DEFAULT_DATA} from '../types/FileTypes';

export interface PluginModule {
	readonly id: string;
	readonly name: string;
	readonly description: string;
	onload(): Promise<void> | void;
	onunload(): void;
	renderSettings?(containerEl: HTMLElement): void;
}

export interface PluginSettings {
	schemaVersion: number;
	moduleEnabled: Record<string, boolean>;
	recentFiles: NewFilesData;
}

export const CURRENT_SETTINGS_SCHEMA = 2;

export const DEFAULT_SETTINGS: PluginSettings = {
	schemaVersion: CURRENT_SETTINGS_SCHEMA,
	moduleEnabled: {
		'recent-files-core': true,
		'recent-files-filter': true,
		'recent-files-preview': true,
		'recent-files-rename': true,
	},
	recentFiles: {
		...DEFAULT_DATA,
	},
};

export function normalizeSettings(data: unknown): PluginSettings {
	if (!data || typeof data !== 'object') {
		return structuredCloneSafe(DEFAULT_SETTINGS);
	}

	const migratedData = migrateSettings(data);
	const raw = migratedData as Partial<PluginSettings> & Partial<NewFilesData>;
	const hasLegacyShape =
		Array.isArray(raw.newFiles) ||
		Array.isArray(raw.omittedPaths) ||
		Array.isArray(raw.omittedTags);

	const recentFiles = hasLegacyShape
		? normalizeRecentFiles(raw as Partial<NewFilesData>)
		: normalizeRecentFiles(raw.recentFiles);

	const rawModuleEnabled = raw.moduleEnabled ?? {};
	const legacyRecentFilesEnabled = rawModuleEnabled['recent-files'];
	const moduleEnabled = {
		...DEFAULT_SETTINGS.moduleEnabled,
		...rawModuleEnabled,
	};
	if (typeof legacyRecentFilesEnabled === 'boolean') {
		moduleEnabled['recent-files-core'] = legacyRecentFilesEnabled;
		moduleEnabled['recent-files-filter'] = legacyRecentFilesEnabled;
		moduleEnabled['recent-files-preview'] = legacyRecentFilesEnabled;
		moduleEnabled['recent-files-rename'] = legacyRecentFilesEnabled;
	}

	return {
		schemaVersion: CURRENT_SETTINGS_SCHEMA,
		moduleEnabled: {
			...moduleEnabled,
		},
		recentFiles,
	};
}

export function needsSettingsPersistence(data: unknown): boolean {
	if (!data || typeof data !== 'object') {
		return false;
	}
	const schemaVersion = toSchemaVersion((data as Record<string, unknown>).schemaVersion);
	return schemaVersion !== CURRENT_SETTINGS_SCHEMA;
}

function normalizeRecentFiles(data: Partial<NewFilesData> | undefined): NewFilesData {
	return {
		...DEFAULT_DATA,
		...omitUndefined(data ?? {}),
	};
}

function migrateSettings(data: unknown): Record<string, unknown> {
	if (!data || typeof data !== 'object') {
		return {};
	}

	const raw = {...(data as Record<string, unknown>)};
	const schemaVersion = toSchemaVersion(raw.schemaVersion) ?? 1;

	if (schemaVersion < 2) {
		if (!isRecord(raw.recentFiles)) {
			raw.recentFiles = extractLegacyRecentFiles(raw);
		}
		raw.schemaVersion = 2;
	}

	raw.schemaVersion = CURRENT_SETTINGS_SCHEMA;
	return raw;
}

function extractLegacyRecentFiles(raw: Record<string, unknown>): Partial<NewFilesData> {
	return {
		newFiles: toFilePathArray(raw.newFiles),
		pinnedPaths: toStringArray(raw.pinnedPaths),
		omittedPaths: toStringArray(raw.omittedPaths),
		omittedTags: toStringArray(raw.omittedTags),
		maxLength: toOptionalNumber(raw.maxLength),
		showExtension: toOptionalBoolean(raw.showExtension),
		activeFileType: toOptionalString(raw.activeFileType),
		enableFileTypeFilter: toOptionalBoolean(raw.enableFileTypeFilter),
		sortOrder: toSortOrder(raw.sortOrder),
		listMode: toListMode(raw.listMode),
	};
}

function toFilePathArray(value: unknown): FilePath[] {
	if (!Array.isArray(value)) return [];
	return value
		.filter(isRecord)
		.map((item) => ({
			path: toOptionalString(item.path) ?? '',
			basename: toOptionalString(item.basename) ?? '',
		}))
		.filter((item) => item.path.length > 0);
}

function toStringArray(value: unknown): string[] {
	if (!Array.isArray(value)) return [];
	return value.filter((item): item is string => typeof item === 'string');
}

function toOptionalString(value: unknown): string | undefined {
	return typeof value === 'string' ? value : undefined;
}

function toOptionalBoolean(value: unknown): boolean | undefined {
	return typeof value === 'boolean' ? value : undefined;
}

function toOptionalNumber(value: unknown): number | undefined {
	return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function toSchemaVersion(value: unknown): number | undefined {
	if (typeof value !== 'number' || !Number.isFinite(value)) {
		return undefined;
	}
	return Math.floor(value);
}

function toSortOrder(
	value: unknown,
): NewFilesData['sortOrder'] | undefined {
	return value === 'newest' || value === 'oldest' || value === 'az' || value === 'za'
		? value
		: undefined;
}

function toListMode(value: unknown): NewFilesData['listMode'] | undefined {
	return value === 'created' || value === 'modified' ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return !!value && typeof value === 'object' && !Array.isArray(value);
}

function omitUndefined<T extends Record<string, unknown>>(value: T): Partial<T> {
	return Object.fromEntries(
		Object.entries(value).filter(([, entryValue]) => entryValue !== undefined),
	) as Partial<T>;
}

function structuredCloneSafe<T>(value: T): T {
	return JSON.parse(JSON.stringify(value)) as T;
}
