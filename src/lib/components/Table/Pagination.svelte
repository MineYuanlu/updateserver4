<script lang="ts">
	import anime from 'animejs';
	import BindValue from '../BindValue/BindValue.svelte';

	/**当前页数*/
	export let current: number = 1;
	/**总页数*/
	export let total: number;
	/**可视页数(不含上一页/下一页)*/
	export let visible = 5;
	/**修改监听, 默认为直接对current赋值*/
	export let onPageChange = (page: number) => {
		current = page;
	};
	/**绑定url中的search*/
	export let bindSearch: string | undefined = undefined;

	function get(cur: number, tot: number, vis: number) {
		if (tot < vis) return Array.from({ length: tot }).map((_, i) => i + 1);
		const pages: number[] = [];
		if (vis >= 5) {
			pages.push(1);
			vis -= 2;
			let start = Math.max(2, cur - Math.floor(vis / 2));
			let end = start + vis - 1;
			if (end >= tot) {
				start -= end - tot + 1;
				end = tot - 1;
			}
			for (let i = start; i <= end; ++i) pages.push(i);
			pages.push(tot);
		} else if (vis > 3) {
			let start = Math.max(2, cur - Math.floor(vis / 2));
			let end = start + vis - 1;
			if (end >= tot) {
				start -= end - tot + 1;
				end = tot - 1;
			}
			for (let i = start; i < end; ++i) pages.push(i);
		} else if (vis == 2) {
			if (cur == tot) {
				pages.push(cur - 1, cur);
			} else {
				pages.push(cur, cur + 1);
			}
		} else {
			pages.push(cur);
		}
		return pages;
	}

	$: pages = get(current, total, visible);

	function handlePageChange(page: number) {
		if (page !== current) {
			onPageChange(page);
		}
	}

	let edit = false;
	let currentElement: HTMLElement;
	function jump() {
		edit = false;
		const jump = Number(currentElement.innerHTML);
		if (!isNaN(jump) && 1 <= jump && jump <= total) {
			currentElement.innerHTML = `${current}`;
			handlePageChange(jump);
		} else {
			anime({
				targets: currentElement,
				translateX: [
					{ value: -10, duration: 50 },
					{ value: 10, duration: 50 },
					{ value: -10, duration: 50 },
					{ value: 10, duration: 50 },
					{ value: -5, duration: 50 },
					{ value: 5, duration: 50 },
					{ value: 0, duration: 50 },
				],
				easing: 'easeInOutSine',
			});
			setTimeout(() => {
				currentElement.innerHTML = `${current}`;
				currentElement.classList.remove('invalid');
			}, 6 * 50);
		}
	}

	function switchEdit(select: boolean) {
		if (edit) return;
		edit = true;
		currentElement.focus();
		if (select) {
			const range = document.createRange();
			range.selectNodeContents(currentElement);
			const selection = window.getSelection();
			if (selection) {
				selection.removeAllRanges();
				selection.addRange(range);
			}
		}
	}
</script>

{#if bindSearch}
	<BindValue
		bind={bindSearch}
		value={`${current}`}
		handler={(v) => {
			console.log('update', v);
			const val = parseInt(v);
			if (!isNaN(val)) handlePageChange(val);
		}}
	></BindValue>
{/if}

<nav aria-label="Pagination">
	<ul class="flex items-center space-x-1">
		<!-- 上一页按钮 -->
		{#if visible < total}
			<li>
				<button
					class="rounded bg-gray-200 px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:bg-gray-400 disabled:text-gray-500"
					on:click={() => handlePageChange(current - 1)}
					disabled={current === 1}
				>
					&laquo;
				</button>
			</li>
		{/if}

		<!-- 页码按钮 -->
		{#each pages as page (page)}
			<li>
				{#if page === current}
					<button
						bind:this={currentElement}
						contenteditable={edit}
						class="rounded bg-blue-600 px-2 py-1 text-sm font-semibold text-white hover:bg-blue-700 focus:outline-none"
						on:click={() => switchEdit(false)}
						on:dblclick={() => switchEdit(true)}
						on:blur={jump}
						on:keyup={(e) => {
							if (e.key === 'Enter' || e.keyCode === 13) {
								e.preventDefault();
								jump();
							} else if (currentElement) {
								const jump = Number(currentElement?.innerText);
								if (!isNaN(jump) && 1 <= jump && jump <= total) {
									currentElement.classList.remove('invalid');
								} else {
									currentElement.classList.add('invalid');
								}
							}
						}}
						aria-current="page"
					>
						{page}
					</button>
				{:else}
					<button
						class="rounded bg-gray-200 px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-300"
						on:click={() => handlePageChange(page)}
					>
						{page}
					</button>
				{/if}
			</li>
		{/each}

		<!-- 下一页按钮 -->
		{#if visible < total}
			<li>
				<button
					class="rounded bg-gray-200 px-2 py-1 text-sm font-semibold text-gray-700 hover:bg-gray-300 disabled:bg-gray-400 disabled:text-gray-500"
					on:click={() => handlePageChange(current + 1)}
					disabled={current === total}
				>
					&raquo;
				</button>
			</li>
		{/if}
	</ul>
</nav>
