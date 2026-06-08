import {describe, expect, it} from 'vitest';
import {FileUtils} from './FileUtils';

describe('FileUtils', () => {
	it('recognizes file types case-insensitively', () => {
		expect(FileUtils.isFileType('PNG', 'IMAGE')).toBe(true);
		expect(FileUtils.isFileType('Md', 'MARKDOWN')).toBe(true);
		expect(FileUtils.isFileType('mkv', 'VIDEO')).toBe(true);
	});

	it('returns false for unknown or empty extension', () => {
		expect(FileUtils.isFileType('zip', 'IMAGE')).toBe(false);
		expect(FileUtils.isFileType(undefined, 'PDF')).toBe(false);
	});

	it('canPreview supports only image and pdf', () => {
		expect(FileUtils.canPreview('png')).toBe(true);
		expect(FileUtils.canPreview('pdf')).toBe(true);
		expect(FileUtils.canPreview('md')).toBe(false);
		expect(FileUtils.canPreview(undefined)).toBe(false);
	});
});
