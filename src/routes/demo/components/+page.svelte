<script lang="ts">
	import { colorPackNames } from '$lib/components/color';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
	import Table from '$lib/components/Table/Table.svelte';
</script>

<h1>This is a demo page</h1>
<h3>Button</h3>

<h6>Default</h6>
{#each colorPackNames as color}
	<Button {color} class="m-1">{color}</Button>
{/each}
<h6>Dark</h6>
<div class="dark">
	{#each colorPackNames as color}
		<Button {color} class="m-1">{color}</Button>
	{/each}
</div>

<h3>Input</h3>
<h6>Default</h6>
<Input />
<h6>Dropdown</h6>
<Input
	options={colorPackNames.flatMap((c, i) =>
		Array(i)
			.fill(c)
			.map((_, j) => `${c}-${j + 1}`)
	)}
/>

<h3>Table</h3>
<Table
	hover
	striped
	centering
	headers={['Name', 'Age', 'Gender']}
	data={Array.from({ length: 10 }).flatMap((_, i) => [
		['John', i, 'Male'],
		['Jane', i, 'Female'],
		['Bob', i, 'Male']
	])}
/>
