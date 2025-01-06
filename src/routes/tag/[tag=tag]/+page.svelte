<script lang="ts">
	const { data } = $props();
	const { projects } = data;
</script>

<pre>{JSON.stringify(projects, null, 2)}</pre>
