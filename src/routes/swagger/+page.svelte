<script lang="ts">
	import { onMount } from 'svelte';
	// import * as swaggerJson from './swagger.json';
	import SwaggerUI from 'swagger-ui';
	import 'swagger-ui/dist/swagger-ui.css';

	onMount(async () => {
		const api = '/api/swagger';
		// const api = 'https://petstore3.swagger.io/api/v3/openapi.json';
		const swaggerJson = await fetch(api).then((r) => r.json());
		SwaggerUI({
			spec: swaggerJson,
			dom_id: '#swagger-ui-container',
		});
	});
</script>

<svelte:head>
	<title>SwaggerUI</title>
</svelte:head>

<div id="swagger-ui-container"></div>
