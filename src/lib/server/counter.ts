import { and, eq, lt, sql } from 'drizzle-orm';
import { db } from './db';
import { deleteExpireCounts } from './db/funcs';
import { cnts } from './db/schema';

/**
 * 计数单位, 相对于Date.now()的单位(ms), 每一个都可以被前一个整除
 */
export const countUnit = [
	1000 * 60 * 30, // 0.5 小时
	1000 * 60 * 60 * 24, // 1天
	1000 * 60 * 60 * 24 * 7, // 1 周
] as const;

/**
 * 每个计数单位的过期阈值, 单位为个, 代表丢弃`now - expires * countUnit[i]` 之前的计数
 */
export const countExpires = [
	countUnit[0] * 60, // 1 天 6 小时
	countUnit[1] * 60, // 6 月
	countUnit[2] * 60, // 1 年 1 月 25 天
] as const;

let timePoint: number[] = [];
setInterval(() => {
	const now = Date.now();
	const news = countUnit.map((u) => (now / u) | 0);
	countUnit.forEach((u, i) => {
		if (u !== timePoint[i])
			db.delete(cnts)
				.where(and(eq(cnts.unit, i), lt(cnts.time, now - countExpires[i])))
				.execute();
	});
	timePoint = news;
}, 1000 * 30); // 每 30 秒删除过期计数一次

let cntCache: Record<number, Record<string, number>> = {
	// time - key - count
};

setInterval(async () => {
	const cache = cntCache;
	cntCache = Object.create(null);

	for (const _time in cache) {
		const time = parseInt(_time);
		const counts = cache[time];
		for (const name in counts) {
			const value = counts[name];
			if (!value) continue;
			db.insert(cnts)
				.values(
					countUnit.map((u, unit) => ({
						name,
						time: (time / u) | 0,
						value,
						unit,
					})),
				)
				.onConflictDoUpdate({
					target: [cnts.name, cnts.unit, cnts.time],
					set: {
						value: sql`cnts.value + EXCLUDED.value`,
					},
				});
		}
	}
}, 1000 * 60);

export function modCount(key: string, value: number = 1, time: number = Date.now()) {
	time = normTime(time);
	const cache = cntCache[time] || (cntCache[time] = Object.create(null));
	cache[key] = (cache[key] || 0) + value;
}

function normTime(t: number) {
	return ((t / countUnit[0]) | 0) * countUnit[0];
}
