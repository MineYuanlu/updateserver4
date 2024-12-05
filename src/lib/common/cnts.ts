import {
	enum_cnts__project_cnt_type_simple_pie as project_cnt_type_simple_pie,
	enum_cnts__project_cnt_type_drilldown_pie as project_cnt_type_drilldown_pie,
	enum_cnts__project_cnt_type_single_line as project_cnt_type_single_line,
	enum_cnts__project_cnt_type_multi_line as project_cnt_type_multi_line,
	enum_cnts__project_cnt_type_bar as project_cnt_type_bar,
	enum_cnts__project_cnt_type_stacked_bar as project_cnt_type_stacked_bar,
	enum_cnts__project_cnt_type_scatter_2d as project_cnt_type_scatter_2d,
	enum_cnts__project_cnt_type_scatter_3d as project_cnt_type_scatter_3d,
	enum_cnts__project_cnt_type_map as project_cnt_type_map,
} from '$lib/paraglide/messages';
import { makeEnum } from './enum';
/** 通用计数器类型 */
export const cntTypes = {
	v: 'visit', // 访问
	d: 'download', // 下载
	c: 'check', // 检查
};
/** 通用计数器类型 */
export type CntType = keyof typeof cntTypes;

/** 获取计数器键 */
export function getKey(id: string, type: CntType) {
	return `${id}/${type}`;
}

/**
 * 项目计数器类型
 */
export const projCntTypes = makeEnum({
	simple_pie: [0, project_cnt_type_simple_pie], // 简单饼图
	drilldown_pie: [1, project_cnt_type_drilldown_pie], // 下钻饼图
	single_line: [2, project_cnt_type_single_line], // 单线图
	multi_line: [3, project_cnt_type_multi_line], // 多线图
	bar: [4, project_cnt_type_bar], // 柱状图
	stacked_bar: [5, project_cnt_type_stacked_bar], // 堆叠柱状图
	scatter_2d: [6, project_cnt_type_scatter_2d], // 散点图
	scatter_3d: [7, project_cnt_type_scatter_3d], // 三维散点图
	map: [8, project_cnt_type_map], // 地图
} as const);

/** 计数器维度过滤器 */
export type CntDimFilter = {
	/** 是否反选, 默认为false */
	inv?: boolean;
	/** 枚举过滤(白名单/黑名单), 优先于正则模式 */
	enum?: string[];
	/** 正则模式过滤 */
	regex?: string;
};
/** 计数器值过滤器 */
export type CntValueFilter = {
	/** 值范围, min ~ max; 最后一个代表模式, 不填代表0:
	 *  - 0: 闭区间
	 *  - 1: 开区间
	 *  - 2: 左开右闭
	 *  - 3: 左闭右开
	 *  - -1: 反选闭区间
	 *  - -2: 反选开区间
	 *  - -3: 反选左开右闭
	 *  - -4: 反选左闭右开
	 */
	range?: ([number, number] | [number, number, -4 | -3 | -2 | -1 | 0 | 1 | 2 | 3])[];

	/**
	 * 精度控制, 0表示取整, N表示保留N位小数, -N表示抹去低N位整数, undefined表示不控制
	 */
	fix?: number;
};

/** 计数器配置项: key需要分割 */
type CfgSplitDim = {
	split?: string;
};
type CfgNone = {};

export type CfgSimplePie = CfgNone;
export type CfgDrilldownPie = CfgSplitDim;
export type CfgSingleLine = CfgNone;
export type CfgMultiLine = CfgNone;
export type CfgBar = CfgNone;
export type CfgStackedBar = CfgNone;
export type CfgScatter2D = CfgNone;
export type CfgScatter3D = CfgSplitDim;
export type CfgMap = CfgSplitDim;
