type DataType = string | number;
type MaybePromise<T> = T | Promise<T>;
/**
 * 数据获取器
 * @param offset 请求数据的起始位置(从0开始)
 * @param length 请求数据的长度
 * @returns `T[]`: 请求段数据, 尾页允许返回少于length条数据, 超出最大页数允许返回空数组
 * @returns `total`: 返回总条数, 仅在可以明确获取总条数时设置. 负数视为undefined.
 * @returns `guessTotal`: 猜测总条数, 不能小于最终的实际条数. 负数视为undefined.
 */
export type Fetcher<T> = (
	offset: number,
	length: number,
) => MaybePromise<T[] | { total?: number; data: T[]; guessTotal?: number }>;

export interface Pageable<T> {
	getTotal(): number;
	getTotalUpperBound(): number;
	guessTotal(): number;
	getData(offset: number, length: number): Promise<T[]> | T[];
	clearCache(offset: number, length: number): void;
}

export class PageableFetcher<T> implements Pageable<T> {
	/**
	 * 缓存数据, 仅在`cacheData`为`true`时有效.
	 */
	private cache: (T | undefined)[] = [];
	/**
	 * 是否已加载过某条数据, 用于判断此位置是否有数据
	 * TODO: 优化成bitmap or 请求一般是分块的, 可以记作range
	 */
	private loadedRow: (boolean | undefined)[] = [];
	/**
	 * 实际条数, `-1`代表未知. 仅在明确地得知总条数时才设置为非负数.
	 *
	 * 明确得知的条件:
	 * - 调用`fetcher`方法返回了非负的`total`字段, 此时为返回值
	 * - 调用`fetcher`方法返回了不足请求的`length`条数据, 但又不为空数组, 此时为`offset+resp.length`
	 * - 调用`fetcher`方法请求`offset+length`到`length`条时返回空, 但请求`offset`到`length`条时返回`length`条数据, 此时为`offset+length`
	 */
	private total: number = -1;
	/**
	 * total上界, `>= total` or `-1`
	 *
	 * 此变量用于内部加速fetch判断和确定模糊的最大条数, 即最多可能的数据数量, 在请求超出范围的页面时快速返回空.
	 * 变量由`fetcher`结果决定, 当请求`offset`后`length`条数据却只返回`<length`条数据时, 则说明到达尾页. 此时设置`totalUpperBound`为`offset+resp.length`. (特别地, 请求返回`length`为`0`, 则说明超出最大页数/刚好满页)
	 */
	private totalUpperBound: number = -1;
	public constructor(
		private fetcher: Fetcher<T>,
		private cacheData: boolean = true,
	) {}
	/** @return 总条数, -1代表未知 */
	public getTotal() {
		return this.total;
	}
	/** @return 总条数上界, -1代表未知 */
	public getTotalUpperBound() {
		return this.totalUpperBound;
	}
	/** @return 猜测总条数, 当没有精确的总条数时使用总体条数上界, 仍未知时返回-1 */
	public guessTotal() {
		return this.total < 0 ? this.totalUpperBound : this.total;
	}
	/**
	 * 获取指定一段数据
	 *
	 * 此方法会检测/写入缓存, 同时更新total/totalUpperBound.
	 * @param offset 请求数据的起始位置(从0开始)
	 * @param length 请求数据的长度
	 * @returns 请求段的数据(<=length)
	 */
	public async getData(offset: number, length: number): Promise<T[]> {
		await this.loading;
		const resp = await (this.loading = this.getData0(offset, length));
		this.loading = undefined;
		return resp;
	}
	private loading: Promise<any> | undefined;
	public async getData0(offset: number, length: number): Promise<T[]> {
		if (offset < 0) {
			length -= offset;
			offset = 0;
		}
		if (this.totalUpperBound >= 0) length = Math.min(length, this.totalUpperBound - offset);
		if (this.total >= 0) length = Math.min(length, this.total - offset);
		if (length <= 0) return [];

		if (this.cacheData && this.isRangeLoaded(offset, length)) {
			// cache hit
			return this.cache.slice(offset, offset + length) as T[];
		}

		const resp = await this.fetcher(offset, length);
		const { data, total, guessTotal } = Array.isArray(resp) ? { data: resp } : resp;

		if (this.cacheData) for (let i = 0; i < data.length; i++) this.cache[offset + i] = data[i];
		for (let i = 0; i < data.length; i++) this.loadedRow[offset + i] = true;

		if (
			typeof guessTotal === 'number' &&
			guessTotal >= 0 &&
			(this.totalUpperBound < 0 || guessTotal < this.totalUpperBound)
		)
			this.totalUpperBound = guessTotal;

		if (typeof total === 'number' && total >= 0) {
			this.total = this.totalUpperBound = total;
		} else if (0 < data.length && data.length < length) {
			this.total = this.totalUpperBound = offset + data.length;
		} else if (data.length === 0) {
			if (this.totalUpperBound < 0 || offset < this.totalUpperBound) this.totalUpperBound = offset;
			if (this.totalUpperBound === 0 || offset === 0 || this.loadedRow[offset - 1])
				this.total = this.totalUpperBound;
		} else if (data.length >= length) {
			if (this.totalUpperBound === offset + data.length) this.total = this.totalUpperBound;
		}

		return data;
	}
	/** @return 判断给定范围内的数据是否均已加载完毕 */
	public isRangeLoaded(offset: number, length: number) {
		for (let i = offset; i < offset + length; i++)
			if (this.loadedRow[i] === undefined) return false;
		return true;
	}
	/** 清除缓存 */
	public clearCache(offset: number = 0, length: number = -1) {
		if (length < 0) length = this.cache.length - offset;
		else length = Math.min(length, this.cache.length - offset);
		for (let i = offset; i < offset + length; i++) this.cache[i] = undefined;
		if (offset + length === this.cache.length) this.cache.length = offset;
	}
}

export class PageableArray<T> implements Pageable<T> {
	public constructor(private data: T[]) {}
	public getTotal() {
		return this.data.length;
	}
	public getTotalUpperBound() {
		return this.data.length;
	}
	public guessTotal() {
		return this.data.length;
	}
	public getData(offset: number, length: number): T[] {
		return this.data.slice(offset, offset + length);
	}
	public clearCache(offset: number = 0, length: number = -1) {}
}
