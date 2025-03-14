/**
 * 该文件用于从OpenAPI规范中提取参数的可能填充值
 * 包括默认值、示例值等，统一处理成FillValue类型
 */

import type {
	ParameterObject,
	SchemaObject,
	MediaTypeObject,
	ExampleObject,
} from 'openapi3-ts/oas30';
import {
	component_openapi_schemas_schema__default as m_default,
	component_openapi_schemas_schema__example_noname as m_example_noname,
	component_openapi_schemas_schema__fill_fake_all as m_fake_all,
	component_openapi_schemas_schema__fill_fake_required as m_fake_required,
} from '$lib/paraglide/messages';
import { JSONSchemaFaker } from 'json-schema-faker';

/** 填充值的数据结构 */
export type FillValue = {
	name: string;
	value: any;
	summary?: string;
	description?: string;
};

/** 创建单个填充值 */
const mkSingle = (data: FillValue[], name: string, value: any) => {
	data.push({
		name,
		value,
	});
};

/** 从ExampleObject创建填充值 */
const mkExampleObj = (data: FillValue[], name: string, obj: ExampleObject) => {
	if ('value' in obj)
		data.push({
			name,
			value: obj.value,
			summary: obj.summary,
			description: obj.description,
		});
};

const mkFakeAll = (schema: SchemaObject) => {
	JSONSchemaFaker.option({
		alwaysFakeOptionals: true,
		useExamplesValue: true,
		// useDefaultValue: true,
		sortProperties: true,
	});
	return JSONSchemaFaker.resolve(schema);
};
const mkFakeRequired = (schema: SchemaObject) => {
	JSONSchemaFaker.option({
		requiredOnly: true,
		useExamplesValue: true,
		// useDefaultValue: true,
		sortProperties: true,
	});
	return JSONSchemaFaker.resolve(schema);
};

/**
 * 创建两个可能的假数据
 * @param schema - OpenAPI schema对象
 * @returns 两个可能的假数据
 */
export function makeFakeValues(schema: SchemaObject | undefined): Promise<FillValue | undefined>[] {
	if (!schema) return [];
	return [
		mkFakeAll(schema)
			.then((value) => ({
				name: m_fake_all(),
				value,
			}))
			.catch(() => undefined),
		// mkFakeRequired(schema)
		// 	.then((value) => ({
		// 		name: m_fake_required(),
		// 		value,
		// 	}))
		// 	.catch(() => undefined),
	];
}

/**
 * 从OpenAPI参数定义中提取所有可能的填充值
 * @param param - OpenAPI参数对象
 * @param schema - 参数的schema定义
 * @param media - 媒体类型对象
 * @returns 填充值数组
 */
export function makeFillValues(
	param: Pick<ParameterObject, 'example' | 'examples'> | undefined,
	schema: SchemaObject | undefined,
	media: MediaTypeObject | undefined,
): FillValue[] {
	const data: FillValue[] = [];
	// 按优先级依次处理各种来源的填充值：
	if (schema && 'default' in schema) mkSingle(data, m_default(), schema.default); // schema中的默认值
	if (media && 'example' in media) mkSingle(data, m_example_noname(), media.example); // media中的示例
	if (media?.examples !== undefined)
		for (const name in media.examples) mkExampleObj(data, name, media.examples[name]); // media中的多个示例
	if (param && 'example' in param) mkSingle(data, m_example_noname(), param.example); // 参数中的示例
	if (param && 'examples' in param)
		for (const name in param.examples) mkExampleObj(data, name, param.examples[name]); // 参数中的多个示例
	if (schema && 'example' in schema) mkSingle(data, m_example_noname(), schema.example); // schema中的示例
	if (schema?.examples !== undefined)
		schema.examples.forEach((v) => mkSingle(data, m_example_noname(), v)); // schema中的多个示例

	return data;
}
