import {describe, expect, it} from 'vitest';
import {FileNameUtils} from './FileNameUtils';

describe('FileNameUtils', () => {
	it('returns basename when showExtension is false', () => {
		const file = {
			path: 'assets/images/demo.png',
			basename: 'demo',
		};
		expect(FileNameUtils.getDisplayName(file, false)).toBe('demo');
	});

	it('returns full filename when showExtension is true', () => {
		const file = {
			path: 'notes/today.md',
			basename: 'today',
		};
		expect(FileNameUtils.getDisplayName(file, true)).toBe('today.md');
	});

	it('trimExtension removes only final extension segment', () => {
		expect(FileNameUtils.trimExtension('archive.tar.gz')).toBe('archive.tar');
		expect(FileNameUtils.trimExtension('note.md')).toBe('note');
		expect(FileNameUtils.trimExtension('README')).toBe('README');
		expect(FileNameUtils.trimExtension('')).toBe('');
	});
});
