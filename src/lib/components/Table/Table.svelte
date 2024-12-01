<script lang="ts">
	import type { Snippet } from 'svelte';
	import { PageableArray, PageableFetcher, type Fetcher, type Pageable } from './pageable';
	import Pagination from './Pagination.svelte';

	type DataType = string | number | any;

	let {
		headers,
		header: Header = _header,
		data: rawData,
		children: Children = _children,
		row: Row = _row,
		cell: Cell = _cell,
		striped,
		hover,
		centering,
		class: className,

		pageSize = $bindable(10),
		currentPage = $bindable(1),
		totalCount = $bindable(-1),
		cached = false,
		loading = $bindable(false),
		bindSearch,
	}: {
		/** 表头数据 */
		headers: DataType[];
		/** 表头渲染函数 */
		header?: Snippet<[DataType, number]>;
		/** 数据 / 数据获取 */
		data: DataType[][] | Fetcher<DataType[]>;
		/**
		 * 表格渲染函数, `children(data, tmp)`
		 *
		 * - `data`: 当前页的数据
		 * - `tmp`: 代表是否是临时渲染, 即处于加载数据阶段, 传入data可能是历史数据/空数组
		 */
		children?: Snippet<[DataType[][], boolean]>;
		/**
		 * 行渲染函数, `row(data, row, tmp)`
		 *
		 * - `data`: 当前行数据
		 * - `row`: 当前行索引
		 * - `tmp`: 代表是否是临时渲染, 即处于加载数据阶段, 传入data可能是历史数据/空数组
		 */
		row?: Snippet<[DataType[], number, boolean]>;
		/**
		 * 单元格渲染函数, `cell(data|null, row, col, tmp)`
		 *
		 * - `data`: 当前单元格数据
		 * - `row`: 当前行索引
		 * - `col`: 当前列索引
		 * - `tmp`: 代表是否是临时渲染, 即处于加载数据阶段, 传入data可能是历史数据/null
		 */
		cell?: Snippet<[DataType | null, number, number, boolean]>;
		/** 是否使用斑马纹 */
		striped?: boolean;
		/** 是否显示悬停效果 */
		hover?: boolean;
		/** 是否居中显示 */
		centering?: boolean;
		/** 额外的自定义类名 */
		class?: string;

		//分页相关

		/** 每页显示条数, 设为0则不启用分页功能, 可绑定 */
		pageSize?: number;
		/** 当前页码(从1开始), 可绑定 */
		currentPage?: number;
		/** 总数据量, 当没有精确的总条数时使用总体条数上界临时代替, 即代表totalCount可能大于实际总条数. -1代表未知, 可绑定 */
		totalCount?: number;
		/** 是否启用缓存, 默认false */
		cached?: boolean;
		/** 是否正在加载数据, 可绑定 */
		loading?: boolean;
		/** 绑定搜索参数 */
		bindSearch?: string;
	} = $props();

	const pageManager: Pageable<DataType[]> = $derived(
		typeof rawData === 'function'
			? new PageableFetcher(rawData, cached)
			: new PageableArray(rawData),
	);
	const dataPromise = $derived(pageManager.getData((currentPage - 1) * pageSize, pageSize));
	let dataImmCache: DataType[][] = $state([]);
	const postUpdatePM = (..._: any) => {
		totalCount = pageManager.guessTotal();
	};
	postUpdatePM();

	async function updateData(dataPromise: Promise<DataType[][]>) {
		loading = true;
		try {
			dataImmCache = await dataPromise;
		} finally {
			loading = false;
			postUpdatePM();
		}
	}
	$effect(() => {
		if (dataPromise instanceof Promise) updateData(dataPromise);
		else postUpdatePM();
	});

	const pageCount = $derived(Math.ceil(totalCount / pageSize));

	// $inspect('pageManager:', pageManager);
	// $inspect('dataPromise:', dataPromise);
	// $inspect('loading:', loading);
	// $inspect('totalCount:', totalCount);
</script>

{#snippet _header(data: DataType, _col: number)}
	<th class="px-4 py-2 font-medium">{data}</th>
{/snippet}
{#snippet _cell(data: DataType | null, _row: number, _col: number, tmp: boolean)}
	{#if data === null && tmp}
		<td class="px-4 py-2">&nbsp;</td>
	{:else}
		<td class="px-4 py-2">{data}</td>
	{/if}
{/snippet}
{#snippet _row(data: DataType[], rowIndex: number, tmp: boolean)}
	<tr
		class:bg-gray-50={striped && rowIndex % 2 === 0}
		class:dark:bg-gray-800={striped && rowIndex % 2 === 0}
		class:hover:bg-gray-100={hover}
		class:dark:hover:bg-gray-700={hover}
		class:disabled={tmp}
		class:dark:disabled={tmp}
	>
		{#each data as cell, colIndex}
			{@render Cell(cell, rowIndex, colIndex, tmp)}
		{/each}
		{#if tmp}
			{#each Array.from({ length: headers.length - data.length }) as _, colIndex}
				{@render Cell(null, rowIndex, colIndex, true)}
			{/each}
		{/if}
	</tr>
{/snippet}
{#snippet _children(data: DataType[][], tmp: boolean)}
	{#each data as row, rowIndex}
		{@render Row(row, rowIndex, tmp)}
	{/each}
	{#if tmp}
		{#each Array.from({ length: pageSize - data.length }) as _, rowIndex}
			{@render Row([], rowIndex, true)}
		{/each}
	{/if}
{/snippet}

<div class="relative max-w-full overflow-x-auto {className}">
	<!-- <pre>{JSON.stringify(
			{
				currentPage,
				pageSize,
				totalCount,
				pageCount,
				loading
			},
			null,
			2
		)}</pre> -->
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
				{#await dataPromise}
					{#if dataImmCache}
						{@render Children(dataImmCache, true)}
					{/if}
				{:then data}
					{#if data}
						{@render Children(data, false)}
					{/if}
				{/await}
			{:else}
				{@render Children(dataPromise, false)}
			{/if}
		</tbody>
		<tfoot class="bg-gray-100 dark:bg-gray-700">
			<tr>
				<td colspan={headers.length} class="px-4 py-2">
					<div class="flex items-center justify-end">
						<div class="mr-3 flex items-center">
							总量: {totalCount}
						</div>
						{#if pageCount > 1}
							<div class="flex items-center">
								<Pagination bind:current={currentPage} total={pageCount} {bindSearch} />
							</div>
						{/if}
					</div>
				</td>
			</tr>
		</tfoot>
	</table>
	{#if loading}
		<div
			class="loading loading-black dark:loading-white absolute inset-0 z-10 flex items-center justify-center bg-gray-500/50 backdrop-blur-xs transition-opacity"
		></div>
	{/if}
</div>
