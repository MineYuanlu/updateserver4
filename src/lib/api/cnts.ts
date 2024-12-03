import { AllCount, type IAllCount } from '$lib/protos';
import { apiReq2 } from './common';

export const getCnts = (key: string, inc?: boolean) =>
	apiReq2<IAllCount | null>('/api/cnts', null, {
		method: 'POST',
		data: { get: key, inc },
		proto: AllCount,
	});
