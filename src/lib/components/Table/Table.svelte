<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PageableArray, PageableFetcher, type Fetcher, type Pageable } from './pageable';

	type DataType = string | number | any;

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
		data: DataType[][] | Fetcher<DataType[]>;
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
		totalCount?: number;
		/** 是否启用缓存, 默认false */
		cached?: boolean;
		/** 是否正在加载数据, 可绑定 */
		loading?: boolean;
	} = $props();

	const page_manager: Pageable<DataType[]> = $derived(
		typeof rawData === 'function'
			? new PageableFetcher(rawData, cached)
			: new PageableArray(rawData)
	);
	const dataPromise = $derived(page_manager.getData(pageIndex * pageSize, pageSize));
	const postUpdatePM = () => {
		totalCount = page_manager.guessTotal();
	};
	postUpdatePM();
	const pageCount = $derived(Math.ceil(totalCount / pageSize));

	let ok = false;
	async function updateData(dataPromise: Promise<DataType[][]>) {
		loading = true;
		try {
			await dataPromise;
		} finally {
			loading = false;
		}
		postUpdatePM();
		ok = true;
	}
	$effect(() => {
		if (dataPromise instanceof Promise) updateData(dataPromise);
		postUpdatePM();
	});
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
				pageCount,
				ok
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
			{#if dataPromise instanceof Promise}
				{#await dataPromise then data}
					{#if data}
						{#each data as row, rowIndex}
							{@render Row(row, rowIndex)}
						{/each}
					{/if}
				{/await}
			{:else}
				{#each dataPromise as row, rowIndex}
					{@render Row(row, rowIndex)}
				{/each}
			{/if}
		</tbody>
	</table>
</div>
