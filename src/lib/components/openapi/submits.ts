import type { OperationObject, ParameterObject } from 'openapi3-ts/oas30';
import { writable } from 'svelte/store';

/** 请求数据 */
type ReqData = {
	url: string;
	method: string;
	headers: [string, string][];
	body?: string;
};

/** 代码生成类型 */
export const codeGenTypes = ['JavaScript', 'Java', 'Python', 'Go', 'cURL'] as const;
/** 代码生成类型 */
export type CodeGenType = (typeof codeGenTypes)[number];

/**
 * 生成js的fetch代码
 * @param data 请求数据
 */
function makeJsCode({ url, method, headers, body }: ReqData) {
	const codes = [`fetch(${JSON.stringify(url)},{`, `\tmethod:'${method}',`];
	if (headers.length) {
		codes.push(`\theaders:{`);
		headers.forEach(([k, v]) => {
			codes.push(`\t\t${JSON.stringify(k)}:${JSON.stringify(v)},`);
		});
		codes.push(`\t},`);
	}
	if (body) {
		codes.push(`\tbody:${JSON.stringify(body)},`);
	}
	codes.push('})');
	return codes.join('\n');
}

/**
 * 生成java的代码
 * @param data 请求数据
 */
function makeJavaCode({ url, method, headers, body }: ReqData) {
	const codes = [
		'import java.io.InputStream;',
		'import java.io.OutputStream;',
		'import java.net.HttpURLConnection;',
		'import java.net.URL;',
		'',
		'public class HttpRequest {',
		'\tpublic static void main(String[] args) throws Exception {',
		'\t\t// 创建URL对象',
		`\t\tURL url = new URL(${JSON.stringify(url)});`,
		`\t\tHttpURLConnection con = (HttpURLConnection) url.openConnection();`,
		`\t\tcon.setRequestMethod("${method}");`,
	];
	if (headers.length) {
		codes.push('\t\t// 设置请求头');
		headers.forEach(([k, v]) => {
			codes.push(`\t\tcon.setRequestProperty(${JSON.stringify(k)}, ${JSON.stringify(v)});`);
		});
	}
	if (body) {
		codes.push(
			'\t\t// 设置请求体',
			`\t\tString body = ${JSON.stringify(body)};`,
			`\t\tcon.setDoOutput(true);`,
			`\t\ttry (OutputStream os = con.getOutputStream()) {`,
			`\t\t\tbyte[] input = body.getBytes("utf-8");`,
			`\t\t\tos.write(input, 0, input.length);`,
			`\t\t}`,
		);
	}

	codes.push(
		'\t\t// 获取响应码',
		'\t\tint responseCode = con.getResponseCode();',
		'\t\tSystem.out.println("Response: " + responseCode);',
		'\t\t// 获取响应体',
		'\t\tInputStream in = con.getInputStream();',
		'\t\tString response = new String(in.readAllBytes(), "UTF-8");',
		'\t\tSystem.out.println(response);',
		'\t\tcon.disconnect();',
		'\t}',
		'}',
	);

	return codes.join('\n');
}

/**
 * 生成python的代码
 * @param data 请求数据
 */
function makePythonCode({ url, method, headers, body }: ReqData) {
	const codes = ['import requests', ''];
	if (headers.length) {
		codes.push('headers = {');
		headers.forEach(([k, v]) => {
			codes.push(`\t${JSON.stringify(k)}:${JSON.stringify(v)},`);
		});
		codes.push('}');
	}
	if (body) {
		codes.push(`body = ${JSON.stringify(body)}`);
	}
	codes.push(
		'',
		`response = requests.request(${JSON.stringify(method)}, ${JSON.stringify(url)}${headers.length ? ', headers=headers' : ''}${body ? ', data=body' : ''})`,
		'print("response code:", response.status_code)',
		'print("response body:", response.text)',
	);

	return codes.join('\n');
}

/**
 * 生成go的代码
 * @param data 请求数据
 */
function makeGoCode({ url, method, headers, body }: ReqData) {
	const codes = [
		'package main',
		'',
		'import (',
		'\t"fmt"',
		'\t"io"',
		'\t"net/http"',
		'\t"strings"',
		')',
		'',
		'func main() {',
		'\t// 创建请求体',
	];

	if (body) {
		codes.push(`\tbodyStr := ${JSON.stringify(body)}`);
		codes.push('\tbody := strings.NewReader(bodyStr)');
		codes.push(`\treq, err := http.NewRequest("${method}", ${JSON.stringify(url)}, body)`);
	} else {
		codes.push(`\treq, err := http.NewRequest("${method}", ${JSON.stringify(url)}, nil)`);
	}

	codes.push('\tif err != nil {', '\t\tpanic(err)', '\t}');

	if (headers.length) {
		codes.push('\t// 设置请求头');
		headers.forEach(([k, v]) => {
			codes.push(`\treq.Header.Set(${JSON.stringify(k)}, ${JSON.stringify(v)})`);
		});
	}

	codes.push(
		'\t// 发送请求',
		'\tclient := &http.Client{}',
		'\tresp, err := client.Do(req)',
		'\tif err != nil {',
		'\t\tpanic(err)',
		'\t}',
		'\tdefer resp.Body.Close()',
		'',
		'\t// 读取响应',
		'\tfmt.Println("Response Status:", resp.Status)',
		'\tbody, err := io.ReadAll(resp.Body)',
		'\tif err != nil {',
		'\t\tpanic(err)',
		'\t}',
		'\tfmt.Println("Response Body:", string(body))',
		'}',
	);

	return codes.join('\n');
}

/**
 * 生成cURL的代码
 * @param data 请求数据
 */
function makeCurlCode({ url, method, headers, body }: ReqData) {
	const codes = [`curl -X ${method} ${url}`];
	if (headers.length) {
		headers.forEach(([k, v]) => {
			codes.push(`\\\n\t-H ${JSON.stringify(k)}:${JSON.stringify(v)}`);
		});
	}
	if (body) {
		codes.push(`\\\n\t-d ${JSON.stringify(body)}`);
	}
	return codes.join(' ');
}

/**
 * 生成代码
 * @param data 请求数据
 * @param type 代码类型
 */
export function makeCode(data: ReqData, type: CodeGenType) {
	switch (type) {
		case 'JavaScript':
			return makeJsCode(data);
		case 'Java':
			return makeJavaCode(data);
		case 'Python':
			return makePythonCode(data);
		case 'Go':
			return makeGoCode(data);
		case 'cURL':
			return makeCurlCode(data);
		default:
			console.log(`Unsupported code generation type: ${type}`);
			return `Unsupported code generation type: ${type}`;
	}
}

export const codeGenSelectType = writable<CodeGenType>('JavaScript');

function jsonToXml(obj: any): string {
	let xml = '';
	for (const prop in obj) {
		if (obj.hasOwnProperty(prop)) {
			xml += `<${prop}>`;
			xml += typeof obj[prop] === 'object' ? jsonToXml(obj[prop]) : obj[prop];
			xml += `</${prop}>`;
		}
	}
	return xml;
}

/**
 * 生成路径
 * @param path 路径
 * @param params 参数
 * @return 替换后的路径
 */
function makePath(path: string, params: [string, any][]) {
	const replaceIdx: [number, number, any][] = [];
	params.forEach(([name, value]) => {
		const idx = path.indexOf(`{${name}}`);
		if (idx === -1) return;
		if (replaceIdx.find((v) => v[0] === idx)) return;
		replaceIdx.push([idx, idx + name.length, value]);
	});
	replaceIdx.sort((a, b) => a[0] - b[0]);

	return replaceIdx.reduce(
		([path, offset], [start, end, value]) => {
			value = String(value);
			path = path.slice(0, offset + start) + value + path.slice(offset + end + 2);
			offset = offset - (end - start + 2) + value.length;
			return [path, offset] satisfies [string, number];
		},
		[path, 0] satisfies [string, number],
	)[0];
}

/**
 * 生成请求体
 * @param op 操作对象
 * @param media 媒体类型
 * @param values 值
 * @param noValues 是否为空
 * @return 请求体
 */
function makeBody(
	op: OperationObject,
	media: string | undefined,
	values: any[],
	noValues: boolean[],
) {
	if (!op.requestBody || values.length < 1 || noValues.length < 1 || noValues[noValues.length - 1])
		return undefined;
	const body = values[values.length - 1];
	if (media === 'application/xml') {
		return jsonToXml(body);
	} else if (media === 'application/x-www-form-urlencoded') {
		return new URLSearchParams(body).toString();
	}
	return JSON.stringify(body); // application/json and default
}

/**
 * 生成请求信息
 * @param method 方法
 * @param href 请求地址
 * @param media 媒体类型
 * @param op 操作对象
 * @param values 值
 * @param noValues 是否为空
 * @param path 路径
 * @return 请求信息
 */
export function makeReq(
	method: string,
	href: string,
	media: string | undefined,
	op: OperationObject,
	values: any[],
	noValues: boolean[],
	path: string,
): ReqData {
	const url = new URL(href);
	const params = ((op.parameters as ParameterObject[]) ?? []).map(
		(p, idx) => [p.in, p.name, values[idx], noValues[idx]] satisfies [string, string, any, boolean],
	); //[in,name,value,noValue]

	url.pathname = makePath(
		path,
		params
			.filter(([type, _n, _v]) => type === 'path')
			.map(([_, name, value, noValue]) => [name, noValue ? '' : value]),
	);
	url.search = new URLSearchParams(
		params
			.filter(([type, _n, _v, noValue]) => type === 'query' && !noValue)
			.map(([_, name, value]) => [name, value]),
	).toString();
	url.hash = '';

	let headers: [string, string][] = params
		.filter(([type, _n, _v, noValue]) => type === 'header' && !noValue)
		.map(([_, name, value]) => [name, value]);
	const cookie = params
		.filter(([type, _n, _v, noValue]) => type === 'cookie' && !noValue)
		.map(([_, name, value]) => `${name}=${value}`)
		.join('; ');
	if (cookie) headers.push(['Cookie', cookie]);

	const body = makeBody(op, media, values, noValues);

	if (body !== undefined) {
		if (!headers.some(([k]) => k === 'Content-Type')) {
			headers.push(['Content-Type', media ?? 'application/json']);
		}
	}

	return { url: url.toString(), headers, body, method };
}
