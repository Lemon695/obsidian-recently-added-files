# Recently Added Files

English | [中文](./README.zh-cn.md)

This plugin displays a list of most last added files in the sidebar. Optionally include paths of files which should be excluded from the list.

As with the file explorer view:
- New md files
- New images
- New PDF
- ......

## Screenshots

![sidebar-1](./resources/screenshots/sidebar-1.png)


# Function

This plugin can quickly display recently added files, making it easier to process these documents.
For example: After adding pictures, quickly find and rename them

## 1、Rename newly added files

During the document editing process, adding multiple images with the same name can lead to name duplication. To address this, an MD5 renaming feature has been added to quickly update the names of newly added images.

Before modification

![](./resources/screenshots/img-IUASUDF-98234723894-001.png)

After modification

![](./resources/screenshots/img-IUASUDF-98234723894-002.png)

## 2、File Classification Filter

This project introduces a **File Classification Filter** that enables users to filter and display newly added files based on their types. The supported categories for filtering include:

- **All files**: Displays all files regardless of their type.
- **Markdown**: Filters and shows only `.md` and `.markdown` files.
- **PDF**: Filters and shows only `.pdf` files.
- **Image**: Filters and shows image files, such as `.png`, `.jpg`, `.jpeg`, `.gif`, `.bmp`, `.svg`, and `.webp`.
- **Video**: Filters and shows video files, including `.mp4`, `.webm`, `.mov`, `.avi`, `.mkv`, and `.m4v`.
- **Other**: Displays all files that don't fall under the categories listed above.

This feature helps users quickly navigate through and manage their files based on type, improving efficiency in file handling.



Plugin configuration: By default, file filtering is disabled and can be enabled based on user needs.

![](./resources/screenshots/img-239742839-KASUHFUIAS-98123-AUSF.png)

![](./resources/screenshots/img-23947324-AISUFYASI-2923-AS-12312.png)








# 🙏 Acknowledgements

The core functionality of this project relies heavily on the incredible work done by the [recent-files-obsidian](https://github.com/tgrosinger/recent-files-obsidian) project. I am deeply grateful for its contributions.

While using Obsidian to edit documents, I frequently add numerous documents and images, making it difficult to locate newly added files for editing. I discovered the functionality of the **recent-files-obsidian** plugin, which displays recently opened or edited files, but it didn’t fully meet my needs. Therefore, I redesigned its functionality to support displaying only newly added files.
