import { listTags } from '$lib/server/db/funcs';
import type { RequestHandler } from './$types';
import { createAPI } from '../../api.server';
import { z } from 'zod';

export type ListResp = Awaited<ReturnType<typeof listTags>>;

export const _GET = createAPI()
	.summary('获取标签列表')
	.description('获取标签名称及标签使用量')
	.query({
		offset: z.coerce.number().int().min(0).default(0),
		limit: z.coerce.number().int().min(1).max(1000).default(20),
		search: z.string().optional(),
	})
	.success<ListResp>(
		z.array(
			z.object({
				name: z.string(),
				count: z.number().int(),
			}),
		),
	)
	.tag('tag')
	.flatArgs(true);

export const GET: RequestHandler = _GET.handler(async (_, { offset, limit, search }, success) => {
	return success(await listTags(offset, limit, search));
});
