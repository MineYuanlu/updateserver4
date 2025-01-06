import type { ListResp } from '../../routes/api/tag/list/+server';
import { apiReq2 } from './common';

export const listTags = (offset: number = 0, limit: number = 20, search?: string) =>
	apiReq2<ListResp>('/api/tag/list', [], { data: { offset, limit, search } });
