export const cntTypes = {
	v: 'visit', // 访问
	d: 'download', // 下载
	c: 'check', // 检查
};
export type CntType = keyof typeof cntTypes;

export function getKey(id: string, type: CntType) {
	return `${id}/${type}`;
}
