import type {I18nDict} from '../../locale';

interface RecentFilesModuleI18n {
	coreName: string;
	coreDesc: string;
	filterName: string;
	filterDesc: string;
	previewName: string;
	previewDesc: string;
	renameName: string;
	renameDesc: string;
}

export const recentFilesModuleI18n: I18nDict<RecentFilesModuleI18n> = {
	zh: {
		coreName: '最近文件核心',
		coreDesc: '追踪新建文件，渲染侧边栏列表，并提供核心交互。',
		filterName: '筛选与排序',
		filterDesc: '启用文件类型筛选、排序模式与文件图标映射。',
		previewName: '悬停预览',
		previewDesc: '在悬停列表项时显示图片/PDF 预览。',
		renameName: '重命名动作',
		renameDesc: '启用右键哈希重命名动作。',
	},
	en: {
		coreName: 'Recent files core',
		coreDesc: 'Track new files, render the sidebar list, and provide core interactions.',
		filterName: 'Filter and sort',
		filterDesc: 'Enable file-type filtering, sort modes, and file-type icon mapping.',
		previewName: 'Hover preview',
		previewDesc: 'Show image/PDF previews when hovering list items.',
		renameName: 'Rename action',
		renameDesc: 'Enable the right-click hash rename action.',
	},
};
