import type { OpenAPIObject } from 'openapi3-ts/oas30';

export interface ApiParseCfg {
	allowExternalRef?: boolean;
}

export interface RefObject {
	$ref: string;
}

export function isRefObject(obj: any): obj is RefObject {
	return obj && typeof obj === 'object' && typeof obj.$ref === 'string';
}

/**
 * 用于检测循环引用的上下文
 */
interface ResolveContext {
	vi: Set<string>;
	path: string[];
}

/**
 * 解析OpenAPI文档中的$ref引用
 * @param doc OpenAPI文档对象
 * @param refPath $ref路径 (例如: "#/components/schemas/Pet")
 * @param cfg 配置选项
 * @param context 解析上下文
 * @returns 解析后的对象
 */
export function resolveRef(
	doc: OpenAPIObject,
	refPath: string,
	cfg: ApiParseCfg = {},
	context: ResolveContext = { vi: new Set(), path: [] },
): any {
	// 检查循环引用
	if (context.vi.has(refPath)) {
		const cycle = [...context.path, refPath].join(' -> ');
		throw new Error(`检测到循环引用: ${cycle}`);
	}

	// 记录当前引用路径
	context.vi.add(refPath);
	context.path.push(refPath);

	try {
		// 处理内部引用 (#/path/to/object)
		if (refPath.startsWith('#/')) {
			const paths = refPath.slice(2).split('/');
			let current: any = doc;

			for (const path of paths) {
				if (current === undefined) {
					throw new Error(`无法解析引用路径: ${refPath}`);
				}
				// 处理JSON指针中的转义字符
				const key = path.replace(/~1/g, '/').replace(/~0/g, '~');
				current = current[key];
			}

			return resolveRefs(doc, current, cfg, context);
		}

		// 处理外部引用
		if (!refPath.startsWith('#')) {
			if (cfg.allowExternalRef) {
				throw new Error('外部引用支持尚未实现');
			}
			{
				throw new Error(`不支持外部引用: ${refPath}`);
			}
		}

		throw new Error(`无效的引用路径: ${refPath}`);
	} finally {
		// 清理当前引用路径
		context.vi.delete(refPath);
		context.path.pop();
	}
}

/**
 * 递归解析对象中的所有$ref引用
 * @param doc OpenAPI文档对象
 * @param obj 需要解析的对象
 * @param cfg 配置选项
 * @param context 解析上下文
 * @returns 解析后的对象
 */
export function resolveRefs<T>(
	doc: OpenAPIObject,
	obj: T,
	cfg: ApiParseCfg = {},
	context: ResolveContext = { vi: new Set(), path: [] },
): T {
	if (!obj || typeof obj !== 'object') {
		return obj;
	}

	if (isRefObject(obj)) {
		return resolveRef(doc, obj.$ref, cfg, context);
	}

	if (Array.isArray(obj)) {
		return obj.map((item) => resolveRefs(doc, item, cfg, context)) as any;
	}

	const result: any = {};
	for (const [key, value] of Object.entries(obj)) {
		result[key] = resolveRefs(doc, value, cfg, context);
	}
	return result;
}

/**
 * 解析整个OpenAPI文档中的所有$ref引用
 * @param doc OpenAPI文档对象
 * @param cfg 配置选项
 * @returns 解析后的OpenAPI文档对象
 */
export function resolveOpenAPI(doc: OpenAPIObject, cfg: ApiParseCfg = {}): OpenAPIObject {
	return resolveRefs(doc, doc, cfg);
}

/**
 * 判断对象是否为非$ref引用对象
 * @param obj 待判断的对象
 * @returns 是否为非$ref引用对象
 */
export function notRef<T>(obj: T | RefObject): obj is T {
	return !isRefObject(obj);
}

/**
 * 移除对象中的$ref引用
 * @param obj 待移除$ref引用的对象
 * @returns 移除$ref引用后的对象
 */
export function remRef<T>(obj: T | RefObject): T | undefined {
	if (isRefObject(obj)) return undefined;
	return obj;
}
