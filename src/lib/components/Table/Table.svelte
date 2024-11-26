<script lang="ts">
	import type { Snippet } from 'svelte';

	type DataType = string | number | any;
	type Fetcher = (
		offset: number,
		length: number
	) => Promise<DataType[][] | { total: number; data: DataType[][] }>;

	let {
		headers,
		header: Header = _header,
		data: rawData,
		row: Row = _row,
		cell: Cell = _cell,
		striped,
		hover,
		centering,
		className,

		pageSize = $bindable(20),
		pageIndex = $bindable(0),
		totalCount = $bindable(-1),
		cached = false,
		loading = $bindable(false)
	}: {
		/** 表头数据 */
		headers: DataType[];
		/** 表头渲染函数 */
		header?: Snippet<[DataType, number]>;
		/**
		 * 数据 / 数据获取
		 */
		data: DataType[][] | Fetcher;
		/** 行渲染函数, row(data, row) */
		row?: Snippet<[DataType, number]>;
		/** 单元格渲染函数, cell(data, row, col) */
		cell?: Snippet<[DataType, number, number]>;
		/** 是否使用斑马纹 */
		striped?: boolean;
		/** 是否显示悬停效果 */
		hover?: boolean;
		/** 是否居中显示 */
		centering?: boolean;
		/** 额外的自定义类名 */
		className?: string;

		//分页相关

		/** 每页显示条数, 设为0则不启用分页功能, 可绑定 */
		pageSize?: number;
		/** 当前页码(从0开始), 可绑定 */
		pageIndex?: number;
		/**
		 * 总数据条数, 设为-1则代表未知. 可绑定
		 *
		 * 如为-1, 则会自动计算总数据条数:
		 * - 对于直接提供数据, 内部会自动推断总数据条数
		 * - 对于异步获取数据, 当返回数据条数不足一页时, 计算总数据条数
		 */
		totalCount?: number;
		/** 是否启用缓存, 默认false */
		cached?: boolean;
		/** 是否正在加载数据, 可绑定 */
		loading?: boolean;
	} = $props();

	const cache: (DataType[] | undefined)[] = [];
	const loadedRow: boolean[] = []; // 记录是否已经加载过某行数据

	function isLoadedRange(offset: number, length: number) {
		if (!cached) return false;
		if (loadedRow.length < offset + length) return false;
		for (let i = offset; i < offset + length; i++) if (!loadedRow[i]) return false;
		return true;
	}

	let maxCount = -1; // 最大数据条数, >= totalCount

	async function fetchData(
		idx: number,
		size: number
	): Promise<{
		data: DataType[][];
		mc: number;
		tc: number;
	}> {
		debugger;
		const __data = rawData;
		const offset = idx * pageSize;

		if (maxCount >= 0) size = Math.min(size, maxCount - offset);
		if (totalCount >= 0) size = Math.min(size, totalCount - offset);
		if (size <= 0) return { data: [], mc: maxCount, tc: totalCount };
		if (typeof rawData === 'function') {
			if (cached && isLoadedRange(offset, size))
				return {
					data: cache.slice(offset, offset + size) as DataType[][],
					mc: maxCount,
					tc: totalCount
				};
			const resp = await rawData(offset, size);
			const data = Array.isArray(resp) ? resp : resp.data;
			const total = Array.isArray(resp) ? -1 : resp.total;
			if (cached) {
				for (let i = 0; i < data.length; i++) cache[idx + i] = data[i];
			}
			for (let i = 0; i < data.length; i++) loadedRow[offset + i] = true;
			if (total >= 0) {
				// 用户返回了总条数, 直接设置
				return { data, mc: total, tc: total };
			} else if (totalCount < 0) {
				if (data.length < size) {
					// 数据条数不足一页, 计算总数据条数
					maxCount = offset + data.length;
				}
				// 已设置最大条数, 检测此区间是否已全部加载, 若是, 则将maxCount设为totalCount
				if (maxCount >= 0 && isLoadedRange(0, maxCount)) totalCount = maxCount;
			}
			return data;
		} else {
			console.log(totalCount, rawData.length);
			if (totalCount < 0) totalCount = rawData.length;
			return rawData.slice(idx, idx + size);
		}
	}
</script>

{#snippet _header(data: string | number | any, col: number)}
	<th class="px-4 py-2 font-medium">{data}</th>
{/snippet}
{#snippet _cell(data: string | number | any, row: number, col: number)}
	<td class="px-4 py-2">{data}</td>
{/snippet}
{#snippet _row(data: (string | number | any)[], rowIndex: number)}
	<tr
		class:bg-gray-50={striped && rowIndex % 2 === 0}
		class:dark:bg-gray-800={striped && rowIndex % 2 === 0}
		class:hover:bg-gray-100={hover}
		class:dark:hover:bg-gray-700={hover}
	>
		{#each data as cell, colIndex}
			{@render Cell(cell, rowIndex, colIndex)}
		{/each}
	</tr>
{/snippet}

<div class="max-w-full overflow-x-auto {className}">
	<pre>{JSON.stringify(
			{
				pageIndex,
				pageSize,
				totalCount,
				maxCount,
				loadedRow
			},
			null,
			2
		)}</pre>
	<table
		class="h-full min-w-full table-auto text-sm text-gray-500 dark:text-gray-300"
		class:text-center={centering}
	>
		<thead class="bg-gray-100 dark:bg-gray-700">
			<tr>
				{#each headers as data, colIndex}
					{@render Header(data, colIndex)}
				{/each}
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 dark:divide-gray-600">
			{#await fetchData(pageIndex, pageSize) then data}
				{#each data as row, rowIndex}
					{@render Row(row, rowIndex)}
				{/each}
			{/await}
		</tbody>
	</table>
</div>
