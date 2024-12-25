import type { HttpMethod } from '$lib/api/common';

/** 颜色组*/
type Color = {
	/** 文本变色, 忽略背景 */
	t: string;
	/** 背景变色, 同步修改文本颜色 */
	bg: string;
	/** 边框颜色 */
	border: string;
};
export const methodToColor: Record<HttpMethod, Color> = {
	HEAD: {
		t: 'text-gray-600',
		bg: 'bg-gray-600 text-white',
		border: 'border-gray-600',
	},
	GET: {
		t: 'text-green-600',
		bg: 'bg-green-600 text-white',
		border: 'border-green-600',
	},
	POST: {
		t: 'text-blue-600',
		bg: 'bg-blue-600 text-white',
		border: 'border-blue-600',
	},
	PUT: {
		t: 'text-amber-600',
		bg: 'bg-amber-600 text-white',
		border: 'border-amber-600',
	},
	DELETE: {
		t: 'text-red-600',
		bg: 'bg-red-600 text-white',
		border: 'border-red-600',
	},
	PATCH: {
		t: 'text-purple-600',
		bg: 'bg-purple-600 text-white',
		border: 'border-purple-600',
	},
	OPTIONS: {
		t: 'text-gray-500',
		bg: 'bg-gray-500 text-white',
		border: 'border-gray-500',
	},
	TRACE: {
		t: 'text-gray-400',
		bg: 'bg-gray-400 text-white',
		border: 'border-gray-400',
	},
};

/** 转换为简写 */
export const methodToShort: Record<HttpMethod, string> = {
	HEAD: 'HEAD',
	GET: 'GET',
	POST: 'POST',
	PUT: 'PUT',
	DELETE: 'DEL',
	PATCH: 'PATCH',
	OPTIONS: 'OPT',
	TRACE: 'TRC',
};
