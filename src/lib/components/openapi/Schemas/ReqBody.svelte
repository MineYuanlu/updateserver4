<script lang="ts">
	import type { ParameterObject, RequestBodyObject } from 'openapi3-ts/oas30';
	let {
		param,
		value = $bindable(),
		noValue = $bindable(false),
		setInvalid,
	}: {
		param: RequestBodyObject;
		value?: any;
		noValue?: boolean;
		setInvalid?: (invalid: boolean) => void;
	} = $props();
	// description?: string;
	// content: ContentObject;
	// required?: boolean;
	let data: ParameterObject = {
		description: param.description,
		required: param.required,
		name: '',
		in: 'path',
	};
</script>
