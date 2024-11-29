import { addNotification } from '$lib/components/Notifications/NotificationList.svelte';

function error(path: string, msg: string, data: any) {
	console.error('API Error:', path, msg, data);
	addNotification(
		{
			title: 'API Error',
			message: msg,
			type: 'error',
			icon: true,
			showClose: true
		},
		10 * 1000
	);
}
type CommonResp<T = any> = {
	data?: T;
	code: number;
	msg?: string;
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
 * @param slient 是否静默错误
 * @returns 请求结果
 */
export const apiReq = async <T>(
	path: string,
	method: 'GET' | 'POST',
	defaultVal: T,
	data?: string[][] | Record<string, string> | string | null,
	slient = false
) => {
	let response: Response;
	if (method === 'GET') {
		if (data) path = `${path}?${new URLSearchParams(data)}`;
		response = await fetch(path);
	} else {
		response = await fetch(path, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	}
	if (!response.ok) {
		if (!slient) error(path, `${response.status} - ${response.statusText}`, response);
		return defaultVal;
	}
	const json = await response.json();
	if (!isSuccess(json)) {
		if (!slient) error(path, json?.msg || 'unknown error', json);
		return defaultVal;
	}
	return json.data as T;
};
