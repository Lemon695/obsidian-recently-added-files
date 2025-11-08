import obsidianmd from "eslint-plugin-obsidianmd";
import tseslint from "typescript-eslint";
import globals from "globals";

export default tseslint.config(
	// 忽略构建产物和依赖
	{
		ignores: ["node_modules/**", "dist/**", "build/**", "main.js"],
	},

	{
		files: ["**/*.ts", "**/*.tsx"],
		languageOptions: {
			parser: tseslint.parser,
			parserOptions: {
				project: "./tsconfig.json",
			},
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},

	...tseslint.configs.recommended,

	...obsidianmd.configs.recommended,
);
