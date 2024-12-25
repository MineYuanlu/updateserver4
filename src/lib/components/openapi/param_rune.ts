export type RuneTypes = 'path' | 'header' | 'query' | 'body' | 'cookie' | 'form';

export const runeTypes = ['path', 'header', 'query', 'body', 'cookie', 'form'] as const;

export const runes: Record<RuneTypes, string> = {
	path: '/',
	header: 'H',
	query: '?',
	body: '{}',
	cookie: '*',
	form: '[]',
};
export const runeDesc: Record<RuneTypes, string> = {
	path: 'URL Path',
	header: 'Header',
	query: 'Query',
	body: 'Body',
	cookie: 'Cookie',
	form: 'FormData',
};
