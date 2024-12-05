import { AllCount } from '$lib/protos';
import { countUnit, insertFakeData, modCount } from '$lib/server/counter/core';
import { getSubCounts, getTotalCount } from '$lib/server/db/funcs';
import { checkRequestField, success_proto } from '../common';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async (req) => {
	const { get, inc } = checkRequestField(await req.request.json(), {
		get: isGet,
		inc: isInc,
	});

	if (inc) modCount(get);

	const buf = AllCount.encode(
		AllCount.create({
			total: await getTotalCount(get),
			data: await getSubCounts(get),
			units: countUnit.map((scale, u) => ({ u, scale })),
		}),
	).finish();
	return success_proto(buf);
};

function isGet(v: unknown): v is string {
	return typeof v === 'string';
}
function isInc(v: unknown): v is boolean {
	return typeof v === 'boolean' || typeof v === 'number' || typeof v === 'undefined';
}
