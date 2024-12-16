<script lang="ts">
	import Button from '../Form/Button.svelte';
	import Input from '../Form/Input.svelte';

	type Check = (v: string) => boolean;
	let {
		headers,
		col: outerCol = headers?.length,
		data = $bindable(),
		unique: _unique = false,
		checkers = (v) => !!v,
		invalid = $bindable(),
	}: {
		headers?: string[];
		col?: number;
		data: string[][];
		unique?: boolean | number;
		checkers?: (Check | undefined | null)[] | Check | null;
		invalid?: boolean;
	} = $props();
	const defaultCol = outerCol ?? data.reduce((acc, cur) => Math.max(acc, cur.length), 0);

	const unique = $derived(typeof _unique === 'number' ? _unique : _unique ? 0 : -1);
	const maxCol = $derived(
		data.length > 0
			? data.reduce((acc, cur) => Math.max(acc, cur.length), outerCol ?? 0)
			: defaultCol,
	);

	const checkResults: boolean[][] = $derived.by(() => {
		if (Array.isArray(checkers)) {
			return data.map((row) => row.map((v, i) => checkers[i]?.(v) ?? true));
		} else if (checkers) {
			return data.map((row) => row.map(checkers));
		} else return data.map((row) => row.map(() => true));
	});
	$effect(() => {
		invalid = checkResults.some((row) => row.some((v) => v === false));
	});

	// svelte-ignore state_referenced_locally
	let edits: string[] = $state(Array.from<string>({ length: maxCol }).fill(''));
	let editRefs: (HTMLInputElement | undefined)[] = $state([]);
	const editOk = $derived.by(() => {
		if (Array.isArray(checkers)) return edits.every((v, i) => checkers[i]?.(v) ?? true);
		else if (checkers) return edits.every(checkers);
		else return true;
	});
	$effect(() => {
		// 数组大小同步
		if (maxCol > edits.length) {
			edits.push(...Array(maxCol - edits.length).fill(''));
			editRefs.push(...Array(maxCol - editRefs.length).fill(undefined));
		} else if (maxCol < edits.length) {
			edits.splice(maxCol);
			editRefs.splice(maxCol);
		}
	});
	let editModCnt = $state(0);
	const addEdit = () => {
		if (!editOk) return;

		const exist =
			0 <= unique && unique < edits.length
				? data.findIndex((v) => v[unique] === edits[unique])
				: -1;

		if (exist !== -1) {
			data[exist] = edits;
		} else {
			data.push(edits);
		}
		edits = [];
		editModCnt++;
	};
	$effect(() => {
		if (editModCnt > 0 && editRefs?.[0]) editRefs[0].focus();
	});
</script>

<!-- @component
可编辑的表格，可编辑二维字符串数组，支持添加和删除行，支持设置唯一值，支持自定义校验器.
 -->

<table>
	{#if headers}
		<thead>
			<tr>
				{#each headers as header, i (i)}
					<th>
						{header}
					</th>
				{/each}
			</tr>
		</thead>
	{/if}
	<tbody class="justify-center text-center">
		{#each data as row, i (i)}
			<tr>
				{#each row as col, j (j)}
					<td class="p-1">
						<Input
							bind:value={data[i][j]}
							invalid={(unique === j ? data.filter((v) => v[j] === col).length > 1 : false) ||
								checkResults[i][j] === false}
							initNoErr={false}
						/>
					</td>
				{/each}
				<td>
					<Button color="red" onclick={() => data.splice(i, 1)} class="w-full">删除</Button>
				</td>
			</tr>
		{/each}
		{#key editModCnt}
			<tr>
				{#each edits as _, j (j)}
					<td class="p-1">
						<Input
							placeholder="新增特殊字段"
							bind:input={editRefs[j]}
							bind:value={edits[j]}
							checker={(v) => {
								if (edits.every((v) => !v)) return true;
								return (Array.isArray(checkers) ? checkers[j] : checkers)?.(v) ?? true;
							}}
							onkeydown={(e) => {
								if (e.key === 'Enter') {
									if (editOk) addEdit();
									else if (j < editRefs.length - 1) editRefs[j + 1]?.focus?.();
								}
							}}
						/>
					</td>
				{/each}
				<td>
					<Button color="green" onclick={addEdit} disabled={!editOk} class="w-full">添加</Button>
				</td>
			</tr>
		{/key}
	</tbody>
</table>
