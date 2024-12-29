import Ajv from 'ajv';
import AjvFormats from 'ajv-formats';
export const ajv = new Ajv({
	allErrors: true,
	strict: false
});
AjvFormats(ajv);

