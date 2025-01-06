import type { Plugin } from 'vite';
import fs from 'fs';
import path from 'path';
import { parse } from '@babel/parser';

const ROOT_DIR = process.cwd();
const ROUTES_DIR = path.join(ROOT_DIR, 'src', 'routes', 'api');

const OPENAPI_FILE = path.join(ROOT_DIR, 'src', 'routes', 'api', 'openAPI', 'paths.ts');
const CLIENT_FILE = path.join(ROOT_DIR, 'src', 'lib', 'apis.ts');

function isApiRoute(file: string) {
	if (!file.startsWith(ROUTES_DIR)) return false;
	const name = path.basename(file);
	return name === '+server.ts' || name === '+server.js';
}
const methods = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'] as const;
/**
 * API信息
 * `文件ID` - `方法名` - `代码`
 */
type ApiInfo = [
	string,
	(typeof methods)[number],
	{
		openapi?: [string, string];
	},
];
/**
 * 将服务器API文件转换为对应的客户端方法
 * @param apiClients 客户端方法列表
 * @param file 变动的服务器API文件
 * @param del 是否是删除文件
 */
async function handler(apiClients: ApiInfo[], file: string, del: boolean = false) {
	const ID = path.relative(ROUTES_DIR, path.dirname(file)).replace(/\\/g, '/');
	const codeID = ID.replace(/[\/\\+-\[\]= ]/g, '_');
	apiClients = apiClients.filter(([id]) => id !== ID);
	if (del) return apiClients;

	const serverCode = parse(await fs.promises.readFile(file, 'utf-8'), {
		sourceType: 'module',
		plugins: ['typescript'],
	});
	// fs.promises.writeFile(`${file}.ast.json`, JSON.stringify(serverCode.program.body), 'utf-8');

	const exporteds = serverCode.program.body.flatMap((node) => {
		if (
			node.type === 'ExportNamedDeclaration' &&
			node.declaration &&
			node.declaration.type === 'VariableDeclaration' &&
			node.declaration.kind === 'const'
		) {
			return node.declaration.declarations.map((decl) =>
				decl.id.type === 'Identifier' ? decl.id.name : null,
			);
		}
		return [];
	});
	const exportedMethods = exporteds.filter((name): name is (typeof methods)[number] =>
		name ? methods.includes(name as any) : false,
	);
	if (!exportedMethods.length) return apiClients;

	/** +server.ts文件导入路径 */
	const apiImport = `$lib/../routes/api/${path.relative(ROUTES_DIR, path.dirname(file)).replace(/\\/g, '/')}/+server`;
	for (const method of exportedMethods) {
		if (!exporteds.includes(`_${method}`)) continue;
		const apiInfo: ApiInfo = [
			ID,
			method,
			{
				openapi: [
					`import { _${method} as ${codeID}_${method} } from '${apiImport}';`,
					`addOpenAPI(${codeID}_${method}.openAPI(), ${JSON.stringify(ID)}, ${JSON.stringify(method)})`,
				],
			},
		];
		apiClients.push(apiInfo);
	}

	return apiClients;
}

async function apply(apiClients: ApiInfo[]) {
	apiClients.sort(([id1, m1], [id2, m2]) => id1.localeCompare(id2) || m1.localeCompare(m2));
	const generateOpenAPI = true;
	if (generateOpenAPI) {
		const openAPI = apiClients.map((api) => api[2].openapi).filter((v) => !!v);

		const code = [
			'// @prettier-ignore',
			'// @ts-nocheck',
			'/* prettier-ignore-start */',
			'/* eslint-disable */',
			'',
			openAPI.map((c) => c[0]).join('\n'),
			"import type { PathsObject, OperationObject } from 'openapi3-ts/oas30';",
			'',
			'export const paths: PathsObject = {};',
			'function addOpenAPI(api: OperationObject, path: string, method: string) {',
			"    api.operationId = `${path.replaceAll('/', '_')}_${method}`;",
			"	(paths[`/api/${path}`] || (paths[`/api/${path}`] = {}))[method.toLowerCase() as 'get'] = api;",
			'}',
			'',
			openAPI.map((c) => c[1]).join('\n'),
			'',
			'/* prettier-ignore-end */',
			'/* eslint-enable */',
			'',
		].join('\n');
		await fs.promises.writeFile(OPENAPI_FILE, code, 'utf-8');
	}
}

export function apiGenPlugin(): Plugin {
	let apiClients: ApiInfo[] = [];
	return {
		name: 'vite-plugin-svelte-api-gen',
		async options() {
			await fs.promises.mkdir(path.dirname(CLIENT_FILE), { recursive: true });
			const files = await fs.promises.readdir(ROUTES_DIR, { recursive: true });
			for (const file of files.map((file) => path.join(ROUTES_DIR, file))) {
				if (!isApiRoute(file)) continue;
				apiClients = await handler(apiClients, file);
			}
			await apply(apiClients);
		},
		async watchChange(id, { event }) {
			if (!isApiRoute(id)) return;
			apiClients = await handler(apiClients, id, event === 'delete');
			await apply(apiClients);
		},
	};
}
