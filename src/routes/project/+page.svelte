<script lang="ts">
	import BindValue from '$lib/components/BindValue.svelte';
	import Input from '$lib/components/Form/Input.svelte';

	let value = '';
</script>

<Input bind:value placeholder="Enter your project name" />
<BindValue bind="txt" bind:value replace />
