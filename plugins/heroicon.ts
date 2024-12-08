import fs from 'fs';
import path from 'path';
import chokidar from 'chokidar';
import type { Plugin } from 'vite';

export default function heroiconsPlugin(
	options: {
		input?: string;
		output?: string;
	} = {},
) {
	const dInput = 'node_modules/heroicons';
	const dOutput = 'src/lib/components/Icons/.heroicons';
	const input = options.input || path.resolve(__dirname, '..', dInput);
	const output = options.output || path.resolve(__dirname, '..', dOutput);

	/** 递归的获取所有svg文件的相对路径 */
	function getIcons(base: string) {
		const files = fs.readdirSync(base);
		const icons: [number, string, string, string][] = [];
		files.forEach((file) => {
			const filePath = path.join(base, file);
			if (fs.statSync(filePath).isDirectory()) {
				icons.push(...getIcons(filePath));
			} else if (path.extname(filePath) === '.svg') {
				const p = path.relative(input, filePath).split(path.sep);
				if (p.length !== 3 || isNaN(parseInt(p[0]))) console.warn(`Invalid file path: ${filePath}`);
				else icons.push([parseInt(p[0]), p[1], p[2].slice(0, -4), filePath]);
			}
		});
		return icons;
	}

	function toPascalCase(str: string) {
		return str
			.split('-')
			.map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
			.join('');
	}

	// 检测 Heroicons 目录并生成 JSON 文件
	function generateHeroiconsJson() {
		const icons = getIcons(input);

		const all_size = Array.from(new Set(icons.map(([size]) => size)));
		const all_style = Array.from(new Set(icons.map(([, style]) => style)));
		const all_name = Array.from(new Set(icons.map(([, , name]) => name)));

		fs.mkdirSync(output, { recursive: true });

		//.gitignore
		fs.writeFileSync(path.join(output, '.gitignore'), '*', 'utf-8');

		//index.ts
		const codes = [
			`export type HeroIconSize = ${all_size.join('|')}`,
			`export type HeroIconStyle = ${all_style.map((s) => `'${s}'`).join('|')}`,
			`export type HeroIconName = ${all_name.map((n) => `'${n}'`).join('|')}`,
			'export type HeroIconId = `hi${string}`',
			'export type HeroIcon = { id: HeroIconId, size: HeroIconSize, style: HeroIconStyle, name: HeroIconName, svg: string }',
		];
		fs.writeFileSync(path.join(output, 'index.ts'), codes.join('\n'), 'utf-8');

		//icons.ts
		icons.forEach(([size, style, name, file]) => {
			// 16/solid/archive-box.svg -> [16, "solid", "archive-box"]
			const iconName = `hi${toPascalCase(name)}${toPascalCase(style)}${size}`;
			const data = JSON.stringify(
				{ id: iconName, size, style, name, svg: fs.readFileSync(file, 'utf-8') },
				null,
				2,
			);
			const codes = [
				`import type { HeroIcon } from '.'`,
				`export const ${iconName}: HeroIcon = ${data}`,
				`export default ${iconName}`,
			];
			fs.writeFileSync(path.join(output, `${iconName}.ts`), codes.join('\n'), 'utf-8');
		});

		console.log(`${icons.length} Heroicons Typescript has been generated at ${output}`);
	}

	return {
		name: 'vite-plugin-heroicons',

		// 在构建启动时检查 Heroicons 是否有变化
		async config() {
			generateHeroiconsJson();
			return {
				resolve: {
					alias: {
						$heroicons: output,
					},
				},
			};
		},
		configureServer(server) {
			const watcher = chokidar.watch(input, {
				ignored: /^\./,
				persistent: true,
				usePolling: true,
			});

			watcher.on('change', (filePath) => {
				generateHeroiconsJson();
			});
			server.httpServer?.once('close', () => {
				watcher.close();
			});
		},
	} satisfies Plugin;
}
