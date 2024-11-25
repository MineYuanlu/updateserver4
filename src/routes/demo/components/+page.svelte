<script lang="ts">
	import { colorPackNames } from '$lib/components/color';
	import Button from '$lib/components/Form/Button.svelte';
	import Input from '$lib/components/Form/Input.svelte';
</script>

<h1>This is a demo page</h1>
<h3>Button</h3>

<h6>Default</h6>
{#each colorPackNames as color}
	<Button {color} class="m-1">123</Button>
{/each}
<h6>Dark</h6>
<div class="dark">
	{#each colorPackNames as color}
		<Button {color} class="m-1">123</Button>
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
