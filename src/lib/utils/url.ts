export const isURL = (str: unknown): str is string => {
	if (typeof str !== 'string') {
		return false;
	}
	try {
		const url = new URL(str);

		return url.protocol === 'http:' || url.protocol === 'https:';
	} catch (e) {
		return false;
	}
};
