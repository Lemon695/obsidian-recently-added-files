type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const currentLevel: LogLevel = 'info';
const levelOrder: Record<LogLevel, number> = {
	debug: 10,
	info: 20,
	warn: 30,
	error: 40,
};

export interface ScopedLogger {
	debug(message: string, extra?: unknown): void;
	info(message: string, extra?: unknown): void;
	warn(message: string, extra?: unknown): void;
	error(message: string, extra?: unknown): void;
}

export function createScopedLogger(scope: string): ScopedLogger {
	return {
		debug: (message, extra) => log('debug', scope, message, extra),
		info: (message, extra) => log('info', scope, message, extra),
		warn: (message, extra) => log('warn', scope, message, extra),
		error: (message, extra) => log('error', scope, message, extra),
	};
}

export async function measureAsync<T>(
	logger: ScopedLogger,
	label: string,
	task: () => Promise<T>,
): Promise<T> {
	const start = performance.now();
	try {
		return await task();
	} finally {
		const durationMs = Math.round(performance.now() - start);
		logger.debug(`${label} took ${durationMs}ms`);
	}
}

function log(level: LogLevel, scope: string, message: string, extra?: unknown): void {
	if (levelOrder[level] < levelOrder[currentLevel]) {
		return;
	}
	const prefix = `[recently-added-files][${scope}] ${message}`;
	switch (level) {
		case 'debug':
			console.debug(prefix, extra ?? '');
			return;
		case 'info':
			console.debug(prefix, extra ?? '');
			return;
		case 'warn':
			console.warn(prefix, extra ?? '');
			return;
		case 'error':
			console.error(prefix, extra ?? '');
			return;
	}
}
