<script lang="ts">
	const { data } = $props();
</script>

{@html `
<!-- <redoc spec-url='http://petstore.swagger.io/v2/swagger.json'></redoc> -->
 <redoc spec-url='http://localhost:5173/api/openAPI/openapi.json'></redoc>
    <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"> </script>`}

<div id="redoc-container"></div>

<style>
	:global(.redoc-wrap) {
		margin: 0;
	}
</style>
