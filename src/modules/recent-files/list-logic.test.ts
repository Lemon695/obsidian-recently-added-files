import {describe, expect, it} from 'vitest';
import {DEFAULT_DATA} from '../../types/FileTypes';
import {applyPinning, filterFilesBySearch, resolveRenderWindow, sortAndFilterFiles} from './list-logic';

describe('recent-files list-logic', () => {
	const files = [
		{path: 'daily/2026-04-01.md', basename: '2026-04-01'},
		{path: 'projects/Alpha.md', basename: 'Alpha'},
		{path: 'assets/image.png', basename: 'image'},
	];

	it('applies search query in pipeline', () => {
		const result = sortAndFilterFiles(files, DEFAULT_DATA, {searchQuery: 'alpha'});
		expect(result).toEqual([{path: 'projects/Alpha.md', basename: 'Alpha'}]);
	});

	it('search matches basename and path, case-insensitive', () => {
		expect(filterFilesBySearch(files, 'DAILY')).toEqual([
			{path: 'daily/2026-04-01.md', basename: '2026-04-01'},
		]);
		expect(filterFilesBySearch(files, 'image')).toEqual([
			{path: 'assets/image.png', basename: 'image'},
		]);
	});

	it('supports render window slicing for virtual list preparation', () => {
		const result = resolveRenderWindow(files, {offset: 1, limit: 1});
		expect(result).toEqual([{path: 'projects/Alpha.md', basename: 'Alpha'}]);
	});

	it('moves pinned files to the front while preserving order', () => {
		const result = applyPinning(files, ['assets/image.png']);
		expect(result[0].path).toBe('assets/image.png');
	});
});
