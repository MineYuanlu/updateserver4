import {
	ZodParsedType,
	util,
	ZodIssueCode,
	type ZodErrorMap,
	type ZodIssueOptionalMessage,
	type ErrorMapCtx,
} from 'zod';
import * as m from '$lib/paraglide/messages';

const errorMap: ZodErrorMap = (issue: ZodIssueOptionalMessage, _ctx: ErrorMapCtx) => {
	let message: string;

	switch (issue.code) {
		case ZodIssueCode.invalid_type:
			if (issue.received === ZodParsedType.undefined) {
				// message = "Required";
				message = m.zod_invalid_type_undefined();
			} else {
				// message = `Expected ${issue.expected}, received ${issue.received}`;
				message = m.zod_invalid_type(issue);
			}
			break;

		case ZodIssueCode.invalid_literal:
			// message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
			message = m.zod_invalid_literal({
				expected: JSON.stringify(issue.expected, util.jsonStringifyReplacer),
			});
			break;

		case ZodIssueCode.unrecognized_keys:
			// message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys ?? [], ', ')}`;
			message = m.zod_unrecognized_keys({ keys: util.joinValues(issue.keys ?? [], ', ') });
			break;

		case ZodIssueCode.invalid_union:
			// message = `Invalid input`;
			message = m.zod_invalid_union();
			break;

		case ZodIssueCode.invalid_union_discriminator:
			// message = `Invalid discriminator value. Expected ${util.joinValues(issue.options ?? [])}`;
			message = m.zod_invalid_union_discriminator({
				options: util.joinValues(issue.options ?? []),
			});
			break;

		case ZodIssueCode.invalid_enum_value:
			// message = `Invalid enum value. Expected ${util.joinValues(issue.options ?? [])}, received '${issue.received}'`;
			message = m.zod_invalid_enum_value({
				options: util.joinValues(issue.options ?? []),
				received: issue.received,
			});
			break;

		case ZodIssueCode.invalid_arguments:
			// message = `Invalid function arguments`;
			message = m.zod_invalid_arguments();
			break;

		case ZodIssueCode.invalid_return_type:
			// message = `Invalid function return type`;
			message = m.zod_invalid_return_type();
			break;

		case ZodIssueCode.invalid_date:
			// message = `Invalid date`;
			message = m.zod_invalid_date();
			break;

		case ZodIssueCode.invalid_string:
			if (typeof issue.validation === 'object') {
				if ('includes' in issue.validation) {
					// message = `Invalid input: must include "${issue.validation.includes}"`;
					// if (typeof issue.validation.position === 'number') {
					// 	message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
					// }
					if (typeof issue.validation.position === 'number') {
						message = m.zod_invalid_string_includes_position({
							expected: issue.validation.includes,
							position: issue.validation.position,
						});
					} else {
						message = m.zod_invalid_string_includes({
							expected: issue.validation.includes,
						});
					}
				} else if ('startsWith' in issue.validation) {
					// message = `Invalid input: must start with "${issue.validation.startsWith}"`;
					message = m.zod_invalid_string_starts_with({
						expected: issue.validation.startsWith,
					});
				} else if ('endsWith' in issue.validation) {
					// message = `Invalid input: must end with "${issue.validation.endsWith}"`;
					message = m.zod_invalid_string_ends_with({
						expected: issue.validation.endsWith,
					});
				} else {
					util.assertNever(issue.validation);
				}
			} else if (issue.validation !== 'regex') {
				// message = `Invalid ${issue.validation}`;
				message = m.zod_invalid_string_regex(issue);
			} else {
				// message = 'Invalid';
				message = m.zod_invalid_string();
			}
			break;

		case ZodIssueCode.too_small:
			if (issue.type === 'array') {
				// message = `Array must contain ${issue.exact ? 'exactly' : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
				if (issue.exact) message = m.zod_too_small_array_exact(issue);
				else if (issue.inclusive) message = m.zod_too_small_array_inclusive(issue);
				else message = m.zod_too_small_array_exclusive(issue);
			} else if (issue.type === 'string') {
				// message = `String must contain ${issue.exact ? 'exactly' : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
				if (issue.exact) message = m.zod_too_small_string_exact(issue);
				else if (issue.inclusive) message = m.zod_too_small_string_inclusive(issue);
				else message = m.zod_too_small_string_exclusive(issue);
			} else if (issue.type === 'number') {
				// message = `Number must be ${
				// 	issue.exact
				// 		? `exactly equal to `
				// 		: issue.inclusive
				// 			? `greater than or equal to `
				// 			: `greater than `
				// }${issue.minimum}`;
				if (issue.exact) message = m.zod_too_small_number_exact(issue);
				else if (issue.inclusive) message = m.zod_too_small_number_inclusive(issue);
				else message = m.zod_too_small_number_exclusive(issue);
			} else if (issue.type === 'date') {
				// message = `Date must be ${
				// 	issue.exact
				// 		? `exactly equal to `
				// 		: issue.inclusive
				// 			? `greater than or equal to `
				// 			: `greater than `
				// }${new Date(Number(issue.minimum))}`;
				if (issue.exact) message = m.zod_too_small_date_exact(issue);
				else if (issue.inclusive) message = m.zod_too_small_date_inclusive(issue);
				else message = m.zod_too_small_date_exclusive(issue);
			} else {
				// message = 'Invalid input';
				message = m.zod_too_small();
			}
			break;

		case ZodIssueCode.too_big:
			if (issue.type === 'array') {
				// message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
				if (issue.exact) message = m.zod_too_big_array_exact(issue);
				else if (issue.inclusive) message = m.zod_too_big_array_inclusive(issue);
				else message = m.zod_too_big_array_exclusive(issue);
			} else if (issue.type === 'string') {
				// message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
				if (issue.exact) message = m.zod_too_big_string_exact(issue);
				else if (issue.inclusive) message = m.zod_too_big_string_inclusive(issue);
				else message = m.zod_too_big_string_exclusive(issue);
			} else if (issue.type === 'number') {
				// message = `Number must be ${
				// 	issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`
				// } ${issue.maximum}`;
				if (issue.exact) message = m.zod_too_big_number_exact(issue);
				else if (issue.inclusive) message = m.zod_too_big_number_inclusive(issue);
				else message = m.zod_too_big_number_exclusive(issue);
			} else if (issue.type === 'bigint') {
				// message = `BigInt must be ${
				// 	issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`
				// } ${issue.maximum}`;
				if (issue.exact) message = m.zod_too_big_bigint_exact(issue);
				else if (issue.inclusive) message = m.zod_too_big_bigint_inclusive(issue);
				else message = m.zod_too_big_bigint_exclusive(issue);
			} else if (issue.type === 'date') {
				// message = `Date must be ${
				// 	issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`
				// } ${new Date(Number(issue.maximum))}`;
				if (issue.exact) message = m.zod_too_big_date_exact(issue);
				else if (issue.inclusive) message = m.zod_too_big_date_inclusive(issue);
				else message = m.zod_too_big_date_exclusive(issue);
			} else {
				// message = 'Invalid input';
				message = m.zod_too_big();
			}
			break;

		case ZodIssueCode.custom:
			// message = `Invalid input`;
			message = m.zod_custom();
			break;

		case ZodIssueCode.invalid_intersection_types:
			// message = `Intersection results could not be merged`;
			message = m.zod_invalid_intersection_types();
			break;

		case ZodIssueCode.not_multiple_of:
			// message = `Number must be a multiple of ${issue.multipleOf}`;
			message = m.zod_not_multiple_of(issue);
			break;

		case ZodIssueCode.not_finite:
			// message = 'Number must be finite';
			message = m.zod_not_finite();
			break;

		default:
			message = _ctx.defaultError;
			util.assertNever(issue);
	}

	return { message };
};

export default errorMap;
