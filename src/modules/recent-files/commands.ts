import type RecentlyAddedFilesPlugin from '../../main';

export interface RecentFilesCommandDefinition {
	id: string;
	name: string;
	callback: () => Promise<void> | void;
}

export class RecentFilesCommandRegistry {
	constructor(private readonly plugin: RecentlyAddedFilesPlugin) {}

	register(command: RecentFilesCommandDefinition): void {
		this.plugin.addCommand({
			id: command.id,
			name: command.name,
			callback: () => {
				void command.callback();
			},
		});
	}

	registerMany(commands: RecentFilesCommandDefinition[]): void {
		commands.forEach((command) => this.register(command));
	}
}
