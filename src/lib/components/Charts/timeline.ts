import type { ICountFrame, ICountUnit } from '$lib/protos';
import * as m from '$lib/paraglide/messages';

export const legend = (unit: number) => {
	const unitStr = m[`counter__unit_${unit as 0}`];
	return m.component_charts_time_line__legend({ unit: unitStr?.() ?? '' });
};
/**
 * 计数单位信息
 */
export class CountUnitInfo {
	/** idx -> scale */
	public idxToScale: Record<number, number>;
	public idx: number[];
	public legendToIdx: Record<string, number>;

	constructor(
		/** 计数单位信息`{u: idx, scale: scale}[]` */
		public units?: ICountUnit[] | undefined | null,
	) {
		this.idxToScale = this.units ? Object.fromEntries(this.units.map((x) => [x.u!, x.scale!])) : {};
		this.idx = this.units?.map?.((x) => x.u!) ?? [];
		this.legendToIdx = Object.fromEntries(this.idx.map((x) => [legend(x), x]));
	}
}

/**
 * 将分时计数数据转换为折线图数据
 * @param data 分时计数数据
 * @param info 计数单位信息
 * @param idx 计算的计数单位索引
 * @returns `{x: 时间数组, y: 计数数组}`
 */
export const series = (data: ICountFrame[], info: CountUnitInfo, idx: number) => {
	const _add: Map<number, number> = new Map();
	const add = (t: number, c: number) => _add.set(t, (_add.get(t) || 0) + c);
	data.forEach((d) => {
		if (d.u === -1) return;
		if (d.u === idx) {
			add(d.t!, d.c!);
		} else if (d.u! < idx) {
			// 在大范围低精度的统计上补全最后一个point的计数
			const point = (d.t! * (info.idxToScale[d.u!] / info.idxToScale[idx])) | 0;
			add(point, d.c!);
		}
	});
	const arr = Array.from(_add).sort((a, b) => a[0] - b[0]);
	const scale = info.idxToScale[idx];
	const x = arr.map(([point, _]) => new Date(point * scale).toLocaleString());
	const y = arr.map(([_, count]) => count);
	return { x, y };
};
/**
 * 将多个分时计数数据转换为多折线图数据
 * @param datas 分时计数数据数组
 * @param info 计数单位信息
 * @param idx 计算的计数单位索引
 * @returns `{x: 时间数组, y: 计数数组[]}`
 */
export const multiSeries = (
	datas: (ICountFrame[] | undefined | null)[],
	info: CountUnitInfo,
	idx: number,
) => {
	const _add: Map<number, number[]> = new Map();
	const add = (t: number, c: number, s: number) => {
		const series = _add.get(t) || Array.from({ length: datas.length }, () => 0);
		series[s] = (series[s] || 0) + c;
		_add.set(t, series);
	};
	datas.forEach((data, s) => {
		if (!data) return;
		data.forEach((d) => {
			if (d.u === -1) return;
			if (d.u === idx) {
				add(d.t!, d.c!, s);
			} else if (d.u! < idx) {
				// 在大范围低精度的统计上补全最后一个point的计数
				const point = (d.t! * (info.idxToScale[d.u!] / info.idxToScale[idx])) | 0;
				add(point, d.c!, s);
			}
		});
	});
	const arr = Array.from(_add).sort((a, b) => a[0] - b[0]);
	const scale = info.idxToScale[idx];
	const x = arr.map(([point, _]) => new Date(point * scale).toLocaleString());
	const y = datas.map((_, s) => arr.map(([_, series]) => series[s]));
	return { x, y };
};
