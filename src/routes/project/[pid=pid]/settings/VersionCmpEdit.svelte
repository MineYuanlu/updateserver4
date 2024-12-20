<script lang="ts">
	import {
		argsToCmp,
		defaultDelimiters,
		normVersionCmpArgs,
		validateVersionCmpArgsDelimiters,
		validateVersionCmpArgsSpecials,
		whyInvalidVersionCmpArgsDelimiters,
		type VersionCmpArgs,
	} from '$lib/common/versions';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import EditTable from '$lib/components/Table/EditTable.svelte';
	import { isEqualRecord, isEqualSet } from '$lib/utils/equal';
	import {
		ChevronDoubleLeft,
		ChevronDoubleRight,
		ChevronLeft,
		ChevronRight,
		Equals,
	} from '@steeze-ui/heroicons';
	import { Icon } from '@steeze-ui/svelte-icon';

	// ========== 绑定数据 ==========
	let {
		default: defaultArgs = null,
		value: args = $bindable({}),
		onclick: onsave,
	}: {
		default: VersionCmpArgs | null;
		value: VersionCmpArgs | null;
		onclick: () => void;
	} = $props();

	// ========== 编辑数据 ==========
	let delimiter: string = $state(args?.d || defaultDelimiters);
	let specials: [string, string][] = $state(
		Object.entries(args?.s || {}).map(([k, v]) => [k, String(v)]),
	);
	$effect(() => {
		args = normVersionCmpArgs(delimiter, specials);
	});

	//  ========== 编辑状态 ==========
	let delimiterInvalid = $state(false);

	const hasChanges = $derived.by(() => {
		const a = args;
		const b = normVersionCmpArgs(defaultArgs?.d, defaultArgs?.s);
		if (!a && !b) return false;
		if (!a || !b) return true;

		if (!isEqualSet(a.d, b.d)) return true;
		if (!isEqualRecord(a.s, b.s)) return true;
		return false;
	});

	//  ========== 比较结果 ==========
	const cmp = $derived(argsToCmp(args));
	let ver1 = $state('');
	let ver2 = $state('');
	const cmpResult = $derived(cmp.compare(ver1, ver2));
</script>

<Input
	label="分隔符"
	prefix="分割版本号:"
	bind:value={delimiter}
	bind:invalid={delimiterInvalid}
	checker={validateVersionCmpArgsDelimiters}
	hint={delimiterInvalid ? whyInvalidVersionCmpArgsDelimiters(delimiter) : undefined}
/>

<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="table">
	特殊字段映射
</label>
<EditTable
	headers={['特殊字段', '映射值']}
	bind:data={specials}
	unique
	checkers={[(v) => !!v, (v) => !!v && !isNaN(Number(v))]}
/>

{#if hasChanges}
	<Button
		color="blue"
		disabled={new Set(specials.map((s) => s[0])).size !== specials.length ||
			delimiterInvalid ||
			!validateVersionCmpArgsSpecials(args?.s || {})}
		onclick={onsave}>保存</Button
	>
{/if}
<label class="text-sm font-medium text-gray-700 dark:text-gray-300" for="table"> 比较测试 </label>
<table>
	<tbody>
		<tr>
			<td> 输入数据 </td>
			<td class="pb-1">
				<Input placeholder="被比较版本号" bind:value={ver1} checker={(v) => cmp.check(v)} />
			</td>
			<td class="pb-1">
				<Icon
					src={cmpResult.val === 0
						? Equals
						: cmpResult.val === 1
							? ChevronRight
							: cmpResult.val === -1
								? ChevronLeft
								: cmpResult.val > 0
									? ChevronDoubleRight
									: cmpResult.val < 0
										? ChevronDoubleLeft
										: Equals}
					class="mx-auto h-6 w-6"
				/>
			</td>
			<td class="pb-1">
				<Input placeholder="基准版本号" bind:value={ver2} checker={(v) => cmp.check(v)} />
			</td>
		</tr>
		<tr>
			<td> 解析结果 </td>
			<td>
				<Input placeholder="被比较解析结果" value={cmp.parse(ver1).join(', ')} disabled />
			</td>
			<td class="text-center">
				<pre>{cmpResult.val}</pre>
			</td>
			<td>
				<Input placeholder="基准解析结果" value={cmp.parse(ver2).join(', ')} disabled />
			</td>
		</tr>
		<tr>
			<td> 结果说明 </td>
			<td class="text-center">
				{cmpResult.name}
			</td>
			<td></td>
			<td class="text-center">
				{cmpResult.desc()}
			</td>
		</tr>
	</tbody>
</table>
