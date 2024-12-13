import { and, eq, lt, sql, sum } from 'drizzle-orm';
import { db } from '../db';
import { timeCnts } from '../db/schema';
import exitHook from 'exit-hook';
import { getLogger } from '../logger';
import { dev } from '$app/environment';

const logger = getLogger('counter');

/**
 * 计数单位, 相对于`Date.now()`的单位(ms), 每一个都可以被前一个整除
 */
export const countUnit = [
	1000 * 60 * 30, // 0.5 小时
	1000 * 60 * 60 * 24, // 1天
	1000 * 60 * 60 * 24 * 7, // 1 周
] as const;

/** 计数单位的id(0, 1, 2, ...) */
export const unitId: readonly number[] = countUnit.map((_, i) => i);

/**  计数单位倍数, `multi[i] * unit[i] = unit[i+1]` */
const countUnitMulti: readonly number[] = countUnit
	.filter((_, i) => i < countUnit.length - 1)
	.map((u, i) => countUnit[i + 1] / u);

/**
 * 每个计数单位的过期阈值, 相对于`Date.now()`的单位(ms), 代表丢弃`now - expires` 之前的计数
 */
export const countExpires = [
	countUnit[0] * 60, // 1 天 6 小时
	countUnit[1] * 60, // 6 月
	countUnit[2] * 60, // 1 年 1 月 25 天
] as const;

let cntCache: Record<number, Record<string, number>> = {
	// time - key - count
	// time: unit[0]下的时间点
	// key: 计数的名称
	// count: 计数值
};

/**
 * 修改计数
 * @param key 计数键
 * @param value 修改值, 默认为1
 * @param time 计数时间, 默认为当前时间
 */
export function modCount(key: string, value: number = 1, time: number = Date.now()) {
	time = (time / countUnit[0]) | 0;
	const cache = cntCache[time] || (cntCache[time] = Object.create(null));
	cache[key] = (cache[key] || 0) + value;
}

/**
 * 插入一批假数据, 会在过期时间内随机插入
 * @param key 计数键
 */
export async function insertFakeData(key: string, cnts: number = 10, flush: boolean = true) {
	if (!dev) throw new Error('仅开发环境下允许插入假数据');
	const timeMax = Date.now();
	const timeMin = timeMax - countExpires[countExpires.length - 1];

	for (let i = 0; i < cnts; i++) modCount(key, 1, timeMin + Math.random() * (timeMax - timeMin));
	if (flush) {
		await flushCache();
		for (const unit of unitId) {
			await flushExpire(unit, timeMax);
		}
	}
}

/**
 * 刷新过期数据: 将高精度计数合并写入低精度计数内, 并删除过期的高精度计数
 * @param unit 要刷新的计数单位(0, 1, 2, ...)
 * @param now 时间基准点, 默认为当前时间
 */
async function flushExpire(unit: number, now: number = Date.now()) {
	const cond = and(
		eq(timeCnts.unit, unit),
		lt(timeCnts.time, ((now - countExpires[unit]) / countUnit[unit]) | 0),
	);

	if (unit < countUnit.length - 1) {
		const multi = countUnitMulti[unit];
		await db
			.insert(timeCnts)
			.select(
				db
					.select({
						name: timeCnts.name,
						unit: sql`${unit + 1}`.as('unit'),
						time: sql<number>`FLOOR(${timeCnts.time} / ${multi})`.as('time'),
						value: sum(timeCnts.value).as('value'),
					})
					.from(timeCnts)
					.where(cond)
					.groupBy(timeCnts.name, sql`FLOOR(${timeCnts.time} / ${multi})`),
			)
			.onConflictDoUpdate({
				target: [timeCnts.name, timeCnts.unit, timeCnts.time],
				set: {
					value: sql`${timeCnts.value} + EXCLUDED.value`,
				},
			})
			.execute();
	}
	await db.delete(timeCnts).where(cond).execute();
}
/**
 * 重置缓存计数数据, 并插入到最小计数区间
 */
async function flushCache() {
	const cache = cntCache;
	cntCache = Object.create(null);

	if (
		((obj) => {
			for (const key in obj) if (Object.prototype.hasOwnProperty.call(obj, key)) return false;
			return true;
		})(cache)
	)
		return;

	await db.transaction(async (trx) => {
		for (const _time in cache) {
			const time = parseInt(_time);
			const counts = cache[time];
			for (const name in counts) {
				const value = counts[name];
				if (!value) return;
				await trx
					.insert(timeCnts)
					.values([
						{
							name,
							unit: 0,
							time,
							value,
						},
						{
							name,
							unit: -1,
							time: 0,
							value,
						},
					])
					.onConflictDoUpdate({
						target: [timeCnts.name, timeCnts.unit, timeCnts.time],
						set: {
							value: sql`${timeCnts.value} + EXCLUDED.value`,
						},
					})
					.execute();
			}
		}
	});
}

(() => {
	//check countUnitMulti
	countUnitMulti.forEach((m, i) => {
		if ((m | 0) !== m) throw new Error('非整数倍计数单位');
		if (m <= 1) throw new Error('非正数计数单位');
		if (countUnit[i] * m !== countUnit[i + 1]) throw new Error('计数单位不匹配');
	});

	let timePoint: number[] = [];
	const interval1 = setInterval(async () => {
		// 过期数据放入更大的计数区间, 并删除
		const now = Date.now();
		const news = countUnit.map((u) => (now / u) | 0);
		const olds = timePoint;
		timePoint = [...news];
		for (let i = 0; i < countUnit.length; i++) {
			if (news[i] === olds[i]) continue;
			logger.trace(`清理计数区间 ${i} ${olds[i]} -> ${news[i]}`);
			await flushExpire(i, now);
		}
	}, 1000 * 30); // 每 30 秒测试删除过期计数一次

	const interval2 = setInterval(flushCache, 1000 * 60);

	exitHook(() => {
		logger.info('计数器worker退出清理...');
		clearInterval(interval1);
		clearInterval(interval2);
		flushCache();
		logger.info('计数器worker退出完成');
	});

	logger.info('计数器worker初始化完成');
})();
