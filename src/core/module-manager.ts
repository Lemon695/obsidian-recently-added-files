import type RecentlyAddedFilesPlugin from '../main';
import type {PluginModule} from './types';
import {createScopedLogger, measureAsync} from './observability';

export class ModuleManager {
	private readonly registry: Map<string, PluginModule> = new Map();
	private readonly loaded: Set<string> = new Set();
	private readonly logger = createScopedLogger('module-manager');

	constructor(private readonly plugin: RecentlyAddedFilesPlugin) {}

	register(module: PluginModule): void {
		if (this.registry.has(module.id)) {
			throw new Error(`[recently-added-files] Module '${module.id}' is already registered.`);
		}
		this.registry.set(module.id, module);
	}

	async loadAll(): Promise<void> {
		for (const [id, module] of this.registry) {
			if (this.isEnabled(id)) {
				await this.loadModule(module);
			}
		}
	}

	unloadAll(): void {
		for (const id of [...this.loaded]) {
			this.unloadModule(id);
		}
	}

	async enableModule(id: string): Promise<void> {
		const module = this.registry.get(id);
		if (!module) return;

		this.plugin.settings.moduleEnabled[id] = true;
		await this.plugin.saveSettings();

		if (!this.loaded.has(id)) {
			await this.loadModule(module);
		}
	}

	async disableModule(id: string): Promise<void> {
		this.plugin.settings.moduleEnabled[id] = false;
		await this.plugin.saveSettings();
		this.unloadModule(id);
	}

	getAll(): PluginModule[] {
		return [...this.registry.values()];
	}

	get(id: string): PluginModule | undefined {
		return this.registry.get(id);
	}

	isEnabled(id: string): boolean {
		return this.plugin.settings.moduleEnabled[id] !== false;
	}

	private async loadModule(module: PluginModule): Promise<void> {
		try {
			await measureAsync(this.logger, `load module '${module.id}'`, async () => {
				await module.onload();
			});
			this.loaded.add(module.id);
		} catch (error) {
			this.logger.error(`Failed to load module '${module.id}'`, error);
		}
	}

	private unloadModule(id: string): void {
		const module = this.registry.get(id);
		if (!module || !this.loaded.has(id)) return;

		try {
			module.onunload();
			this.loaded.delete(id);
		} catch (error) {
			this.logger.error(`Failed to unload module '${id}'`, error);
		}
	}
}
