import { addNotification } from '$lib/components/Notifications/NotificationList.svelte';
import { api__request_failed_title } from '$lib/paraglide/messages';
import * as protobuf from 'protobufjs/minimal';

function error(path: string, msg: string, data: any, showErr: number) {
	console.error('API Error:', path, msg, data);
	if (showErr > 0)
		addNotification(
			{
				title: api__request_failed_title(),
				message: msg,
				type: 'error',
				icon: true,
				showClose: true,
			},
			showErr,
		);
}
type CommonResp<T = any> = {
	data?: T;
	code: number;
	message?: string;
};
function isSuccess(obj: unknown): obj is CommonResp {
	if (!obj || typeof obj !== 'object') return false;
	return (obj as any)?.code === 0;
}

/**
 * 标准API的请求 & 解析 & 错误处理封装
 * @param path 请求路径
 * @param method 请求方法
 * @param defaultVal 错误时的默认返回值
 * @param data 请求参数
 * @param showErr 显示错误时间, ms, 默认10秒
 * @returns 请求结果
 */
const apiReq = async <T>(
	path: string,
	method: 'GET' | 'POST',
	defaultVal: T,
	data?: [string, any][] | Record<string, any> | string | null,
	showErr = 10 * 1000,
) => {
	let response: Response;
	if (method === 'GET') {
		if (data) path = `${path}?${new URLSearchParams(data)}`;
		response = await fetch(path);
	} else {
		response = await fetch(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
	}
	let resp: string = '';
	let json: any = null;
	try {
		resp = await response.text();
		json = JSON.parse(resp);
	} catch (_) {}

	if (!response.ok) {
		error(
			path,
			json?.message || `${response.status} - ${response.statusText}`,
			{ response, body: json ?? resp },
			showErr,
		);
		return defaultVal;
	}

	if (!isSuccess(json)) {
		error(path, json?.message || 'unknown error', json, showErr);
		return defaultVal;
	}
	return json.data as T;
};

/**
 * 标准API的请求 & 解析 & 错误处理封装
 * @param path 请求路径
 * @param defaultVal 错误时的默认返回值
 * @param param.method 请求方法
 * @param param.data 请求参数
 * @param param.showErr 显示错误时间, ms, 默认10秒
 * @param param.proto 解析protobuf的配置
 * @returns 请求结果
 */
export const apiReq2 = async <T>(
	path: string,
	defaultVal: T,
	{
		method = 'GET',
		data,
		showErr = 10 * 1000,
		proto,
	}: {
		method?: 'GET' | 'POST';
		data?: [string, any][] | Record<string, any> | string | null;
		showErr?: number;
		proto?: { decode: (reader: protobuf.Reader | Uint8Array, length?: number) => T };
	} = {},
) => {
	let response: Response;
	if (method === 'GET') {
		if (data) path = `${path}?${new URLSearchParams(data)}`;
		response = await fetch(path);
	} else {
		response = await fetch(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify(data),
		});
	}
	if (proto && response.headers.get('Content-Type') === 'application/x-protobuf') {
		if (!response.ok || !response.body) {
			error(
				path,
				response.headers.get('X-Error-Message') || `${response.status} - ${response.statusText}`,
				{ response },
				showErr,
			);
			return defaultVal;
		}
		return proto.decode(new protobuf.Reader(new Uint8Array(await response.arrayBuffer())));
	}
	let resp: string = '';
	let json: any = null;
	try {
		resp = await response.text();
		json = JSON.parse(resp);
	} catch (_) {}

	if (!response.ok) {
		error(
			path,
			json?.message || `${response.status} - ${response.statusText}`,
			{ response, body: json ?? resp },
			showErr,
		);
		return defaultVal;
	}

	if (!isSuccess(json)) {
		error(path, json?.message || 'unknown error', json, showErr);
		return defaultVal;
	}
	return json.data as T;
};
