<script lang="ts">
	import Navbar from '../Navbar.svelte';
	const { data } = $props();
	const { proj, versions, tags } = data.project;
</script>
