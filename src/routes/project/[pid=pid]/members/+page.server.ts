import type { PageServerData } from './$types';
import { getProjectDetailById } from '$lib/server/db/funcs';
import type { ProjId } from '$lib/common/project';
import { listProjectUsers } from '$lib/server/db/funcs';

export type ProjectDetailResp = NonNullable<Awaited<ReturnType<typeof getProjectDetailById>>>;

export const load: PageServerData = async ({ params }) => {
	const pid = params.pid as ProjId;

	const members = await listProjectUsers(pid);

	return { members };
};
