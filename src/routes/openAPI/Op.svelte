<script lang="ts">
	import type { OpenAPIObject, PathsObject, OperationObject } from 'openapi3-ts/oas30';
	import type { ApiParseCfg } from './apis';
	import { toLowerHttpMethod, type HttpMethod } from '$lib/api/common';
	let {
		data,
		cfg = {},
		display,
	}: {
		data: OpenAPIObject;
		cfg?: ApiParseCfg;
		display: [string, HttpMethod];
	} = $props();

	const op = $derived(data.paths[display[0]][toLowerHttpMethod(display[1])]);
</script>

<pre>
	{JSON.stringify(display, null, 2)}
</pre>
<pre>
	{JSON.stringify(op, null, 2)}
</pre>
