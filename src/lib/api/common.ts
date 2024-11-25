function error(msg: string, data: any) {
	//TODO show alert message box
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

export const apiReq = async <T>(
	path: string,
	method: 'GET' | 'POST',
	defaultVal: T,
	data?: string[][] | Record<string, string> | string | null
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
		error(response.statusText, response.status);
		return defaultVal;
	}
	const json = await response.json();
	if (!isSuccess(json)) {
		error(json?.msg || 'unknown error', json);
		return defaultVal;
	}
	return json.data as T;
};
